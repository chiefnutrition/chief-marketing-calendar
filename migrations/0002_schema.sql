-- Shared team marketing calendar (unowned rows — no per-user accounts).
create table if not exists team_settings (
  id integer primary key check (id = 1),
  password_hash text not null,
  session_secret text not null,
  updated_at timestamptz not null default now()
);

create table if not exists key_dates (
  id serial primary key,
  name text not null,
  start_date date not null,
  end_date date,
  region text not null,
  category text not null,
  notes text not null default '',
  is_system boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists campaigns (
  id serial primary key,
  title text not null,
  channel text not null,
  send_date date not null,
  send_time text not null default '',
  market text not null,
  status text not null default 'draft',
  subject text not null default '',
  audience text not null default '',
  notes text not null default '',
  key_date_id integer references key_dates(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists key_dates_start_idx on key_dates (start_date);
create index if not exists key_dates_region_idx on key_dates (region);
create index if not exists campaigns_send_idx on campaigns (send_date);
