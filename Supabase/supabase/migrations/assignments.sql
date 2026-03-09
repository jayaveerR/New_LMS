-- Assignment Dashboard Schema
-- Drop existing tables for a clean slate
DROP TABLE IF EXISTS public.assignment_submissions;
DROP TABLE IF EXISTS public.assignments;

-- 1. Assignments Table
CREATE TABLE public.assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  course_id uuid NOT NULL,
  instructor_id uuid NOT NULL,
  title text NOT NULL,
  description text NULL,
  module_id uuid NULL, -- Optional link to module
  submission_types text[] DEFAULT '{file}'::text[], -- {file, text, code, link}
  max_marks integer DEFAULT 100,
  deadline timestamp with time zone NOT NULL,
  allow_late_submissions boolean DEFAULT false,
  late_penalty_percentage integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
  reference_files jsonb DEFAULT '[]'::jsonb, -- Array of {name, url}
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT assignments_pkey PRIMARY KEY (id)
);

-- 2. Submissions Table
CREATE TABLE public.assignment_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  submission_data jsonb NOT NULL, -- {type, content, file_url}
  submitted_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'graded', 'late')),
  score numeric(5,2) NULL,
  feedback text NULL,
  feedback_files jsonb DEFAULT '[]'::jsonb,
  is_plagiarism_flagged boolean DEFAULT false,
  plagiarism_score integer DEFAULT 0,
  CONSTRAINT assignment_submissions_pkey PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Assignments Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Instructors can manage own assignments" ON public.assignments;
    DROP POLICY IF EXISTS "Students can view active assignments" ON public.assignments;
END $$;

CREATE POLICY "Instructors can manage own assignments" ON public.assignments FOR ALL USING (true);
CREATE POLICY "Students can view active assignments" ON public.assignments FOR SELECT USING (status = 'active');

-- Submissions Policies
DO $$ BEGIN
    DROP POLICY IF EXISTS "Instructors can view/grade submissions" ON public.assignment_submissions;
    DROP POLICY IF EXISTS "Students can manage own submissions" ON public.assignment_submissions;
END $$;

CREATE POLICY "Instructors can view/grade submissions" ON public.assignment_submissions FOR ALL USING (true);
CREATE POLICY "Students can manage own submissions" ON public.assignment_submissions FOR ALL USING (auth.uid() = student_id);

-- Storage bucket for assignments
-- (Run this in Supabase dashboard or via API if using storage)
-- Bucket: assignments-files
