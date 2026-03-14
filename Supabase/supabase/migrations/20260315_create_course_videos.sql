-- Create course_videos table
CREATE TABLE IF NOT EXISTS public.course_videos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  video_type text DEFAULT 's3',
  video_url text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.course_videos ENABLE ROW LEVEL SECURITY;

-- RLS Policy - instructors can manage their own course videos
CREATE POLICY "Instructors can manage course videos"
  ON public.course_videos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.course_modules cm
      JOIN public.courses c ON c.id = cm.course_id
      WHERE cm.id = course_videos.module_id
      AND c.instructor_id = auth.uid()
    )
  );

-- RLS Policy - published course videos are readable by public
CREATE POLICY "Published course videos are viewable"
  ON public.course_videos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.course_modules cm
      JOIN public.courses c ON c.id = cm.course_id
      WHERE cm.id = course_videos.module_id
      AND c.status IN ('published', 'approved')
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_course_videos_module_id ON public.course_videos(module_id);
CREATE INDEX IF NOT EXISTS idx_course_videos_order ON public.course_videos(module_id, order_index);