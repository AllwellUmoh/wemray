-- ============================================================
-- Ray Academy — courses, modules, coupons, enrolments, payments
-- Run once against the Wemray database:
--   psql "$DATABASE_URL" -f db/academy.sql
-- ============================================================

-- Tracks ------------------------------------------------------
create table if not exists academy_tracks (
  id bigserial primary key,
  key text not null unique,
  label text not null,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Courses -----------------------------------------------------
-- formats  : where you can attend  -> Hybrid | Online | Onsite (1 or more)
-- delivery : when you can attend   -> Weekday | Weekend (1 or more)
create table if not exists academy_courses (
  id bigserial primary key,
  slug text not null unique,
  number text not null default '',
  title text not null,
  track_key text not null references academy_tracks (key) on update cascade on delete restrict,
  formats text[] not null default '{Online}'::text[]
    check (formats <@ array['Hybrid', 'Online', 'Onsite']::text[] and array_length(formats, 1) >= 1),
  delivery text[] not null default '{Weekday}'::text[]
    check (delivery <@ array['Weekday', 'Weekend']::text[] and array_length(delivery, 1) >= 1),
  duration text not null default '12 weeks',
  classes text not null default '3 classes/week · 2 hrs each',
  certificate text not null default 'Certificate of completion',
  description text not null default '',
  outcome text not null default '',
  price_kobo bigint not null default 0 check (price_kobo >= 0),
  icon text not null default 'monitor',
  image_url text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Existing catalogues gain the same optional card image field on rerun.
alter table academy_courses
  add column if not exists image_url text not null default '';

create index if not exists academy_courses_active_idx
  on academy_courses (is_active, sort_order);

create index if not exists academy_courses_track_idx
  on academy_courses (track_key);

create index if not exists academy_courses_formats_idx
  on academy_courses using gin (formats);

-- Modules -----------------------------------------------------
create table if not exists academy_course_modules (
  id bigserial primary key,
  course_id bigint not null references academy_courses (id) on delete cascade,
  number text not null default '',
  title text not null,
  summary text not null default '',
  topics jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (course_id, number)
);

create index if not exists academy_course_modules_course_idx
  on academy_course_modules (course_id, sort_order);

-- Coupons -----------------------------------------------------
-- course_slug null  = works on every course
-- max_redemptions null = unlimited
-- expires_at null   = never expires
create table if not exists academy_coupons (
  id bigserial primary key,
  code text not null unique,
  label text not null default '',
  percent_off integer not null check (percent_off between 1 and 100),
  max_redemptions integer,
  redemptions integer not null default 0,
  course_slug text,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Enrolments --------------------------------------------------
create table if not exists academy_enrolments (
  id bigserial primary key,
  reference text not null unique,
  course_id bigint references academy_courses (id) on delete set null,
  course_slug text not null,
  course_title text not null,
  full_name text not null,
  email text not null,
  phone text not null,
  plan text not null default 'full' check (plan in ('full', 'installment')),
  base_price_kobo bigint not null default 0,
  discount_kobo bigint not null default 0,
  coupon_code text,
  total_kobo bigint not null default 0,
  amount_paid_kobo bigint not null default 0,
  currency text not null default 'NGN',
  status text not null default 'pending'
    check (status in ('pending', 'part_paid', 'paid', 'failed', 'abandoned', 'refunded')),
  paystack_reference text,
  ip_hash text not null default '',
  user_agent text not null default '',
  note text not null default '',
  welcome_email_sent_at timestamptz,
  receipt_email_sent_at timestamptz,
  admin_notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists academy_enrolments_email_idx
  on academy_enrolments (lower(email));

create index if not exists academy_enrolments_status_idx
  on academy_enrolments (status, created_at desc);

create index if not exists academy_enrolments_ip_idx
  on academy_enrolments (ip_hash, created_at desc);

-- Payments ----------------------------------------------------
create table if not exists academy_enrolment_payments (
  id bigserial primary key,
  enrolment_id bigint not null references academy_enrolments (id) on delete cascade,
  reference text not null unique,
  installment_no integer not null default 1 check (installment_no in (1, 2)),
  amount_kobo bigint not null default 0,
  paystack_reference text,
  status text not null default 'pending'
    check (status in ('pending', 'success', 'failed', 'abandoned', 'reversed')),
  channel text not null default '',
  gateway_response text not null default '',
  verified_at timestamptz,
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists academy_payments_enrolment_idx
  on academy_enrolment_payments (enrolment_id, installment_no);

create index if not exists academy_payments_status_idx
  on academy_enrolment_payments (status, created_at desc);
