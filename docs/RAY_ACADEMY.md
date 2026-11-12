# Ray Academy — Enrolment & Payments

The academy catalogue, student registration form and payments are fully
database-backed. The database is the single source of truth for courses,
modules, prices and coupons.

## Data model

| Table | Purpose |
| --- | --- |
| `academy_tracks` | Software, design, marketing, data and AI tracks |
| `academy_courses` | Course content, modes, delivery, duration, price |
| `academy_course_modules` | Ordered modules and topics per course |
| `academy_coupons` | Discount codes (`WEMRAY25` is the global 25% code) |
| `academy_enrolments` | Student record, plan, totals, status |
| `academy_enrolment_payments` | One row per Paystack attempt/instalment |

### Course fields

- `formats`: one or more of `Hybrid`, `Online`, `Onsite`. The current
  catalogue is `Online` only.
- `delivery`: one or more of `Weekday`, `Weekend`.
- `classes`: defaults to `3 classes/week · 2 hrs each`.
- `price_kobo`: integer amount in kobo (`₦1 = 100 kobo`).
- `image_url`: course-card image path or URL; seeded cards use images in `public/images`.
- `is_active`: hides a course from the public site without deleting it.

## Setup

```bash
psql "$DATABASE_URL" -f db/academy.sql
psql "$DATABASE_URL" -f db/academy.seed.sql
```

The seed is idempotent: courses/modules are upserted, and coupon redemption
counts are never reset. Edit the seed (or the database) to change prices,
durations, modes or module content.

For an existing database, add and populate only the course image field with:

```bash
psql "$DATABASE_URL" -f db/academy.course-images.sql
```

To add or refresh the Introduction to AI course on an existing database, run:

```bash
psql "$DATABASE_URL" -f db/academy.introduction-to-ai.sql
```

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `PAYSTACK_SECRET_KEY` | Yes | Paystack API + webhook signature |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL / callback base |
| `PAYSTACK_CALLBACK_URL` | No | Overrides the default verify callback |
| `ACADEMY_INSTALMENT_DAYS` | No | Days between instalments (default 30) |

Default callback:

```
{NEXT_PUBLIC_SITE_URL}/api/academy/enrolments/verify
```

Paystack dashboard webhook URL:

```
{NEXT_PUBLIC_SITE_URL}/api/academy/webhooks/paystack
```

## Student flow

1. Student opens `/academy/courses/[slug]` and sees the description, duration,
   modes, class schedule, certificate, price and modules.
2. The enrol form collects email, first name, optional last name, phone, plan
   and an optional coupon.
3. `POST /api/academy/enrolments/initialize` re-reads the course price and
   coupon from the database, creates the enrolment and first payment row, then
   returns a Paystack `authorization_url`.
4. The browser is redirected to Paystack hosted checkout.
5. Paystack calls the webhook and redirects the browser to
   `/api/academy/enrolments/verify`. Both paths settle the payment
   idempotently.
6. After settlement the student receives a receipt and welcome email; the
   academy team receives a notification.
7. `/academy/enrol/success` shows the current status, totals and balance. The
   verify redirect sets a short-lived signed cookie so the page loads the
   enrolment automatically without asking for the email again.

## Plans and coupon

- **Full payment**: one Paystack transaction for the total.
- **2 instalments**: 50/50 split, rounded to whole naira so the two halves
  always sum to the total.
- **Coupon**: `WEMRAY25` takes 25% off the course fee. The discount is applied
  before the instalment split and is always recomputed server-side.
- **Balance**: a part-paid student can pay the second instalment from the
  success page or `/academy/enrol/balance?reference=...`.

## Security

- Prices, discounts and instalment amounts are computed on the server only.
- References are generated server-side (`WMA-YYYYMMDD-XXXXXX`).
- Initialize and coupon endpoints are origin-checked, content-type checked,
  size-limited and IP-rate-limited.
- The webhook verifies the raw-body HMAC-SHA512 signature and checks the
  charged amount before settling.
- Status lookups require both the reference and the matching email.
- The success-page auto-load cookie is httpOnly, SameSite=Lax, signed, and
  expires after 15 minutes.
- Card details never touch the application; Paystack hosted checkout keeps PCI
  scope at SAQ-A.

## Admin

- `/admin/courses` lists courses, modes, fees, module and enrolment counts.
- `/admin/enrolments` lists enrolments with status filters and collected total.
- `/admin/enrolments/[id]` shows student, payment attempts, email timestamps and
  allows a manual status update.
- Full course CRUD is deferred to phase 2; edit catalogue content in the
  database/seed for now.

## Emails

`src/lib/email.js` sends:

- `sendEnrolmentWelcome` — course, plan, totals, balance and balance-payment link.
- `sendEnrolmentReceipt` — per-payment receipt.
- `sendEnrolmentNotification` — admin notification with an admin link.
- `sendInstalmentDue` — optional balance reminder (not scheduled automatically).
