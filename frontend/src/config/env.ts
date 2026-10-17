import { z } from 'zod';

export const OFFICIAL_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDnfnhpYjDbh9gvgE1_Rl2n0Ruc78iruUo',
  authDomain: 'amongu-cae82.firebaseapp.com',
  projectId: 'amongu-cae82',
  storageBucket: 'amongu-cae82.firebasestorage.app',
  messagingSenderId: '102068371138',
  appId: '1:102068371138:web:dea0bfce6406a8d985055b',
  measurementId: 'G-HNKM3H0C8G',
};

const frontendEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().default('http://localhost:5000/api'),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().default(OFFICIAL_FIREBASE_CONFIG.apiKey),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().default(OFFICIAL_FIREBASE_CONFIG.authDomain),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().default(OFFICIAL_FIREBASE_CONFIG.projectId),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().default(OFFICIAL_FIREBASE_CONFIG.storageBucket),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().default(OFFICIAL_FIREBASE_CONFIG.messagingSenderId),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().default(OFFICIAL_FIREBASE_CONFIG.appId),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().default(OFFICIAL_FIREBASE_CONFIG.measurementId),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().default('rzp_test_dummy_key_123'),
});

const getEnv = () => {
  const result = frontendEnvSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || OFFICIAL_FIREBASE_CONFIG.apiKey,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || OFFICIAL_FIREBASE_CONFIG.authDomain,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || OFFICIAL_FIREBASE_CONFIG.projectId,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || OFFICIAL_FIREBASE_CONFIG.storageBucket,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || OFFICIAL_FIREBASE_CONFIG.messagingSenderId,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || OFFICIAL_FIREBASE_CONFIG.appId,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || OFFICIAL_FIREBASE_CONFIG.measurementId,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummy_key_123',
  });

  const parsed = result.success
    ? result.data
    : {
        NEXT_PUBLIC_API_URL: 'http://localhost:5000/api',
        NEXT_PUBLIC_FIREBASE_API_KEY: OFFICIAL_FIREBASE_CONFIG.apiKey,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: OFFICIAL_FIREBASE_CONFIG.authDomain,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: OFFICIAL_FIREBASE_CONFIG.projectId,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: OFFICIAL_FIREBASE_CONFIG.storageBucket,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: OFFICIAL_FIREBASE_CONFIG.messagingSenderId,
        NEXT_PUBLIC_FIREBASE_APP_ID: OFFICIAL_FIREBASE_CONFIG.appId,
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: OFFICIAL_FIREBASE_CONFIG.measurementId,
        NEXT_PUBLIC_RAZORPAY_KEY_ID: 'rzp_test_dummy_key_123',
      };

  return {
    API_URL: parsed.NEXT_PUBLIC_API_URL,
    FIREBASE_CONFIG: {
      apiKey: parsed.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: parsed.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: parsed.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: parsed.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: parsed.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: parsed.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: parsed.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    },
    RAZORPAY_KEY_ID: parsed.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    RAZORPAY_PAYMENT_LINK: 'https://pages.razorpay.com/pl_Toye4lRXrvFFms/view',
  };
};

export const RAZORPAY_PAYMENT_LINK = 'https://pages.razorpay.com/pl_Toye4lRXrvFFms/view';
export const clientEnv = getEnv();
