import crypto from 'crypto';
import { env } from '../config/env';

/**
 * Derives a cryptographic secret key based on current ADMIN_USERNAME, ADMIN_PASSWORD,
 * and an optional ADMIN_SESSION_SECRET or internal salt.
 * 
 * Changing the Admin Password or Username immediately changes this key,
 * which automatically invalidates ALL previously issued tokens across all sessions.
 */
function getAdminAuthSecret(): string {
  const secretKey = env.ADMIN_SESSION_SECRET || 'amongu_admin_session_salt_2026';
  return crypto
    .createHmac('sha256', secretKey)
    .update(`${env.ADMIN_USERNAME || ''}:${env.ADMIN_PASSWORD || ''}`)
    .digest('hex');
}

/**
 * Generates a signed admin session token.
 * Format: au_adm_<base64url_payload>.<signature>
 */
export function generateAdminSessionToken(adminId: string): string {
  const secret = getAdminAuthSecret();
  const payloadData = {
    uid: adminId || 'admin_master_super',
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
  };

  const payload = Buffer.from(JSON.stringify(payloadData)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');

  return `au_adm_${payload}.${signature}`;
}

/**
 * Verifies if the provided token is a valid, currently signed admin session token.
 * If credentials have changed or the token was forged/expired, it returns false.
 */
export function verifyAdminSessionToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // Strictly reject the old hardcoded tokens
  if (token === 'amongu_admin_secret_token_2026' || token.startsWith('amongu_admin_')) {
    return false;
  }

  if (!token.startsWith('au_adm_')) {
    return false;
  }

  const tokenBody = token.slice('au_adm_'.length);
  const parts = tokenBody.split('.');
  if (parts.length !== 2) {
    return false;
  }

  const [payloadBase64, providedSignature] = parts;
  if (!payloadBase64 || !providedSignature) {
    return false;
  }

  try {
    const secret = getAdminAuthSecret();
    const expectedSignature = crypto.createHmac('sha256', secret).update(payloadBase64).digest('base64url');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const providedBuf = Buffer.from(providedSignature, 'utf8');

    if (expectedBuf.length !== providedBuf.length) {
      return false;
    }

    if (!crypto.timingSafeEqual(expectedBuf, providedBuf)) {
      return false;
    }

    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    const data = JSON.parse(payloadJson);

    if (data.role !== 'admin' || !data.uid) {
      return false;
    }

    // 7-day token expiration
    const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
    const now = Math.floor(Date.now() / 1000);
    if (data.iat && now - data.iat > MAX_AGE_SECONDS) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
