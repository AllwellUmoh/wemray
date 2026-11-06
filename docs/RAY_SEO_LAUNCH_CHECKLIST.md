# RAY SEO Analyser — Launch Checklist

Use this list before and immediately after deploying the RAY SEO Analyser.

## 1. Environment configuration

- [ ] `DATABASE_URL` set and reachable from the deployment host.
- [ ] `SEO_REPORT_ENC_KEY` — 32-byte key (hex or base64) for AES-256-GCM
  encryption of contact data. Never commit it.
- [ ] `SEO_TOKEN_HASH_SECRET` — secret salt for report token hashing.
- [ ] `CONTACT_IP_SALT` — salt for IP hashing (shared with contact form).
- [ ] `RESEND_API_KEY` — Resend API key for report email.
- [ ] `SEO_REPORT_FROM_EMAIL` — verified sender (e.g. `reports@wemray.com`).
- [ ] `SEO_REPORT_REPLY_TO` — optional reply-to address.
- [ ] `PAGESPEED_API_KEY` — Google PageSpeed Insights key (optional; performance
  section reports "not assessed" when absent).
- [ ] `NEXT_PUBLIC_SITE_URL` — canonical site URL (used in links/emails).
- [ ] `SEO_ASYNC_MODE` — `true` on a persistent Node host, `false` on serverless.

## 2. Database

- [ ] Apply `db/seo-analyzer.sql` to the production database.
- [ ] Confirm all tables exist: `seo_audits`, `seo_audit_pages`, `seo_audit_issues`,
  `seo_audit_contacts`, `seo_consent_records`, `seo_email_deliveries`,
  `seo_rate_limits` (if present), and any indexes.
- [ ] Verify the DB user has only the privileges the app needs.

## 3. Rate limits

- [ ] Confirm per-IP, per-email and global limits in `src/lib/seo-audit/config.js`
  match expected traffic.
- [ ] Confirm resend limit (`resendLimit`, default 3).

## 4. Functional smoke test

- [ ] Run an audit on a known-good page; report renders with score and findings.
- [ ] PDF downloads and opens correctly (A4, multi-page).
- [ ] Report email arrives; links open the correct report and PDF with a valid token.
- [ ] "Resend email" works and is blocked after the resend limit.
- [ ] "Delete my details" removes contact data and updates status.
- [ ] Invalid/expired token returns a 404-equivalent ("Report not found").
- [ ] Rate-limit responses (429) render a sensible message.
- [ ] Error states (unreachable URL, non-HTML, timeout) show clear messages.

## 5. Security and privacy

- [ ] Confirm SSRF protections (private IP / port / scheme blocking) are active.
- [ ] Confirm contact fields are encrypted at rest and never shown in admin.
- [ ] Confirm report pages and PDF endpoints require a valid token.
- [ ] Confirm report page is `noindex`.
- [ ] Verify logs do not contain plaintext contact data or tokens.

## 6. SEO and content

- [ ] `/tools/ray-seo-analyser` is in `sitemap.xml`.
- [ ] Crawler page `/tools/ray-seo-analyser/crawler` is in `sitemap.xml`.
- [ ] Structured data validates (WebApplication, BreadcrumbList, FAQPage).
- [ ] Tools navigation appears between Portfolio and Ray Academy (desktop + mobile).
- [ ] Privacy Policy and Terms mention the analyser.
- [ ] Copy clearly states the RAY Score is not an official Google score and the
  audit covers one page only.

## 7. Admin

- [ ] `/admin/audits` lists audits with status, score and email state.
- [ ] Audit detail shows masked contact ("On file (encrypted)"), categories and
  deliveries.

## 8. Post-launch

- [ ] Monitor error logs for fetch/delivery failures for the first 24–48h.
- [ ] Confirm retention/cleanup of expired audits and contacts runs (cron/job).
- [ ] Confirm rate-limit windows behave under real traffic.
