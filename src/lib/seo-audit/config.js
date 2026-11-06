function positiveInt(value, fallback) {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.BETTER_AUTH_URL ||
    'http://localhost:3000'
  ).replace(/\/+$/, '');
}

export function getSeoConfig() {
  return {
    siteUrl: getSiteUrl(),
    pagespeedApiKey: process.env.PAGESPEED_API_KEY || '',
    tokenTtlDays: positiveInt(process.env.SEO_REPORT_TTL_DAYS, 30),
    auditRetentionDays: positiveInt(process.env.SEO_AUDIT_RETENTION_DAYS, 90),
    consentRetentionMonths: positiveInt(process.env.SEO_CONSENT_RETENTION_MONTHS, 24),
    limits: {
      ipHourly: positiveInt(process.env.SEO_IP_HOURLY_LIMIT, 5),
      ipDaily: positiveInt(process.env.SEO_IP_DAILY_LIMIT, 15),
      contactDaily: positiveInt(process.env.SEO_CONTACT_DAILY_LIMIT, 5),
      globalDaily: positiveInt(process.env.SEO_GLOBAL_DAILY_LIMIT, 100),
    },
  };
}

export function getHashSalt() {
  return process.env.SEO_HASH_SALT || process.env.CONTACT_IP_SALT || 'wemray-seo-development-salt';
}
