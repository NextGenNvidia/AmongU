import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';

class MailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    if (env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER.trim(),
          pass: env.SMTP_PASS.replace(/\s+/g, ''),
        },
      });

      this.isConfigured = true;
      this.transporter.verify((error) => {
        if (error) {
          console.warn('⚠️ [Mail Service] SMTP credentials failed verification:', error.message);
          this.isConfigured = false;
        } else {
          console.log(`📧 [Mail Service] SMTP Transporter connected successfully (${env.SMTP_HOST}:${env.SMTP_PORT} as ${env.SMTP_USER})`);
        }
      });
    } else {
      console.log('ℹ️ [Mail Service] SMTP credentials not set in .env. Running in simulated console dispatch mode.');
    }
  }

  /**
   * Dispatch 6-digit clearance transmission passcode (OTP)
   */
  async sendOtpEmail(toEmail: string, otpCode: string, name: string = 'Cadet'): Promise<boolean> {
    const subject = `🚨 [AmongU Clearance] Transmission Passcode: ${otpCode}`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0e14; color: #f3f4f6; margin: 0; padding: 20px; }
        .container { max-width: 550px; margin: 0 auto; background: #111827; border: 3px solid #000; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { background: #c51111; padding: 25px 20px; text-align: center; border-bottom: 3px solid #000; }
        .header h1 { margin: 0; font-size: 28px; color: #ffffff; letter-spacing: 2px; text-transform: uppercase; }
        .badge { display: inline-block; background: #000; color: #50ef39; font-weight: bold; font-size: 12px; padding: 4px 12px; border-radius: 9999px; margin-top: 8px; border: 1px solid #50ef39; }
        .content { padding: 30px 25px; text-align: center; }
        .greeting { font-size: 18px; font-weight: bold; color: #38fedc; margin-bottom: 12px; }
        .message { color: #d1d5db; font-size: 14px; line-height: 1.6; margin-bottom: 25px; }
        .code-box { background: #000000; border: 2px solid #38fedc; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; color: #38fedc; letter-spacing: 10px; margin: 0; }
        .expiry { color: #9ca3af; font-size: 12px; margin-top: 8px; }
        .alert-box { background: rgba(197, 17, 17, 0.2); border-left: 4px solid #c51111; padding: 12px; text-align: left; font-size: 12px; color: #fca5a5; margin-top: 25px; border-radius: 4px; }
        .footer { background: #0b0e14; padding: 20px; text-align: center; border-top: 2px solid #1f2937; font-size: 11px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AMONG U</h1>
          <span class="badge">EMERGENCY CLEARANCE ARRAY</span>
        </div>
        <div class="content">
          <div class="greeting">Greetings, Cadet ${name}!</div>
          <p class="message">
            Your clearance transmission has reached the Skeld communication tower. Use the 6-digit passcode below to validate your official KIET account and finalize your seat.
          </p>
          <div class="code-box">
            <div class="code">${otpCode}</div>
            <div class="expiry">Passcode valid for 10 minutes • Do not share with Impostors</div>
          </div>
          <div class="alert-box">
            ⚠️ <strong>Security Notice:</strong> If you did not initiate this registration for AmongU Hackathon, please ignore this transmission.
          </div>
        </div>
        <div class="footer">
          AmongU Hackathon 2026 • KIET Deemed to be University • Innovation &amp; Social Deduction
        </div>
      </div>
    </body>
    </html>
    `;

    console.log(`\n======================================================`);
    console.log(`📨 [MAIL DISPATCH] Transmission Passcode`);
    console.log(`🎯 Recipient: ${toEmail} (${name})`);
    console.log(`🔑 OTP Code: ${otpCode}`);
    console.log(`⏰ Expiry: 10 minutes`);

    if (this.isConfigured && this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: env.SMTP_FROM,
          to: toEmail,
          subject,
          html: htmlContent,
        });
        console.log(`✅ [Mail Service] Real email dispatched via SMTP! Message ID: ${info.messageId}`);
        console.log(`======================================================\n`);
        return true;
      } catch (err: any) {
        console.error(`❌ [Mail Service] Failed to send email via SMTP:`, err.message);
        console.log(`======================================================\n`);
        return false;
      }
    } else {
      console.log(`💡 [Simulated Dispatch] To send real emails, add SMTP_USER & SMTP_PASS in backend/.env`);
      console.log(`======================================================\n`);
      return true;
    }
  }

  /**
   * Dispatch clean registration confirmation email upon payment
   */
  async sendTicketEmail(toEmail: string, ticket: any): Promise<boolean> {
    const subject = `Registration Confirmed - AmongU Hackathon (${ticket.name})`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0e14; color: #f3f4f6; margin: 0; padding: 20px; }
        .container { max-width: 560px; margin: 0 auto; background: #111827; border: 2px solid #374151; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.4); }
        .header { background: #1f2937; padding: 20px; text-align: center; border-bottom: 2px solid #374151; }
        .header h1 { margin: 0; font-size: 22px; color: #ffffff; letter-spacing: 1px; }
        .badge { display: inline-block; background: #064e3b; color: #34d399; font-weight: bold; font-size: 12px; padding: 4px 12px; border-radius: 9999px; margin-top: 6px; border: 1px solid #059669; }
        .body-content { padding: 25px 20px; }
        .summary-card { background: #000000; border: 1px solid #374151; border-radius: 10px; padding: 18px; margin: 18px 0; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1f2937; font-size: 13px; }
        .row:last-child { border-bottom: none; }
        .label { color: #9ca3af; }
        .val { color: #ffffff; font-weight: bold; }
        .btn { display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; padding: 12px 24px; border-radius: 8px; margin-top: 15px; }
        .footer { background: #0b0e14; padding: 16px; text-align: center; border-top: 1px solid #1f2937; font-size: 11px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AmongU Hackathon 2026</h1>
          <span class="badge">REGISTRATION CONFIRMED • ₹55 PAID</span>
        </div>
        <div class="body-content">
          <p style="color: #ffffff; font-size: 16px; font-weight: bold; margin-top: 0;">
            Hello ${ticket.name},
          </p>
          <p style="color: #d1d5db; font-size: 14px; line-height: 1.6;">
            Your registration and payment for <strong>AmongU Hackathon</strong> have been successfully confirmed.
          </p>
          
          <div class="summary-card">
            <div class="row"><span class="label">Participant Name:</span><span class="val">${ticket.name}</span></div>
            <div class="row"><span class="label">College ID:</span><span class="val">${ticket.collegeId}</span></div>
            <div class="row"><span class="label">Email Address:</span><span class="val">${toEmail}</span></div>
            <div class="row"><span class="label">Department:</span><span class="val">${ticket.branch} (Year ${ticket.year}, Sec ${ticket.section})</span></div>
            <div class="row"><span class="label">Chosen Track:</span><span class="val">${ticket.track || 'Web Development'}</span></div>
            <div class="row"><span class="label">Payment ID:</span><span class="val" style="color: #34d399;">${ticket.paymentId || 'CONFIRMED'}</span></div>
            <div class="row"><span class="label">Fee Paid:</span><span class="val">₹55.00 (INR)</span></div>
          </div>

          <div style="text-align: center; margin: 25px 0;">
            <a href="https://amongu.vercel.app/dashboard" class="btn" style="color: #ffffff;">
              Go to Your Dashboard →
            </a>
          </div>

          <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; text-align: center;">
            You can sign in anytime to view your team allocations, event schedule, and announcements.
          </p>
        </div>
        <div class="footer">
          AmongU Hackathon • KIET Deemed to be University, Ghaziabad
        </div>
      </div>
    </body>
    </html>
    `;

    console.log(`\n======================================================`);
    console.log(`🎟️ [MAIL DISPATCH] Boarding Pass Ticket Confirmation`);
    console.log(`🎯 Recipient: ${toEmail} (${ticket.name})`);
    console.log(`💳 Payment ID: ${ticket.paymentId}`);
    console.log(`🎓 College ID: ${ticket.collegeId}`);

    if (this.isConfigured && this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: env.SMTP_FROM,
          to: toEmail,
          subject,
          html: htmlContent,
        });
        console.log(`✅ [Mail Service] Ticket email dispatched via SMTP! Message ID: ${info.messageId}`);
        console.log(`======================================================\n`);
        return true;
      } catch (err: any) {
        console.error(`❌ [Mail Service] Failed to send ticket email:`, err.message);
        console.log(`======================================================\n`);
        return false;
      }
    } else {
      console.log(`💡 [Simulated Dispatch] To send real emails, add SMTP_USER & SMTP_PASS in backend/.env`);
      console.log(`======================================================\n`);
      return true;
    }
  }

  /**
   * Dispatch 24-hour periodic reminder email to cadets who haven't completed registration/payment
   */
  async sendRegistrationReminderEmail(toEmail: string, name: string = 'Cadet'): Promise<boolean> {
    const subject = `🚨 [AmongU Action Required] Cadet ${name}, Your Seat Reservation is Pending!`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #070b14; color: #f3f4f6; margin: 0; padding: 20px; }
        .container { max-width: 550px; margin: 0 auto; background: #0f172a; border: 3px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.7); }
        .header { background: linear-gradient(135deg, #c51111 0%, #7f1d1d 100%); padding: 25px 20px; text-align: center; border-bottom: 3px solid #000; }
        .header h1 { margin: 0; font-size: 26px; color: #ffffff; letter-spacing: 2px; text-transform: uppercase; font-weight: 900; }
        .badge { display: inline-block; background: #000000; color: #facc15; font-weight: 800; font-size: 11px; padding: 5px 14px; border-radius: 9999px; margin-top: 10px; border: 1px solid #facc15; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 30px 25px; }
        .greeting { font-size: 20px; font-weight: 800; color: #38fedc; margin-bottom: 12px; }
        .message { color: #cbd5e1; font-size: 14px; line-height: 1.6; margin-bottom: 20px; }
        .card { background: #000000; border: 2px solid #ef4444; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .card-title { color: #ef4444; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
        .card-text { color: #94a3b8; font-size: 13px; margin: 0; line-height: 1.5; }
        .perks { margin: 20px 0; padding: 0; list-style: none; }
        .perks li { padding: 6px 0; font-size: 13px; color: #e2e8f0; display: flex; align-items: center; }
        .btn-wrapper { text-align: center; margin: 30px 0 15px 0; }
        .btn { display: inline-block; background: #c51111; color: #ffffff !important; font-weight: 900; font-size: 15px; padding: 14px 32px; border-radius: 9999px; text-decoration: none; text-transform: uppercase; letter-spacing: 1.5px; border: 2px solid #000; box-shadow: 0 4px 15px rgba(197,17,17,0.5); }
        .note { color: #64748b; font-size: 11px; text-align: center; line-height: 1.5; margin-top: 15px; }
        .footer { background: #020617; padding: 16px; text-align: center; font-size: 11px; color: #475569; border-top: 1px solid #1e293b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 EMERGENCY MEETING</h1>
          <div class="badge">MISSION ALERT • SEAT RESERVATION PENDING</div>
        </div>
        <div class="content">
          <div class="greeting">Greetings, Cadet ${name}!</div>
          <p class="message">
            We noticed you initiated your clearance for <strong>AmongU Hackathon 2026</strong> at KIET Deemed to be University, but your registration has <strong>not yet been completed or paid</strong>.
          </p>

          <div class="card">
            <div class="card-title">⚠️ LIMITED SLOTS REMAINING</div>
            <p class="card-text">
              Seats are allocated on a strictly first-come, first-served basis. Secure your spot now before ship capacity is reached and registration shuts down!
            </p>
          </div>

          <p style="color: #38fedc; font-weight: 700; font-size: 13px; margin-bottom: 5px; text-transform: uppercase;">
            What Awaits You Onboard:
          </p>
          <ul class="perks">
            <li>💰 <strong>₹10,000 Cash Prize Pool</strong> + exclusive trophy & certificates</li>
            <li>🕵️ <strong>Social Deduction Mechanics</strong>: Code, collaborate, and identify the covert Impostor</li>
            <li>🍕 <strong>Food, Fuel & Crewmate Swag</strong> throughout the hackathon</li>
            <li>🤝 <strong>Squad Formations & Mentorship</strong> under NextGen Supercomputing Club</li>
          </ul>

          <div class="btn-wrapper">
            <a href="https://amongu.vercel.app/portal/cadet-clearance-7b92" class="btn">
              Complete Clearance &amp; Pay (₹55) →
            </a>
          </div>

          <p class="note">
            ⚡ <em>Already paid or changed your mind? Once your clearance is confirmed, this reminder timer will automatically deactivate.</em>
          </p>
        </div>
        <div class="footer">
          AmongU Hackathon • Organized by NextGen Supercomputing Club • KIET Deemed to be University
        </div>
      </div>
    </body>
    </html>
    `;

    console.log(`\n======================================================`);
    console.log(`⏰ [MAIL DISPATCH] 24-Hour Registration Reminder`);
    console.log(`🎯 Recipient: ${toEmail} (${name})`);

    if (this.isConfigured && this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: env.SMTP_FROM,
          to: toEmail,
          subject,
          html: htmlContent,
        });
        console.log(`✅ [Mail Service] Reminder email dispatched via SMTP! Message ID: ${info.messageId}`);
        console.log(`======================================================\n`);
        return true;
      } catch (err: any) {
        console.error(`❌ [Mail Service] Failed to send reminder email:`, err.message);
        console.log(`======================================================\n`);
        return false;
      }
    } else {
      console.log(`💡 [Simulated Dispatch] To send real emails, ensure SMTP credentials in backend/.env`);
      console.log(`======================================================\n`);
      return true;
    }
  }
}

export const mailService = new MailService();

