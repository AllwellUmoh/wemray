import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { magicLink } from 'better-auth/plugins';
import { pool } from './db';
import { sendAdminMagicLink } from './email';

const adminEmail = (process.env.ADMIN_EMAIL || 'wemraytechnology@gmail.com').trim().toLowerCase();
function normalizeAuthOrigin(value) {
  const url = new URL(value);
  if (url.hostname === 'wemray.com' || url.hostname === 'www.wemray.com') {
    url.protocol = 'https:';
    url.hostname = 'www.wemray.com';
  }
  return url.origin;
}

const siteUrl = normalizeAuthOrigin(
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wemray.com',
);
const vercelUrl = process.env.VERCEL_URL
  ? normalizeAuthOrigin(`https://${process.env.VERCEL_URL}`)
  : null;
const baseURL = normalizeAuthOrigin(
  process.env.BETTER_AUTH_URL ||
  vercelUrl ||
  siteUrl,
);

const trustedOrigins = [
  siteUrl,
  baseURL,
  vercelUrl,
  'https://www.wemray.com',
  'https://wemray.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

const authSecret = process.env.BETTER_AUTH_SECRET;
const isProductionBuild = process.env.NEXT_PHASE === 'phase-production-build';

if (!authSecret && process.env.NODE_ENV === 'production' && !isProductionBuild) {
  throw new Error('BETTER_AUTH_SECRET must be set in production.');
}

export const auth = betterAuth({
  appName: 'Wemray Technology',
  baseURL,
  secret: authSecret || 'wemray-local-development-only-secret',
  ...(process.env.DATABASE_URL ? { database: pool } : {}),
  trustedOrigins,
  emailAndPassword: {
    enabled: false,
  },
  session: {
    expiresIn: 60 * 60 * 8,
    updateAge: 60 * 60,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (user.email?.trim().toLowerCase() !== adminEmail) return false;
          return { data: { ...user, email: adminEmail } };
        },
      },
    },
  },
  plugins: [
    magicLink({
      expiresIn: 600,
      rateLimit: { window: 60, max: 5 },
      sendMagicLink: async ({ email, url }) => {
        if (email.trim().toLowerCase() !== adminEmail) return;
        await sendAdminMagicLink({ email, url });
      },
    }),
    nextCookies(),
  ],
});
