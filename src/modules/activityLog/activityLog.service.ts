import type { Request } from 'express';
import { env } from '../../config/env';
import { User } from '../user/user.model';
import { ActivityLog } from './activityLog.model';

const IPFIND_BASE = 'https://api.ipfind.com';

const PRIVATE_PREFIXES = ['127.', '192.168.', '10.', '172.'];

export const getClientIP = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return (forwarded[0] as string).split(',')[0].trim();
  }
  return req.ip ?? req.socket?.remoteAddress ?? 'unknown';
};

const isPrivateIP = (ip: string): boolean =>
  ip === '::1' ||
  ip === '::ffff:127.0.0.1' ||
  ip === 'unknown' ||
  PRIVATE_PREFIXES.some((prefix) => ip.startsWith(prefix));

const lookupIP = async (ip: string): Promise<Record<string, unknown> | null> => {
  if (isPrivateIP(ip)) return null;
  const key = env.IPFIND_KEY;
  if (!key) {
    console.warn('[ActivityLog] IPFIND_KEY not set — skipping geo lookup');
    return null;
  }
  try {
    const res = await fetch(`${IPFIND_BASE}?ip=${encodeURIComponent(ip)}&auth=${key}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      console.warn(`[ActivityLog] ipfind API returned ${res.status} for IP ${ip}`);
      return null;
    }
    const data = (await res.json()) as Record<string, unknown>;
    if (data.error) {
      console.warn('[ActivityLog] ipfind API error:', data.error);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('[ActivityLog] ipfind lookup failed:', err);
    return null;
  }
};

export interface LogActivityOptions {
  action?: string;
}

export const logActivity = (req: Request, options: LogActivityOptions = {}): void => {
  const ip = getClientIP(req);
  const uid = req.user?.uid;
  const email = req.user?.email;
  const method = req.method;
  const path = req.originalUrl;
  const userAgent = req.headers['user-agent'];
  const action = options.action ?? `${method} ${path}`;

  // Fire and forget — never block the HTTP response
  void (async () => {
    try {
      const [geoData, dbUser] = await Promise.all([
        lookupIP(ip),
        uid ? User.findOne({ firebaseUid: uid }).select('phoneNumber email').lean() : null,
      ]);

      await ActivityLog.create({
        ip,
        method,
        path,
        action,
        userId: uid,
        email: dbUser?.email ?? email,
        phone: dbUser?.phoneNumber ?? null,
        userAgent,
        ipData: geoData
          ? {
              country: geoData.country,
              countryCode: geoData.country_code,
              continent: geoData.continent,
              continentCode: geoData.continent_code,
              city: geoData.city,
              county: geoData.county,
              region: geoData.region,
              regionCode: geoData.region_code,
              timezone: geoData.timezone,
              latitude: geoData.latitude,
              longitude: geoData.longitude,
              currency: geoData.currency,
              languages: geoData.languages,
            }
          : null,
      });
    } catch (err) {
      console.error('[ActivityLog] Failed to save:', err);
    }
  })();
};
