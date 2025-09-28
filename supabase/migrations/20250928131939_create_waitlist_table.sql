-- Create waitlist table for collecting email signups
create table if not exists public.waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  name text,
  created_at timestamp with time zone default now(),
  source text default 'waitlist' check (source in ('waitlist', 'beta')),
  metadata jsonb default '{}',
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.waitlist enable row level security;

-- Create policy for inserting (anyone can join waitlist)
create policy "Anyone can join waitlist" on public.waitlist
  for insert with check (true);

-- Create policy for reading (only authenticated users can view)
create policy "Authenticated users can view waitlist" on public.waitlist
  for select using (auth.role() = 'authenticated');

-- Create index for faster lookups
create index if not exists waitlist_email_idx on public.waitlist (email);
create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);
create index if not exists waitlist_source_idx on public.waitlist (source);

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger update_waitlist_updated_at
  before update on public.waitlist
  for each row execute procedure public.update_updated_at_column();

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant insert on public.waitlist to anon;
grant select on public.waitlist to authenticated;