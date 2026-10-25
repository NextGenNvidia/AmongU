import { User } from '../models/User';
import { Registration } from '../models/Registration';
import { EventConfig } from '../models/EventConfig';
import { mailService } from './mail.service';
import { env } from '../config/env';

const RATE_LIMIT_DELAY_MS = 350; // Delay between sequential SMTP sends to avoid socket flooding
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export interface ReminderRunResult {
  totalUsers: number;
  paidCount: number;
  unpaidCount: number;
  eligibleCount: number;
  sentCount: number;
  failedCount: number;
  timestamp: Date;
}

class ReminderService {
  private isProcessing: boolean = false;
  private schedulerInterval: NodeJS.Timeout | null = null;

  /**
   * Scan all signed-in users, identify unpaid cadets, and dispatch 24-hr reminder emails
   * @param force If true (e.g. manual admin trigger), bypasses the 24-hr elapsed check for unpaid users
   */
  async processUnpaidRegistrationReminders(force: boolean = false): Promise<ReminderRunResult> {
    const config = await EventConfig.findOne({ key: 'main_event' }).lean();
    const remindersEnabled = config?.remindersEnabled ?? false;

    if (!remindersEnabled && !force) {
      console.log('🛑 [Reminder Service] 24-hour reminder engine is currently stopped by admin. Skipping reminder scan.');
      return {
        totalUsers: 0,
        paidCount: 0,
        unpaidCount: 0,
        eligibleCount: 0,
        sentCount: 0,
        failedCount: 0,
        timestamp: new Date(),
      };
    }

    if (!env.REGISTRATION_OPEN && !force) {
      console.log('🛑 [Reminder Service] Registrations are closed. Skipping reminder scan.');
      return {
        totalUsers: 0,
        paidCount: 0,
        unpaidCount: 0,
        eligibleCount: 0,
        sentCount: 0,
        failedCount: 0,
        timestamp: new Date(),
      };
    }

    if (this.isProcessing) {
      console.warn('⚠️ [Reminder Service] A reminder transmission cycle is already currently running. Skipping duplicate call.');
      return {
        totalUsers: 0,
        paidCount: 0,
        unpaidCount: 0,
        eligibleCount: 0,
        sentCount: 0,
        failedCount: 0,
        timestamp: new Date(),
      };
    }

    this.isProcessing = true;
    const now = Date.now();
    console.log(`\n======================================================`);
    console.log(`🚀 [Reminder Service] Commencing unpaid registration reminder scan (Force: ${force})...`);

    try {
      // 1. Fetch all users and all successfully confirmed registrations
      const [allUsers, paidRegistrations] = await Promise.all([
        User.find().sort({ createdAt: -1 }),
        Registration.find({ paymentStatus: 'success' }).select('firebaseUid email paymentStatus').lean(),
      ]);

      const paidUids = new Set<string>();
      const paidEmails = new Set<string>();

      for (const reg of paidRegistrations) {
        if (reg.firebaseUid) paidUids.add(reg.firebaseUid);
        if (reg.email) paidEmails.add(reg.email.toLowerCase().trim());
      }

      // 2. Filter to cadets who have signed up but NOT completed paid registration
      const unpaidUsers = allUsers.filter((u) => {
        if (u.isBlocked) return false;
        const isPaid = paidUids.has(u.firebaseUid) || paidEmails.has(u.email.toLowerCase().trim());
        return !isPaid;
      });

      // 3. Determine which unpaid users are eligible right now
      const eligibleUsers = unpaidUsers.filter((u) => {
        if (force) {
          // If forced, only avoid users sent within the last 5 minutes to prevent instant duplicate blasts
          if (u.lastReminderSentAt && now - new Date(u.lastReminderSentAt).getTime() < 5 * 60 * 1000) {
            return false;
          }
          return true;
        }

        // Automatic 24-hr schedule:
        // Case A: Never received a reminder yet -> eligible!
        if (!u.lastReminderSentAt) {
          return true;
        }

        // Case B: Last reminder was sent 24+ hours ago -> eligible!
        const elapsed = now - new Date(u.lastReminderSentAt).getTime();
        return elapsed >= TWENTY_FOUR_HOURS_MS;
      });

      console.log(`📊 [Reminder Service] Stats: Total Users: ${allUsers.length} | Confirmed Paid: ${paidRegistrations.length} | Total Unpaid: ${unpaidUsers.length} | Eligible for Dispatch Now: ${eligibleUsers.length}`);

      let sentCount = 0;
      let failedCount = 0;

      // 4. Sequentially dispatch emails with small delays
      for (const cadet of eligibleUsers) {
        try {
          const success = await mailService.sendRegistrationReminderEmail(cadet.email, cadet.name);
          if (success) {
            sentCount++;
            cadet.lastReminderSentAt = new Date();
            await cadet.save();
          } else {
            failedCount++;
          }
        } catch (dispatchErr: any) {
          console.error(`❌ [Reminder Service] Error sending reminder to ${cadet.email}:`, dispatchErr.message);
          failedCount++;
        }

        // Rate-limiting delay to avoid spam filters and socket limits
        if (eligibleUsers.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
        }
      }

      // 5. Update global EventConfig tracking
      if (sentCount > 0 || force) {
        await EventConfig.findOneAndUpdate(
          { key: 'main_event' },
          {
            $set: {
              lastReminderSentAt: new Date(),
              lastReminderSentCount: sentCount,
            },
          },
          { upsert: true, new: true }
        );
      }

      console.log(`✅ [Reminder Service] Cycle finished! Dispatched: ${sentCount} | Failed: ${failedCount}`);
      console.log(`======================================================\n`);

      return {
        totalUsers: allUsers.length,
        paidCount: paidRegistrations.length,
        unpaidCount: unpaidUsers.length,
        eligibleCount: eligibleUsers.length,
        sentCount,
        failedCount,
        timestamp: new Date(),
      };
    } catch (err: any) {
      console.error('❌ [Reminder Service] Failed to process registration reminders:', err);
      throw err;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Start periodic background timer: runs initial check on launch, then checks hourly for users who hit 24-hr mark
   */
  startPeriodicReminderScheduler() {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
    }

    console.log('⏰ [Reminder Service] Initializing periodic reminder scheduler (checks every hour for 24-hr milestones)...');

    // Run first check 12 seconds after server boot (ensuring database and SMTP are verified)
    setTimeout(() => {
      this.processUnpaidRegistrationReminders(false).catch((err) => {
        console.warn('⚠️ [Reminder Service] Initial startup reminder cycle encountered an issue:', err.message);
      });
    }, 12000);

    // Repeat check every 1 hour (so users who joined at e.g. 2 PM get reminded at 2 PM the next day)
    const ONE_HOUR_MS = 60 * 60 * 1000;
    this.schedulerInterval = setInterval(() => {
      this.processUnpaidRegistrationReminders(false).catch((err) => {
        console.warn('⚠️ [Reminder Service] Scheduled hourly reminder cycle encountered an issue:', err.message);
      });
    }, ONE_HOUR_MS);
  }

  /**
   * Retrieve current reminder status for admin dashboard
   */
  async getReminderStatus() {
    const config = await EventConfig.findOne({ key: 'main_event' }).lean();

    const [allUsers, paidRegistrations] = await Promise.all([
      User.find().select('firebaseUid email isBlocked lastReminderSentAt').lean(),
      Registration.find({ paymentStatus: 'success' }).select('firebaseUid email').lean(),
    ]);

    const paidUids = new Set<string>();
    const paidEmails = new Set<string>();
    for (const r of paidRegistrations) {
      if (r.firebaseUid) paidUids.add(r.firebaseUid);
      if (r.email) paidEmails.add(r.email.toLowerCase().trim());
    }

    const unpaidCount = allUsers.filter(
      (u) => !u.isBlocked && !paidUids.has(u.firebaseUid) && !paidEmails.has(u.email.toLowerCase().trim())
    ).length;

    return {
      lastReminderSentAt: config?.lastReminderSentAt || null,
      lastReminderSentCount: config?.lastReminderSentCount || 0,
      totalUnpaidCadets: unpaidCount,
      totalRegisteredCadets: paidRegistrations.length,
      totalCadets: allUsers.length,
      remindersEnabled: config?.remindersEnabled ?? false,
    };
  }

  /**
   * Enable or stop the automated 24-hr reminder engine
   */
  async setRemindersEnabled(enabled: boolean): Promise<boolean> {
    const config = await EventConfig.findOneAndUpdate(
      { key: 'main_event' },
      { $set: { remindersEnabled: enabled } },
      { upsert: true, new: true }
    );
    console.log(`⚙️ [Reminder Service] 24-Hour reminder engine state set to: ${enabled ? 'ENABLED' : 'STOPPED'}`);
    return Boolean(config.remindersEnabled);
  }
}

export const reminderService = new ReminderService();
