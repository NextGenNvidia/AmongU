import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { clientEnv } from './env';

const hasValidConfig = !!clientEnv.FIREBASE_CONFIG?.apiKey;

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let analyticsInstance: Analytics | null = null;

if (hasValidConfig) {
  app = !getApps().length ? initializeApp(clientEnv.FIREBASE_CONFIG) : getApp();
  authInstance = getAuth(app);
  if (typeof window !== 'undefined') {
    isSupported()
      .then((supported) => {
        if (supported && app) {
          analyticsInstance = getAnalytics(app);
        }
      })
      .catch(() => {});
  }
}

export const auth = authInstance;
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  hd: 'kiet.edu', // Prompt for KIET email domain
});
export const analytics = analyticsInstance;
export { app };
