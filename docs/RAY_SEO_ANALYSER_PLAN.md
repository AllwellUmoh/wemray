# RAY SEO Analyser — Release 1 Plan

Status: Draft for approval  
Last updated: 2026-11-05  
Owner: Wemray Technology

## Documentation maintenance

- `docs/RAY_SEO_ANALYSER_STATUS.md` is the living build log.
- After every completed task — including short tasks — update the status
  document immediately with:
  - what was completed
  - current phase
  - files changed
  - blockers or open decisions
  - next action
  - a change-log entry
- If a task changes scope, architecture or decisions, update this plan document
  as well.
- A task is not considered complete until the status document has been updated.

## 1. Goal

Build a branded public **RAY SEO Analyser** at `/tools/ray-seo-analyser`.

Release 1 must provide:

- A live single-URL SEO audit.
- Email and phone capture with clear consent.
- An on-screen report with evidence, scores, limits and fixes.
- A shareable, expiring report link.
- A branded PDF.
- Email delivery through the existing Resend setup.
- Persistence, abuse controls and deletion.

The analyser is a Wemray diagnostic tool. It is not a Google score and must
never imply a Google penalty, ranking guarantee or official Google assessment.

## 2. Decisions

### Locked by the user

- The UI is React/Next.js and the backend is Node.
- Keep the existing PostgreSQL database.
- Use Google PageSpeed Insights as the performance data source.
- Keep Resend for transactional email. Resend is already part of the stack.
- Avoid extra third-party applications and services.
- Build the full Release 1: audit, report, email, phone, PDF and persistence.
- Add a **Tools** dropdown to the site navigation with **RAY SEO Analyser**.

### Removed from the earlier plan

The following are no longer part of Release 1 unless a later requirement proves
they are necessary:

- Railway worker service.
- Redis and BullMQ.
- Cloudflare R2 or any object storage.
- Playwright and Chromium-based PDF generation.
- Cloudflare Turnstile.
- Separate worker package or worker deployment.

### Recommended implementation defaults

- Match the existing repository conventions: JS/JSX, custom CSS and `pg`/SQL.
- Do not migrate the site to Tailwind, shadcn/ui, Drizzle or TypeScript in this
  release.
- Use Node `fetch` for requests and Cheerio for HTML parsing.
- Generate PDFs in Node with `pdfkit`.
- Store report data in PostgreSQL and generate PDFs on demand.
- Use PostgreSQL-backed rate limits and a honeypot instead of Turnstile.
- Use `noindex`, `no-store` and `no-referrer` on report routes.

### Open decisions

1. **Hosting.** Does the site stay on Vercel/serverless, or can it run on a
   persistent Node server/VPS?
   - Persistent Node host: audit jobs can run in-process with real progress.
   - Vercel/serverless: the audit must run synchronously in one request with a
     hard 45–60 second budget and partial results for slow sites.
2. **PDF fidelity.** A Node-generated PDF with `pdfkit` is recommended. It is
   lighter and removes Chromium, but requires hand-built layout. Confirm that
   this is acceptable.
3. **Abuse protection.** Confirm that rate limits, a honeypot and optional
   proof-of-work are sufficient without Turnstile.
4. **Retention defaults.** Proposed: 30-day report/PDF link, 90-day
   audit/contact retention, 24-month consent records, 3 resends and an 8 MB
   attachment cap.
5. **Phone purpose wording.** Proposed: “We use your email to deliver the report
   and your phone for report-delivery support and fraud prevention. We will not
   call or text you.” Confirm before publishing.

## 3. Scope

### In scope

- One public page audit per submission.
- Raw HTML and HTTP response analysis.
- PageSpeed lab and field data, displayed separately.
- Evidence-backed findings with confidence and severity.
- RAY diagnostic score and category scores.
- PDF report and Resend delivery.
- Email/phone capture, consent records and contact deletion.
- Shareable report links with expiry and revocation.
- Rate limiting, safe fetching and audit lifecycle states.
- Admin visibility for audits and delivery status.
- Privacy, terms and crawler-information copy.

### Out of scope

- User accounts and saved projects.
- Full-site crawling.
- Rank tracking, backlinks or competitor data.
- AI-generated recommendations.
- Billing, white-label reports or team access.
- JavaScript-rendered page execution.
- Automatic recurring audits.

## 4. Architecture

```text
Browser
  |-- Next.js page, form, progress and report
  |-- POST /api/public/audits
  |-- GET  /api/public/audits/:id/status
  |-- GET  /api/public/audits/:id/report
  |-- GET  /api/public/audits/:id/pdf
  |-- POST /api/public/audits/:id/resend
  `-- DELETE /api/public/audits/:id/contact
        |
        v
Next.js/Node application
  |-- validation, rate limits and consent
  |-- safe URL fetching and HTML parsing
  |-- audit rules and scoring
  |-- Google PageSpeed request
  |-- PDF generation with pdfkit
  |-- Resend email delivery
  `-- PostgreSQL persistence
        |
        v
Existing PostgreSQL database
```

There is no Redis, no separate worker service and no object storage.

### Execution modes

#### Mode A — Persistent Node host

- The audit is stored as a job row and processed by a small in-process job runner.
- The browser polls the audit status endpoint for real progress.
- Concurrency is limited to one or two audits to protect memory and provider
  quotas.
- The runner is started only when `ENABLE_INLINE_AUDIT_JOBS=true`.
- Jobs are idempotent and recoverable after a restart.

#### Mode B — Vercel/serverless

- The audit runs synchronously inside the POST request.
- The request has a hard budget of 45–60 seconds.
- Slow sites return a useful partial report rather than hanging.
- The client shows progress while waiting.
- No background interval or long-lived process is used.

The same audit core is used in both modes. Only the execution wrapper differs.

## 5. User journey

1. Visitor opens `/tools/ray-seo-analyser`.
2. Enters URL, email and phone.
3. Grants required report-delivery consent.
4. Optionally grants marketing consent. This is unchecked by default.
5. Submits the form.
6. Server validates the URL, email, phone, consent and abuse signals.
7. Server creates the audit and contact records.
8. Audit runs and reports honest states: queued, running, partial, succeeded,
   failed or blocked.
9. Report appears on screen with score, findings, evidence and scope.
10. PDF is generated on demand.
11. Resend delivers the report email with the PDF or a secure link.
12. Visitor can download, resend, share or delete contact details.

## 6. Navigation and design

### Desktop navigation

- Add **Tools** after Portfolio and before Ray Academy.
- Use a compact dropdown, not the full Services mega-menu.
- One item: **RAY SEO Analyser**, with icon, short description and arrow.
- Generalise the existing single mega-menu controller to support multiple
  menus.
- Support hover, click, Escape, outside click, scroll close, focus return and
  `aria-expanded`.
- Highlight Tools for `/tools/*`.

### Mobile navigation

- Add a Tools accordion.
- Close the menu when the item is selected.

### Visual direction

- Concept: “RAY Signal Room”.
- Navy hero, orbital scan rings, moving scan beam, pixel field, blur orbs and
  signal chips.
- Glass scan console for the form.
- Honest progress stages.
- Light editorial report with a large score dial, category bars, priority
  actions, evidence accordions and limitations.
- Wemray navy, purple and lavender palette.
- Reduced-motion support, keyboard access, visible focus and contrast.
- Severity must not rely on colour alone.

## 7. Audit engine

Planned location: `src/lib/seo-audit/`.

### Safe fetch

- Allow HTTP and HTTPS only.
- Allow ports 80 and 443 only.
- Reject credentials in URLs.
- Resolve DNS and block private, loopback, link-local, reserved and cloud
  metadata IPv4/IPv6 addresses.
- Revalidate every redirect.
- Maximum 5 redirects.
- 12-second timeout.
- 2 MB decompressed response cap.
- HTML responses only.
- Clear Wemray user agent with a crawler information page.
- Never bypass bot protection or authentication.

### Rules

Target approximately 35 rules across:

- Fetch and crawlability.
- On-page metadata.
- Content quality heuristics.
- Images and media.
- Links.
- Technical headers and markup.
- Structured data.
- International signals.
- AI crawler directives.
- Performance via PageSpeed.

Each rule needs:

- Stable ID and version.
- Category and severity.
- Confidence level.
- Evidence schema.
- Explanation and practical fix.
- Fixture test.
- Known limitations.

Missing evidence is `not assessed`, never a failure. Heuristics are labelled as
heuristics, not Google penalties.

### PageSpeed

- Server-side only.
- Extract lab and field data separately.
- Record device, source, date and availability.
- Cache results for 24 hours.
- Log provider calls and cost units.
- Provider failure produces an unavailable result, not a failed audit.

## 8. Scoring

The scoring formula will be documented before implementation.

- Severity weights: critical 15, high 8, medium 4, low 1, informational 0.
- Per-category penalty budgets and category weights.
- Coverage-based penalties for multi-asset issues.
- Deduplication so one root cause is not counted repeatedly.
- Unavailable checks excluded and remaining scores renormalised.
- Clamped to 0–100.
- Versioned so reports remain reproducible.
- Displayed as **RAY Score — Wemray diagnostic score, not a Google score**.

## 9. PDF and email

### PDF

- Generate in Node with `pdfkit`.
- No Chromium, no Playwright, no object storage.
- A4, multi-page, selectable text, page numbers, clickable links and accessible
  contrast.
- Cover, executive summary, score breakdown, priority findings, evidence,
  fixes, performance, scope, limitations, report ID and footer.
- Generate on demand from stored report data.
- Cache generated buffers only in memory for the current request.
- Attachment filename uses the report ID only, never contact data.
- If the PDF exceeds 8 MB, send a secure report link instead.

### Email

- Use the existing Resend integration and verified sender domain.
- Send to the captured email address only.
- Include score, summary, key actions, report link and support details.
- Store delivery status, provider message ID and attempts.
- Retry transient failures.
- Allow up to three resends per report.
- Email failure never deletes or blocks the on-screen report.
- Marketing email is sent only when optional marketing consent is granted.

### Report access

- Unguessable token stored as a hash.
- 30-day expiry by default.
- Revocation and regeneration supported.
- No contact data in the URL.
- `X-Robots-Tag: noindex`, `no-store`, `no-referrer`.

## 10. Data model

Planned migration: `db/seo-analyzer.sql`.

Tables:

- `audits`
- `pages`
- `issues`
- `report_contacts`
- `consent_records`
- `email_deliveries`
- `jobs`
- `provider_calls`
- `rate_limits`

Key fields:

- Audit: public ID, URL, status, progress, scores, report JSON, scope, rule
  version, score version, token hash, expiry and timestamps.
- Contact: encrypted email and phone, hashes for deduplication and limits,
  retention date.
- Consent: purpose, version, granted flag, source and timestamp.
- Delivery: provider message ID, status, attempts and last error.
- Job: idempotency key, state, attempts and failure reason.

Contact data is encrypted with AES-256-GCM. Deduplication and rate limiting use
HMAC hashes. Raw contact data is never written to logs or filenames.

## 11. API

- `POST /api/public/audits`
  - Validate URL, email, phone, consent and abuse signals.
  - Create records.
  - Run synchronously or start the in-process job.
  - Return audit ID, status URL, report URL and token.
- `GET /api/public/audits/:id/status`
  - Token-authorised status and progress.
- `GET /api/public/audits/:id/report`
  - Token-authorised report JSON.
- `GET /api/public/audits/:id/pdf`
  - Token-authorised PDF stream.
- `POST /api/public/audits/:id/resend`
  - Token-authorised, rate-limited and idempotent.
- `DELETE /api/public/audits/:id/contact`
  - Token-authorised deletion or anonymisation.
- `POST /api/webhooks/resend`
  - Optional delivery, bounce and complaint updates with signature
    verification.

All routes validate input and output, use generic errors to prevent contact
enumeration, and set `no-store`.

## 12. Security and privacy

- SSRF protection is the highest-risk area and a release blocker.
- Turnstile is removed; abuse protection relies on Postgres rate limits, a
  honeypot and optional proof-of-work. This is weaker against determined bots.
- Rate limits apply per IP hash, per contact hash and globally.
- Contact data is encrypted at rest.
- Report tokens are hashed and expire.
- No fetched HTML is rendered directly; evidence is escaped text.
- No raw contact details in logs, analytics, error messages or filenames.
- Required consent is separated from optional marketing consent.
- Contact deletion and retention cleanup are supported.
- Report pages are excluded from indexing.
- CSP remains strict because Turnstile is no longer required.
- Secrets are validated at startup and never exposed to the client.

## 13. Pages and SEO

- `/tools/ray-seo-analyser` — analyser.
- `/tools/ray-seo-analyser/report/[id]` — report, noindex.
- `/tools/ray-seo-analyser/crawler` — what RAY fetches, user agent, opt-out and
  support.
- Update `/privacy` and `/terms` for audit data, retention, subprocessors and
  deletion.
- Add the analyser to the sitemap and footer.
- Add `WebApplication`, breadcrumb and FAQ structured data.
- Add admin audit visibility with masked contact data and delivery status.

## 14. Planned files

```text
src/app/(site)/tools/ray-seo-analyser/page.jsx
src/app/(site)/tools/ray-seo-analyser/report/[id]/page.jsx
src/app/(site)/tools/ray-seo-analyser/crawler/page.jsx
src/app/api/public/audits/route.js
src/app/api/public/audits/[id]/status/route.js
src/app/api/public/audits/[id]/report/route.js
src/app/api/public/audits/[id]/pdf/route.js
src/app/api/public/audits/[id]/resend/route.js
src/app/api/public/audits/[id]/contact/route.js
src/components/tools/ray-seo-analyser/
src/lib/seo-audit/
src/lib/seo-report/
src/lib/seo-jobs.js
src/styles/site.css
src/app/sitemap.js
src/components/layout/HeaderMarkup.jsx
src/components/layout/MobileMenuMarkup.jsx
src/lib/useSiteEffects.js
db/seo-analyzer.sql
docs/RAY_SEO_RULE_CATALOGUE.md
docs/RAY_SEO_SCORING.md
docs/RAY_SEO_LAUNCH_CHECKLIST.md
```

## 15. Milestones

### Milestone 0 — Foundation

- Write this plan and the rule/scoring documents.
- Add the database schema.
- Add environment validation.
- Add the audit job wrapper for the chosen hosting mode.

Exit: schema applies; a test audit can be created and completed.

### Milestone 1 — Navigation and page

- Tools dropdown and mobile accordion.
- Branded analyser page.
- Form, validation and consent.
- Metadata, sitemap and structured data.

Exit: page works on desktop and mobile; validation and keyboard behaviour pass.

### Milestone 2 — Audit engine

- Safe fetch and parsing.
- Rules and scoring.
- PageSpeed integration.
- Persistence and status API.

Exit: varied sites run; hostile URL suite passes; partial and blocked states are
honest.

### Milestone 3 — Report experience

- On-screen report.
- Shareable report page.
- Token access, expiry and deletion.

Exit: report survives refresh and sharing; noindex and token tests pass.

### Milestone 4 — PDF and email

- `pdfkit` report.
- PDF download endpoint.
- Resend delivery, retries and resend limits.
- Delivery status.

Exit: PDF and email tests pass; email failure leaves the report accessible.

### Milestone 5 — Hardening and launch

- Retention cleanup.
- Admin visibility.
- Privacy, terms and crawler copy.
- Security and load checks.
- Launch checklist.

Exit: no critical security defects; cleanup and deletion verified.

## 16. Testing

- SSRF: localhost, private IPv4/IPv6, metadata IP, encoded IPs, redirects,
  DNS rebinding, bad ports, unsupported schemes, credentials, huge bodies and
  slow responses.
- Rules: fixtures for every rule, missing evidence, conflicting canonicals,
  noindex headers and malformed structured data.
- Scoring: bounds, normalisation, coverage, deduplication and version
  reproducibility.
- Consent: required versus optional consent, version persistence and no PII in
  logs.
- PDF: long content, multiple pages, missing PageSpeed data, partial audits and
  selectable text.
- Email: success, retry, bounce, oversized attachment fallback, resend limits
  and duplicate jobs.
- Report access: token entropy, expiry, revocation, cross-audit access and
  deletion.
- Abuse: IP and contact throttling, queue flood, repeat submissions and
  provider-cost caps.
- Manual: responsive navigation, mobile accordion, reduced motion and
  keyboard-only flow.

## 17. Risks

- Vercel serverless limits make long audits unreliable; partial results and a
  hard timeout are required.
- Removing the queue means less resilience and no robust background retries.
- `pdfkit` requires hand-built layout and will not exactly match HTML/CSS.
- Rate limits and a honeypot are weaker than Turnstile.
- PageSpeed latency and quota can degrade performance data.
- Phone capture may reduce completion; privacy wording must justify it.
- SSRF remains the highest-risk implementation area.
- Resend delivery depends on domain reputation and quota.

## 18. Acceptance criteria

Release 1 is complete when:

- The Tools dropdown and analyser work on desktop and mobile.
- A valid URL produces a useful, evidence-backed report.
- Slow or blocked sites return honest partial/blocked states.
- Reports are shareable, expiring and noindex.
- Email and phone are collected with separated consent and encrypted storage.
- PDF is branded, readable and downloadable.
- Resend delivers the report and failures are visible.
- Contact data never appears in logs, filenames or public URLs.
- Rate limits and SSRF protections pass the test suite.
- Build, lint, typecheck and tests pass.

## 19. Prerequisites

- Confirm hosting mode: Vercel/serverless or persistent Node host.
- Confirm `pdfkit` PDF approach.
- Confirm rate limits/honeypot without Turnstile.
- Confirm retention defaults and phone purpose wording.
- Provide the PageSpeed API key.
- Confirm the public site URL for report and email links.
- Confirm Resend sender and domain verification.
- Existing PostgreSQL `DATABASE_URL` remains available.
