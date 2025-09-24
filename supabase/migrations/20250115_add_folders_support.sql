-- Add folders support to TextNotepad
-- Migration: Add folders table and update user_files to support folder organization

-- Create folders table
create table folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on folders table
alter table folders enable row level security;

-- RLS policies for folders - users can only access their own folders
create policy "folders_select" on folders for select using (auth.uid() = user_id);
create policy "folders_insert" on folders for insert with check (auth.uid() = user_id);
create policy "folders_update" on folders for update using (auth.uid() = user_id);
create policy "folders_delete" on folders for delete using (auth.uid() = user_id);

-- Add folder_id column to user_files table (nullable for backwards compatibility)
alter table user_files add column folder_id uuid references folders(id) on delete set null;

-- Add index for efficient folder-based queries
create index user_files_user_folder_idx on user_files (user_id, folder_id);

-- Add updated_at trigger for folders table
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_folders_updated_at
  before update on folders
  for each row
  execute function update_updated_at_column();