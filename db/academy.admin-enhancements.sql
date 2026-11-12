-- Admin-managed academy tracks, generated URL history, and persistent event flyers.
-- Safe to re-run against the Wemray database.

create table if not exists academy_course_slug_history (
  slug text primary key,
  course_id bigint not null references academy_courses (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists academy_course_slug_history_course_idx
  on academy_course_slug_history (course_id);

create table if not exists academy_event_slug_history (
  slug text primary key,
  event_id bigint not null references academy_events (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists academy_event_slug_history_event_idx
  on academy_event_slug_history (event_id);

create table if not exists academy_event_flyers (
  event_id bigint primary key references academy_events (id) on delete cascade,
  content_type text not null check (content_type in ('image/jpeg', 'image/png', 'image/webp')),
  file_data bytea not null check (octet_length(file_data) <= 3145728),
  updated_at timestamptz not null default now()
);
