-- Create course_modules table
CREATE TABLE IF NOT EXISTS public.course_modules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

-- RLS Policy - instructors can manage their own course modules
CREATE POLICY "Instructors can manage course modules"
  ON public.course_modules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_modules.course_id
      AND c.instructor_id = auth.uid()
    )
  );

-- RLS Policy - published courses modules are readable by public
CREATE POLICY "Published course modules are viewable"
  ON public.course_modules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_modules.course_id
      AND c.status IN ('published', 'approved')
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_order ON public.course_modules(course_id, order_index);