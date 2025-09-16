-- Migration: Create user_files table with RLS, indexes and triggers
-- Created: 2025-01-15
-- Description: Table for storing user text documents with full-text search capabilities

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table: user_files
CREATE TABLE IF NOT EXISTS public.user_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  word_count INT NOT NULL DEFAULT 0,
  char_count INT NOT NULL DEFAULT 0,
  line_count INT NOT NULL DEFAULT 0,
  size_bytes INT NOT NULL DEFAULT 0,
  version INT NOT NULL DEFAULT 0,               -- optimistické zamykanie
  is_new BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL
);

-- Indexy pre výkon
CREATE INDEX IF NOT EXISTS user_files_user_idx
  ON public.user_files (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS user_files_name_idx
  ON public.user_files (user_id, name);

CREATE INDEX IF NOT EXISTS user_files_deleted_idx
  ON public.user_files (deleted_at) WHERE deleted_at IS NULL;

-- Trigger: updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tg_user_files_updated ON public.user_files;
CREATE TRIGGER tg_user_files_updated
BEFORE UPDATE ON public.user_files
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- RLS zapnúť
ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;

-- Policies: vlastník môže čítať a meniť vlastné dáta
DROP POLICY IF EXISTS user_files_select ON public.user_files;
CREATE POLICY user_files_select
ON public.user_files
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_files_insert ON public.user_files;
CREATE POLICY user_files_insert
ON public.user_files
FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_files_update ON public.user_files;
CREATE POLICY user_files_update
ON public.user_files
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_files_delete ON public.user_files;
CREATE POLICY user_files_delete
ON public.user_files
FOR DELETE
USING (auth.uid() = user_id);

-- Bezpečnostná poznámka:
-- "soft delete" cez deleted_at; hard delete len pri cron maintenance mimo aplikácie.

-- Comments pre dokumentáciu
COMMENT ON TABLE public.user_files IS 'User text documents with version control and soft delete';
COMMENT ON COLUMN public.user_files.version IS 'Optimistic locking version number';
COMMENT ON COLUMN public.user_files.is_new IS 'Flag to indicate if file was just created';
COMMENT ON COLUMN public.user_files.deleted_at IS 'Soft delete timestamp - NULL means active file';