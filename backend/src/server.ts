import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/db';
import { reminderService } from './services/reminder.service';

const startServer = async () => {
  console.log('🚀 Initializing AmongU Backend Service...');

  // 1. Establish MongoDB connection
  await connectDatabase();

  // 2. Start automated periodic 24-hr reminder scheduler for unpaid cadets
  reminderService.startPeriodicReminderScheduler();

  // 3. Start HTTP listener
  app.listen(env.PORT, () => {
    console.log(`=================================================`);
    console.log(`✨ AmongU API Server is running on port ${env.PORT}`);
    console.log(`📡 Environment: ${env.NODE_ENV}`);
    console.log(`🔒 Allowed CORS Origin: ${env.CORS_ORIGIN}`);
    console.log(`🎟️  Registration Fee: ₹${env.REGISTRATION_FEE_INR}`);
    console.log(`⚡ Registration Open: ${env.REGISTRATION_OPEN}`);
    console.log(`🛡️  Admin Emails: ${env.ADMIN_EMAILS.join(', ')}`);
    console.log(`=================================================`);
  });
};

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
