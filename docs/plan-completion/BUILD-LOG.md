# Ray Academy — Student Registration & Payment Build Log

Last updated: 2026-11-12
Status: Phase 1–4 complete; live Paystack transaction smoke test pending.
Branch: `ray-seo-analyser`
Scope: DB-driven Ray Academy catalogue, course detail pages, student enrolment
form, Paystack payments, instalments, coupon, emails, admin visibility.

---

## Scope note

This repository is the Wemray marketing + Ray Academy site. It does not contain
the returns/credit-note, tenant 2FA, offline POS, or realtime patch modules.
Those items belong to a different product and are out of scope here.

---

## What was already built (keep, do not rebuild)

- [x] `db/academy.sql` — tracks, courses, modules, coupons, enrolments, payments.
- [x] `db/academy.seed.sql` — 4 tracks, 8 courses, 6 modules each, `WEMRAY25`.
- [x] DB-backed `/academy` page and `/academy/courses/[slug]` detail page.
- [x] Course modules accordion, course facts (duration, classes, mode, certificate).
- [x] Enrolment form: email, first name, phone, full vs 50/50 instalments, coupon.
- [x] Paystack initialize / verify / webhook / status / balance APIs.
- [x] Welcome, receipt and admin notification emails.
- [x] Admin read-only Courses and Enrolments pages + status update.
- [x] Ray assistant hydrated from the database catalogue.
- [x] Academy styles, sitemap entries, contact-course link, SEO schema.

---

## Critical gaps found

1. [x] `/academy` renders no courses: `AcademySections` drops the `courses` /
       `trackCounts` props passed by the page.
2. [x] Admin sidebar has no Courses or Enrolments links.
3. [x] Instalment retry bug: a failed instalment 1 row is treated as "taken",
       so instalment 2 can be charged first. Re-init does not reset a failed
       payment back to `pending`.
4. [x] No UI to pay the second instalment; `complete` API and
       `sendInstalmentDue` email are unused.
5. [x] `afterSettlement` lives inside a route file and is imported by the webhook.
6. [x] Client duplicates pricing math instead of using `lib/academy/pricing`.
7. [x] `.env.example` has no Paystack keys; README omits academy migrations.
8. [x] Dead code: `AcademyEnrol.jsx`, `createEngineSafe`, stale static-course comment.
9. [x] Success page makes the student re-enter their email after payment.
10. [x] Webhook has no charged-amount guard (verify does).

---

## Recommended execution order

### Phase 1 — Catalogue wiring + cleanup

- [x] Pass `courses` / `trackCounts` through `AcademySections` to `LearningPaths`.
- [x] Remove unused `AcademyEnrol.jsx` and `createEngineSafe`.
- [x] Clean stale `src/data/courses.js` references/comments.
- [x] Add Paystack + academy vars to `.env.example`.
- [x] Verify `/academy` shows all 8 DB courses, filters, prices, links.

### Phase 2 — Payment correctness

- [x] Fix `getNextPayableInstalment` to decide from successful payments only.
- [x] Make `createPayment` reset failed/abandoned attempts to `pending`.
- [x] Move `afterSettlement` to `src/lib/academy/settlement.js`.
- [x] Import settlement logic from verify + webhook.
- [x] Use shared `computeTotals` / `computeInstalments` in `EnrolForm`.
- [x] Add charged-amount guard to webhook.
- [x] Keep all money server-authoritative.

### Phase 3 — Instalment completion UX

- [x] Add `/academy/enrol/balance` page + client form.
- [x] Show "Pay remaining balance" on success page when `part_paid`.
- [x] Link the welcome email balance copy to the balance page.
- [x] Short-lived signed httpOnly cookie from verify for auto status load.

### Phase 4 — Admin, docs, verification

- [x] Add Courses and Enrolments links to the admin sidebar.
- [x] Keep admin CRUD deferred to phase 2; read views + status update stay.
- [x] Add `docs/RAY_ACADEMY.md`.
- [x] Update `README.md` with academy routes, migrations, env vars.
- [x] Run `npm run lint`, `npm run typecheck`, `npm run build`.
- [ ] Smoke-test the full payment path (needs Paystack test transaction).

---

## Database / config steps

```bash
psql "$DATABASE_URL" -f db/academy.sql
psql "$DATABASE_URL" -f db/academy.seed.sql
```

Required env:

- `PAYSTACK_SECRET_KEY`
- `NEXT_PUBLIC_SITE_URL` (or `PAYSTACK_CALLBACK_URL`)
- optional `ACADEMY_INSTALMENT_DAYS` (default 30)

Paystack webhook URL: `/api/academy/webhooks/paystack`

---

## Acceptance criteria

- [x] `/academy` lists 8 DB courses with working track filters and prices.
- [x] Course detail shows description, duration, mode(s), classes, certificate,
      modules, price and enrol panel.
- [ ] Form validates, applies `WEMRAY25`, shows 25% off, supports 50/50, and
      redirects to Paystack. (Code complete; live Paystack test pending.)
- [ ] Webhook/verify settle payment, send welcome + receipt + admin emails,
      and update admin records. (Code complete; live Paystack test pending.)
- [ ] Part-paid students can pay the balance from the success/balance page.
      (Code complete; live Paystack test pending.)
- [x] Admin can see courses, enrolments, payment attempts and update status.
- [x] Lint, typecheck and production build pass.

---

## Progress log

| Date       | Item                                                        | Status |
| ---------- | ----------------------------------------------------------- | ------ |
| 2026-11-12 | Audit complete; build log created                           | Done   |
| 2026-11-12 | Phase 1 — catalogue wiring + cleanup                        | Done   |
| 2026-11-12 | Phase 2 — payment correctness                               | Done   |
| 2026-11-12 | Phase 3 — instalment completion UX                          | Done   |
| 2026-11-12 | Phase 4 — admin, docs, verification                         | Done   |
| 2026-11-12 | Academy schema + seed applied (4 tracks, 8 courses, 48 modules) | Done |
| 2026-11-12 | Lint, typecheck and production build                        | Passed |
| 2026-11-12 | Local smoke test: `/academy` + course detail                | Passed |
| 2026-11-12 | Academy cards simplified; all courses set to Online         | Done   |
| 2026-11-12 | Hero eyebrow (`.eb`) removed across pages                   | Done   |
| 2026-11-12 | Full Paystack payment smoke test                            | Pending |
