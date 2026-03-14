-- ============================================
-- ADD COURSE APPROVAL COLUMNS
-- Run this in Supabase SQL Editor
-- ============================================

-- Add missing columns for course approval workflow
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS instructor_name TEXT,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Set default status to 'draft' for existing courses
UPDATE public.courses SET status = 'draft' WHERE status IS NULL;

-- Update thumbnail_url from existing 'image' column if empty
UPDATE public.courses SET thumbnail_url = image WHERE thumbnail_url IS NULL AND image IS NOT NULL;

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses USING btree (status);
CREATE INDEX IF NOT EXISTS idx_courses_submitted_at ON public.courses USING btree (submitted_at);

-- Verify columns added
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'courses';
