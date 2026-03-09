
-- Drop existing table if required for full refresh
DROP TABLE IF EXISTS public.course_resources;

-- Simplified course_resources table with only requested fields
CREATE TABLE IF NOT EXISTS public.course_resources (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  course_id uuid NOT NULL, -- Logical link to course
  upload_format text NOT NULL, -- e.g. .pdf, .docx
  asset_title text NOT NULL,
  resource_type text NOT NULL, -- e.g. Study Material, PPT
  short_description text NULL,
  instructor_avatar_url text NULL, -- Instructor details
  instructor_name text NULL,
  file_url text NOT NULL, -- Required for download
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT course_resources_pkey PRIMARY KEY (id)
  -- Foreign key removed to allow flexible testing during development
) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE public.course_resources ENABLE ROW LEVEL SECURITY;

-- Storage Bucket Policies (Clean version with DROP first)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
    DROP POLICY IF EXISTS "Allow public select" ON storage.objects;
    DROP POLICY IF EXISTS "Allow metadata management" ON storage.objects;
END $$;

CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'course-resources');
CREATE POLICY "Allow public select" ON storage.objects FOR SELECT TO public USING (bucket_id = 'course-resources');
CREATE POLICY "Allow metadata management" ON storage.objects FOR ALL TO public USING (bucket_id = 'course-resources');

-- Database Policies (Clean version with DROP first)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Anyone can view resources" ON public.course_resources;
    DROP POLICY IF EXISTS "Public manage resources" ON public.course_resources;
END $$;

CREATE POLICY "Anyone can view resources" ON public.course_resources FOR SELECT USING (true);
CREATE POLICY "Public manage resources" ON public.course_resources FOR ALL USING (true);
