'use client';

import { useState, useEffect } from 'react';
import { User, signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { authService } from '../services/auth.service';
import { UserProfile } from '../types/user';

export const useAuth = () => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(safetyTimer);
      if (user) {
        const email = (user.email || '').toLowerCase().trim();
        if (!email.endsWith('@kiet.edu')) {
          console.warn('Non-KIET account detected on state change, signing out:', email);
          if (auth) {
            await fbSignOut(auth);
          }
          setFirebaseUser(null);
          setProfile(null);
          setIsRegistered(false);
          setLoading(false);
          return;
        }

        setFirebaseUser(user);
        try {
          const res = await authService.syncUser();
          if (res.user) {
            const userWithReg: UserProfile = {
              ...res.user,
              hasRegistered: !!res.hasRegistered,
            };
            setProfile(userWithReg);
            setIsRegistered(!!res.hasRegistered);
          }
        } catch (err) {
          console.error('Error syncing user profile:', err);
        }
      } else {
        setFirebaseUser(null);
        setProfile(null);
        setIsRegistered(false);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  const loginWithGoogle = async (): Promise<UserProfile | null> => {
    if (!auth) {
      alert('Firebase is not yet configured. Please supply NEXT_PUBLIC_FIREBASE_* keys in frontend/.env.local');
      return null;
    }
    try {
      setLoading(true);
      console.log('🚀 [Auth] Initiating Google Sign-In popup...');
      const result = await signInWithPopup(auth, googleProvider);
      const email = (result.user?.email || '').toLowerCase().trim();
      console.log('✅ [Auth] Google authentication successful:', email);

      if (!email.endsWith('@kiet.edu')) {
        console.warn('⛔ [Auth] Non-@kiet.edu domain rejected:', email);
        await fbSignOut(auth);
        setFirebaseUser(null);
        setProfile(null);
        setIsRegistered(false);
        throw new Error('Access restricted: Only official @kiet.edu email addresses are permitted to participate in AmongU.');
      }

      setFirebaseUser(result.user);
      console.log('📡 [Auth] Syncing user profile with backend API (/api/auth/user/signin)...');
      const res = await authService.syncUser();
      console.log('✨ [Auth] Backend sync completed:', res);

      if (res.user) {
        const fullProfile: UserProfile = {
          ...res.user,
          hasRegistered: !!res.hasRegistered,
        };
        setProfile(fullProfile);
        setIsRegistered(!!res.hasRegistered);
        return fullProfile;
      }
      return null;
    } catch (error) {
      console.error('❌ [Auth] Google Sign-In error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginAdminWithGoogle = async (): Promise<UserProfile | null> => {
    if (!auth) {
      alert('Firebase is not yet configured. Please supply NEXT_PUBLIC_FIREBASE_* keys in frontend/.env.local');
      return null;
    }
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      const res = await authService.syncAdmin();
      if (res.user) {
        setProfile(res.user);
        return res.user;
      }
      return null;
    } catch (error) {
      console.error('Admin Sign-In failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (auth) {
      await fbSignOut(auth);
    }
    setFirebaseUser(null);
    setProfile(null);
    setIsRegistered(false);
  };

  return {
    firebaseUser,
    profile,
    loading,
    isRegistered,
    loginWithGoogle,
    loginAdminWithGoogle,
    logout,
    setIsRegistered,
  };
};
