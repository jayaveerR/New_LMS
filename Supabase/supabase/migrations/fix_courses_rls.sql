-- Drop existing policies on courses table
DROP POLICY IF EXISTS "Anyone can view courses" ON public.courses;
DROP POLICY IF EXISTS "Admin can manage courses" ON public.courses;

-- Create policy: Anyone can view active courses (including anonymous)
CREATE POLICY "Anyone can view courses"
ON public.courses FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Create policy: Admin can manage courses
CREATE POLICY "Admin can manage courses"
ON public.courses FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);
