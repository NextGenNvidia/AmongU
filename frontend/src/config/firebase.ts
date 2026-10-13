import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { clientEnv } from './env';

const hasValidConfig = !!clientEnv.FIREBASE_CONFIG?.apiKey;

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;

if (hasValidConfig) {
  app = !getApps().length ? initializeApp(clientEnv.FIREBASE_CONFIG) : getApp();
  authInstance = getAuth(app);
}

export const auth = authInstance;
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  hd: 'kiet.edu', // Prompt for KIET email domain
});
