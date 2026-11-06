create extension if not exists pgcrypto;

create table if not exists seo_audits (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  url text not null,
  normalized_url text not null,
  final_url text,
  status text not null default 'queued'
    check (status in ('queued', 'running', 'succeeded', 'partial', 'failed')),
  progress smallint not null default 0
    check (progress between 0 and 100),
  overall_score integer
    check (overall_score between 0 and 100),
  grade text,
  category_scores jsonb not null default '{}'::jsonb,
  report jsonb,
  rule_version text not null,
  score_version text not null,
  error_code text,
  error_message text,
  ip_hash text not null,
  user_agent_hash text,
  token_hash text not null,
  token_expires_at timestamptz not null,
  email_status text not null default 'pending'
    check (email_status in ('pending', 'sent', 'failed', 'skipped')),
  contact_deleted_at timestamptz,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz not null default now() + interval '90 days'
);

create unique index if not exists seo_audits_token_hash_idx
  on seo_audits (token_hash);

create index if not exists seo_audits_reference_idx
  on seo_audits (reference);

create index if not exists seo_audits_ip_rate_idx
  on seo_audits (ip_hash, created_at desc);

create index if not exists seo_audits_created_at_idx
  on seo_audits (created_at desc);

create index if not exists seo_audits_expires_at_idx
  on seo_audits (expires_at);

create table if not exists seo_audit_pages (
  id bigserial primary key,
  audit_id uuid not null unique
    references seo_audits(id) on delete cascade,
  url text not null,
  final_url text,
  http_status integer,
  content_type text not null default '',
  bytes integer,
  fetch_ms integer,
  title text not null default '',
  meta_description text not null default '',
  canonical text not null default '',
  lang text not null default '',
  robots_directives text not null default '',
  word_count integer not null default 0,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists seo_audit_issues (
  id bigserial primary key,
  audit_id uuid not null
    references seo_audits(id) on delete cascade,
  rule_id text not null,
  category text not null,
  severity text not null,
  confidence text not null,
  title text not null,
  description text not null default '',
  fix text not null default '',
  evidence jsonb not null default '{}'::jsonb,
  affected_url text not null default '',
  coverage numeric(4,3) not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists seo_audit_issues_audit_idx
  on seo_audit_issues (audit_id, severity);

create table if not exists seo_audit_contacts (
  id bigserial primary key,
  audit_id uuid not null unique
    references seo_audits(id) on delete cascade,
  email_encrypted text not null,
  email_hash text not null,
  first_name_encrypted text not null,
  first_name_hash text not null,
  created_at timestamptz not null default now(),
  retention_until timestamptz not null
);

create index if not exists seo_audit_contacts_email_rate_idx
  on seo_audit_contacts (email_hash, created_at desc);

create index if not exists seo_audit_contacts_retention_idx
  on seo_audit_contacts (retention_until);

create table if not exists seo_consent_records (
  id bigserial primary key,
  audit_id uuid not null
    references seo_audits(id) on delete cascade,
  purpose text not null
    check (purpose in ('report_delivery', 'marketing')),
  consent_version text not null,
  granted boolean not null,
  source text not null default 'ray-seo-analyser',
  created_at timestamptz not null default now(),
  unique (audit_id, purpose)
);

create table if not exists seo_email_deliveries (
  id bigserial primary key,
  audit_id uuid not null
    references seo_audits(id) on delete cascade,
  kind text not null
    check (kind in ('report', 'resend')),
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'failed', 'skipped')),
  provider text not null default 'resend',
  provider_message_id text,
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists seo_email_deliveries_audit_idx
  on seo_email_deliveries (audit_id, created_at desc);

create table if not exists seo_provider_calls (
  id bigserial primary key,
  audit_id uuid not null
    references seo_audits(id) on delete cascade,
  provider text not null,
  endpoint text not null,
  status text not null,
  latency_ms integer,
  cost_units integer not null default 0,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists seo_provider_calls_audit_idx
  on seo_provider_calls (audit_id, created_at desc);
