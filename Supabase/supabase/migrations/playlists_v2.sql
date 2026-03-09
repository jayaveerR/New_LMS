
-- 1. Create the updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION update_playlists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create Playlists table
CREATE TABLE IF NOT EXISTS public.playlists (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  instructor_id uuid NOT NULL,
  course_id uuid NULL,
  title text NOT NULL,
  description text NULL,
  youtube_url text NULL,
  thumbnail_url text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT playlists_pkey PRIMARY KEY (id),
  CONSTRAINT playlists_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses (id) ON DELETE CASCADE,
  CONSTRAINT playlists_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_playlists_instructor ON public.playlists USING btree (instructor_id);
CREATE INDEX IF NOT EXISTS idx_playlists_course ON public.playlists USING btree (course_id);

-- 4. Trigger
DROP TRIGGER IF EXISTS trg_playlists_updated_at ON public.playlists;
CREATE TRIGGER trg_playlists_updated_at 
BEFORE UPDATE ON public.playlists 
FOR EACH ROW
EXECUTE FUNCTION update_playlists_updated_at ();

-- 5. RLS
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can manage their own playlists" 
ON public.playlists FOR ALL 
USING (auth.uid() = instructor_id);

CREATE POLICY "Anyone can view playlists" 
ON public.playlists FOR SELECT 
USING (true);
