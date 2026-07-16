-- Coller dans Supabase Dashboard > SQL Editor > New query

create table if not exists recruiter_proposals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  company_name text not null,
  location_name text not null,
  lat double precision not null,
  lng double precision not null,
  contact_name text,
  contact_email text not null,
  job_type text not null,
  duration text,
  message text,
  status text default 'pending'
);

alter table recruiter_proposals enable row level security;

create policy "Allow public inserts" on recruiter_proposals
  for insert with check (true);

create policy "Allow public select" on recruiter_proposals
  for select using (true);
