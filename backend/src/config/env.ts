import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables strictly from .env file
dotenv.config();

const envSchema = z.object({
  PORT: z
    .string({ required_error: 'PORT is strictly required in .env' })
    .min(1, 'PORT cannot be empty')
    .transform((val) => {
      const num = parseInt(val, 10);
      if (isNaN(num)) {
        throw new Error('PORT must be a valid integer number');
      }
      return num;
    }),
  NODE_ENV: z.enum(['development', 'production', 'test'], {
    required_error: 'NODE_ENV is strictly required in .env (development | production | test)',
  }),
  CORS_ORIGIN: z
    .string({ required_error: 'CORS_ORIGIN is strictly required in .env' })
    .min(1, 'CORS_ORIGIN cannot be empty'),
  MONGO_URI: z
    .string({ required_error: 'MONGO_URI is strictly required in .env' })
    .min(1, 'MONGO_URI cannot be empty'),
  REGISTRATION_FEE_INR: z
    .string({ required_error: 'REGISTRATION_FEE_INR is strictly required in .env' })
    .min(1, 'REGISTRATION_FEE_INR cannot be empty')
    .transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num) || num <= 0) {
        throw new Error('REGISTRATION_FEE_INR must be a positive number');
      }
      return num;
    }),
  REGISTRATION_OPEN: z
    .string({ required_error: 'REGISTRATION_OPEN is strictly required in .env (true | false)' })
    .min(1, 'REGISTRATION_OPEN cannot be empty')
    .transform((val) => {
      const lower = val.toLowerCase().trim();
      if (lower !== 'true' && lower !== 'false') {
        throw new Error('REGISTRATION_OPEN must be strictly "true" or "false"');
      }
      return lower === 'true';
    }),
  FIREBASE_PROJECT_ID: z
    .string({ required_error: 'FIREBASE_PROJECT_ID is strictly required in .env' })
    .min(1, 'FIREBASE_PROJECT_ID cannot be empty'),
  FIREBASE_CLIENT_EMAIL: z
    .string({ required_error: 'FIREBASE_CLIENT_EMAIL is strictly required in .env' })
    .email('FIREBASE_CLIENT_EMAIL must be a valid email'),
  FIREBASE_PRIVATE_KEY: z
    .string({ required_error: 'FIREBASE_PRIVATE_KEY is strictly required in .env' })
    .min(1, 'FIREBASE_PRIVATE_KEY cannot be empty')
    .transform((key) => key.replace(/\\n/g, '\n')),
  RAZORPAY_KEY_ID: z
    .string({ required_error: 'RAZORPAY_KEY_ID is strictly required in .env' })
    .min(1, 'RAZORPAY_KEY_ID cannot be empty'),
  RAZORPAY_KEY_SECRET: z
    .string({ required_error: 'RAZORPAY_KEY_SECRET is strictly required in .env' })
    .min(1, 'RAZORPAY_KEY_SECRET cannot be empty'),
  RAZORPAY_WEBHOOK_SECRET: z
    .string({ required_error: 'RAZORPAY_WEBHOOK_SECRET is strictly required in .env' })
    .min(1, 'RAZORPAY_WEBHOOK_SECRET cannot be empty'),
  ADMIN_EMAILS: z
    .string({ required_error: 'ADMIN_EMAILS is strictly required in .env (comma-separated)' })
    .min(1, 'ADMIN_EMAILS cannot be empty')
    .transform((val) =>
      val
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0)
    ),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ CRITICAL CONFIGURATION ERROR: Missing or invalid environment variables:');
    const formatted = result.error.format();
    for (const [key, value] of Object.entries(formatted)) {
      if (key !== '_errors' && value && '_errors' in value) {
        console.error(`   - ${key}: ${value._errors.join(', ')}`);
      }
    }
    console.error('\nEnsure all required keys are populated in .env without code fallbacks.');
    process.exit(1);
  }

  const parsed = result.data;
  return {
    ...parsed,
    REGISTRATION_FEE_PAISE: Math.round(parsed.REGISTRATION_FEE_INR * 100),
  };
};

export const env = parseEnv();
