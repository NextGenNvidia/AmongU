import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { clientEnv } from './env';

const app = !getApps().length ? initializeApp(clientEnv.FIREBASE_CONFIG) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  hd: 'kiet.edu', // Prompt for KIET email domain
});
