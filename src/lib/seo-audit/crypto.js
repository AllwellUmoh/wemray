import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
} from 'node:crypto';
import { getHashSalt } from './config';

let warnedAboutDevKey = false;

function encryptionKey() {
  const configured = process.env.CONTACT_ENCRYPTION_KEY?.trim();

  if (configured) {
    if (/^[a-f0-9]{64}$/i.test(configured)) return Buffer.from(configured, 'hex');

    const base64 = Buffer.from(configured, 'base64');
    if (base64.length === 32) return base64;

    const raw = Buffer.from(configured, 'utf8');
    if (raw.length === 32) return raw;

    throw new Error('CONTACT_ENCRYPTION_KEY must be a 32-byte value');
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('CONTACT_ENCRYPTION_KEY is required in production');
  }

  if (!warnedAboutDevKey) {
    warnedAboutDevKey = true;
    console.warn('CONTACT_ENCRYPTION_KEY is not set; using a development-only key.');
  }

  return createHash('sha256')
    .update(`wemray-seo:${process.env.BETTER_AUTH_SECRET || 'local-development'}`)
    .digest();
}

export function encryptValue(value) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((part) => part.toString('base64url')).join('.');
}

export function decryptValue(value) {
  const [ivPart, tagPart, dataPart] = String(value).split('.');
  if (!ivPart || !tagPart || !dataPart) throw new Error('Invalid encrypted value');

  const decipher = createDecipheriv(
    'aes-256-gcm',
    encryptionKey(),
    Buffer.from(ivPart, 'base64url'),
  );
  decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(dataPart, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}

export function hashValue(value) {
  return createHmac('sha256', getHashSalt()).update(String(value || '')).digest('hex');
}

export function hashUserAgent(value) {
  return hashValue(`ua:${String(value || '').slice(0, 512)}`);
}

export function hashToken(token) {
  return createHash('sha256').update(String(token)).digest('hex');
}

export function createReportToken() {
  return randomBytes(32).toString('base64url');
}

export function createReference(now = new Date()) {
  const date = now.toISOString().slice(0, 10).replaceAll('-', '');
  return `RAY-${date}-${randomBytes(3).toString('hex').toUpperCase()}`;
}
