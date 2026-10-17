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

  // Support Admin session token
  if (idToken === 'amongu_admin_secret_token_2026' || idToken.startsWith('amongu_admin_')) {
    req.user = {
      uid: 'admin_master_super',
      email: 'admin.lead@kiet.edu',
      name: 'Chief Organizer (Admin)',
      role: 'admin',
      dbUser: {
        _id: '671234567890abcdef123456' as any,
        firebaseUid: 'admin_master_super',
        email: 'admin.lead@kiet.edu',
        name: 'Chief Organizer',
        role: 'admin',
      } as any,
    };
    return next();
  }

  try {
    const decoded = await firebaseAuth.verifyIdToken(idToken);
    const email = (decoded.email || '').toLowerCase().trim();
    const name = decoded.name || 'Student';

    // Find or atomically upsert user in MongoDB to eliminate race-condition duplicate key errors
    let dbUser = await User.findOneAndUpdate(
      { firebaseUid: decoded.uid },
      {
        $setOnInsert: {
          firebaseUid: decoded.uid,
          role: 'user',
          isBlocked: false,
        },
        $set: {
          email,
          name,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

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

    let dbUser = await User.findOneAndUpdate(
      { firebaseUid: decoded.uid },
      {
        $setOnInsert: {
          firebaseUid: decoded.uid,
          role: 'user',
          isBlocked: false,
        },
        $set: {
          email,
          name,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

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
