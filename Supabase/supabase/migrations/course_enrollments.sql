-- Course Enrollments Table
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

-- Enable RLS
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

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

-- Add to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.course_enrollments;
