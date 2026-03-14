-- ============================================
-- COMPLETE FIX FOR COURSES TABLE RLS
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Disable and re-enable RLS to clear old policies
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- 2. Allow anyone (anon) to read active courses
CREATE POLICY "public_read_courses"
ON public.courses
FOR SELECT
TO anon
USING (is_active = true);

-- 3. Allow authenticated users to read courses
CREATE POLICY "authenticated_read_courses"
ON public.courses
FOR SELECT
TO authenticated
USING (is_active = true);

-- 4. Allow admins to manage courses (no WITH CHECK for SELECT)
CREATE POLICY "admin_manage_courses"
ON public.courses
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

-- 5. Allow instructors to manage their courses
CREATE POLICY "instructor_manage_courses"
ON public.courses
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'instructor'
    )
);

-- Verify
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'courses';
