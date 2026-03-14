-- ============================================
-- FIX FOR COURSE_ENROLLMENTS TABLE RLS
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Disable and re-enable RLS
ALTER TABLE public.course_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- 2. Allow users to view their own enrollments
CREATE POLICY "users_view_own_enrollments"
ON public.course_enrollments
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 3. Allow admin/manager to view all enrollments
CREATE POLICY "admin_view_all_enrollments"
ON public.course_enrollments
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'manager')
    )
);

-- 4. Allow users to insert their own enrollments
CREATE POLICY "users_insert_enrollments"
ON public.course_enrollments
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Verify
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'course_enrollments';
