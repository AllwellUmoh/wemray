-- Ray Academy events and public event listings.
-- Safe to re-run; this migration only adds the event table and indexes.
--   psql "$DATABASE_URL" -f db/academy.events.sql

create table if not exists academy_events (
  id bigserial primary key,
  slug text not null unique,
  title text not null,
  description text not null default '',
  flyer_url text not null default '',
  event_date date not null,
  start_time time,
  end_time time,
  timezone text not null default 'Africa/Lagos',
  venue text not null default '',
  registration_url text not null default '',
  event_type text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'published', 'cancelled', 'archived')),
  featured boolean not null default false,
  properties jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists academy_events_public_date_idx
  on academy_events (status, event_date, start_time);

create index if not exists academy_events_featured_date_idx
  on academy_events (featured, event_date desc)
  where status = 'published';
