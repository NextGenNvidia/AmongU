import { z } from 'zod';

const frontendEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string({ required_error: 'NEXT_PUBLIC_API_URL is strictly required' })
    .min(1, 'NEXT_PUBLIC_API_URL cannot be empty'),
  NEXT_PUBLIC_FIREBASE_API_KEY: z
    .string({ required_error: 'NEXT_PUBLIC_FIREBASE_API_KEY is strictly required' })
    .min(1, 'NEXT_PUBLIC_FIREBASE_API_KEY cannot be empty'),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z
    .string({ required_error: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is strictly required' })
    .min(1, 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN cannot be empty'),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z
    .string({ required_error: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID is strictly required' })
    .min(1, 'NEXT_PUBLIC_FIREBASE_PROJECT_ID cannot be empty'),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z
    .string({ required_error: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is strictly required' })
    .min(1, 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET cannot be empty'),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z
    .string({ required_error: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is strictly required' })
    .min(1, 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID cannot be empty'),
  NEXT_PUBLIC_FIREBASE_APP_ID: z
    .string({ required_error: 'NEXT_PUBLIC_FIREBASE_APP_ID is strictly required' })
    .min(1, 'NEXT_PUBLIC_FIREBASE_APP_ID cannot be empty'),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z
    .string({ required_error: 'NEXT_PUBLIC_RAZORPAY_KEY_ID is strictly required' })
    .min(1, 'NEXT_PUBLIC_RAZORPAY_KEY_ID cannot be empty'),
});

const getEnv = () => {
  const result = frontendEnvSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  });

  if (!result.success) {
    // During build or client load, provide clear diagnostic
    console.error('❌ Critical Frontend Env Config Error:', result.error.format());
  }

  return {
    API_URL: process.env.NEXT_PUBLIC_API_URL as string,
    FIREBASE_CONFIG: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
    },
    RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
  };
};

export const clientEnv = getEnv();
