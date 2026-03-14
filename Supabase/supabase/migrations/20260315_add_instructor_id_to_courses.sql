-- Add instructor_id column to courses table for course assignment feature
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS instructor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON public.courses(instructor_id);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create policy for instructors to see their own courses
DROP POLICY IF EXISTS "Instructors can view their own courses" ON public.courses;
CREATE POLICY "Instructors can view their own courses" ON public.courses
    FOR SELECT USING (auth.uid() = instructor_id);

-- Create policy for admin/manager to see all courses
DROP POLICY IF EXISTS "Admin/Manager can view all courses" ON public.courses;
CREATE POLICY "Admin/Manager can view all courses" ON public.courses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role IN ('admin', 'manager')
        )
    );
