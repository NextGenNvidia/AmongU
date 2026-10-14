import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase';
import { User, IUser } from '../models/User';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  dbUser: IUser;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const verifyAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Access denied: Missing or malformed Bearer token in Authorization header',
    });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1]?.trim();

  if (!idToken) {
    res.status(401).json({
      success: false,
      message: 'Access denied: Token string is empty',
    });
    return;
  }

  try {
    const decoded = await firebaseAuth.verifyIdToken(idToken);
    const email = (decoded.email || '').toLowerCase().trim();
    const name = decoded.name || 'Student';

    // Find user in MongoDB
    let dbUser = await User.findOne({ firebaseUid: decoded.uid });

    if (!dbUser) {
      // Create user record default to 'user' role
      dbUser = await User.create({
        firebaseUid: decoded.uid,
        email,
        name,
        role: 'user',
      });
    }

    req.user = {
      uid: decoded.uid,
      email,
      name,
      role: dbUser.role,
      dbUser,
    };

    next();
  } catch (error: any) {
    console.error('Firebase token verification failed:', error?.message || error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed: Invalid or expired Firebase ID token',
    });
  }
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const idToken = authHeader.split('Bearer ')[1]?.trim();

  if (!idToken) {
    return next();
  }

  try {
    const decoded = await firebaseAuth.verifyIdToken(idToken);
    const email = (decoded.email || '').toLowerCase().trim();
    const name = decoded.name || 'Student';

    let dbUser = await User.findOne({ firebaseUid: decoded.uid });

    if (!dbUser) {
      dbUser = await User.create({
        firebaseUid: decoded.uid,
        email,
        name,
        role: 'user',
      });
    }

    req.user = {
      uid: decoded.uid,
      email,
      name,
      role: dbUser.role,
      dbUser,
    };
  } catch (error) {
    // Optional auth: fail silently and proceed unauthenticated
  }

  next();
};
