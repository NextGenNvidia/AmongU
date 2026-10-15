import admin from 'firebase-admin';
import { env } from './env';

if (!admin.apps.length) {
  try {
    if (env.FIREBASE_PRIVATE_KEY && env.FIREBASE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY')) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY,
        }),
      });
    } else {
      admin.initializeApp({
        projectId: env.FIREBASE_PROJECT_ID,
      });
    }
  } catch (err: any) {
    console.warn('⚠️ Firebase Admin cert note:', err?.message);
    try {
      admin.initializeApp({
        projectId: env.FIREBASE_PROJECT_ID,
      });
    } catch {}
  }
}

export const firebaseAdmin = admin;
export const firebaseAuth = admin.auth();
