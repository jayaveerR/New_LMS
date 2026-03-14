-- ============================================
-- CREATE COURSE_ENROLLMENTS TABLE + FIX RLS
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create course_enrollments table
CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL,
    course_name TEXT NOT NULL,
    price TEXT,
    source TEXT DEFAULT 'AOTMS LMS Website',
    enrollment_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
-- Allow users to view their own enrollments
DROP POLICY IF EXISTS "users_view_own_enrollments" ON public.course_enrollments;
CREATE POLICY "users_view_own_enrollments"
ON public.course_enrollments FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Allow admin/manager to view all enrollments
DROP POLICY IF EXISTS "admin_view_all_enrollments" ON public.course_enrollments;
CREATE POLICY "admin_view_all_enrollments"
ON public.course_enrollments FOR SELECT 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'manager')
    )
);

-- Allow users to insert their own enrollments
DROP POLICY IF EXISTS "users_insert_enrollments" ON public.course_enrollments;
CREATE POLICY "users_insert_enrollments"
ON public.course_enrollments FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Verify table and policies
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'course_enrollments';
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'course_enrollments';
