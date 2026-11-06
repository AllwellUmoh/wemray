create table if not exists contact_enquiries (
  id bigserial primary key,
  reference text not null unique,
  name text not null,
  email text not null,
  organisation text not null default '',
  budget text not null default '',
  service text not null,
  details text not null default '',
  intent text not null default 'conversation'
    check (intent in ('conversation', 'consultation')),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'qualified', 'won', 'lost', 'archived')),
  admin_notes text not null default '',
  ip_hash text not null,
  user_agent text not null default '',
  confirmation_sent_at timestamptz,
  notification_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_enquiries_created_at_idx
  on contact_enquiries (created_at desc);

create index if not exists contact_enquiries_status_idx
  on contact_enquiries (status);

create index if not exists contact_enquiries_ip_rate_idx
  on contact_enquiries (ip_hash, created_at desc);
