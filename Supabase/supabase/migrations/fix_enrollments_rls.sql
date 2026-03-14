-- Fix course_enrollments RLS policies

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Admin can view all enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Users can insert enrollments" ON public.course_enrollments;

-- Policy: Users can view their own enrollments
CREATE POLICY "Users can view own enrollments"
ON public.course_enrollments FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: Admin/Manager can view all enrollments
CREATE POLICY "Admin can view all enrollments"
ON public.course_enrollments FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'manager')
    )
);

-- Policy: Users can insert their own enrollments
CREATE POLICY "Users can insert enrollments"
ON public.course_enrollments FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
