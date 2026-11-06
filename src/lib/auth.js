import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { magicLink } from 'better-auth/plugins';
import { pool } from './db';
import { sendAdminMagicLink } from './email';

const adminEmail = (process.env.ADMIN_EMAIL || 'hello@wemray.com').trim().toLowerCase();
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://wemray.com').replace(/\/+$/, '');
const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null;
const baseURL =
  process.env.BETTER_AUTH_URL ||
  vercelUrl ||
  'http://localhost:3000';

const trustedOrigins = [
  siteUrl,
  baseURL,
  vercelUrl,
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
