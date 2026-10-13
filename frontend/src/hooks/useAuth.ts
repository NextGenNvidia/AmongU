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

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const res = await authService.syncUser();
          if (res.user) {
            setProfile(res.user);
            setIsRegistered(!!res.hasRegistered);
          }
        } catch (err) {
          console.error('Error syncing user profile:', err);
        }
      } else {
        setProfile(null);
        setIsRegistered(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<UserProfile | null> => {
    if (!auth) {
      alert('Firebase is not yet configured. Please supply NEXT_PUBLIC_FIREBASE_* keys in frontend/.env.local');
      return null;
    }
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      const res = await authService.syncUser();
      if (res.user) {
        setProfile(res.user);
        setIsRegistered(!!res.hasRegistered);
        return res.user;
      }
      return null;
    } catch (error) {
      console.error('Google Sign-In failed:', error);
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
