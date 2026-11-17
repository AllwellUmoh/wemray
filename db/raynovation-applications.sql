-- Raynovation 1.0 applications
-- Run after db/academy.sql has created academy_tracks.

begin;

create table if not exists raynovation_applications (
  id bigserial primary key,
  reference text not null unique,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  whatsapp_phone text not null,
  whatsapp_same_as_phone boolean not null default false,
  date_of_birth date not null,
  sex text not null check (sex in ('Female', 'Male', 'Prefer not to say')),
  has_disability boolean not null,
  address text not null,
  city text not null,
  state text not null,
  country text not null,
  occupation text not null,
  qualification text not null,
  work_experience text not null,
  computer_knowledge boolean not null,
  track_key text not null references academy_tracks (key) on update cascade on delete restrict,
  track_label text not null,
  has_laptop boolean not null,
  has_smartphone boolean not null,
  available_for_sessions boolean not null,
  has_guarantor boolean not null,
  motivation text not null,
  consent boolean not null check (consent),
  status text not null default 'submitted' check (status in ('submitted', 'reviewing', 'accepted', 'selected', 'not_selected')),
  ip_hash text not null,
  user_agent text not null default '',
  confirmation_sent_at timestamptz,
  notification_sent_at timestamptz,
  accepted_email_sent_at timestamptz,
  acceptance_email_claimed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table raynovation_applications
  add column if not exists accepted_email_sent_at timestamptz,
  add column if not exists acceptance_email_claimed_at timestamptz;

alter table raynovation_applications
  drop constraint if exists raynovation_applications_status_check;

alter table raynovation_applications
  add constraint raynovation_applications_status_check
  check (status in ('submitted', 'reviewing', 'accepted', 'selected', 'not_selected'));

create index if not exists raynovation_applications_created_idx
  on raynovation_applications (created_at desc, id desc);

create index if not exists raynovation_applications_email_idx
  on raynovation_applications (lower(email));

create index if not exists raynovation_applications_ip_created_idx
  on raynovation_applications (ip_hash, created_at desc);

commit;
