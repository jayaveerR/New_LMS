-- Table: courses
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    instructor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT,
    level TEXT,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
-- Table: course_modules
CREATE TABLE IF NOT EXISTS public.course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
-- Table: course_videos
CREATE TABLE IF NOT EXISTS public.course_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    video_type TEXT DEFAULT 's3',
    video_url TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_videos ENABLE ROW LEVEL SECURITY;
-- RLS Policies for courses
CREATE POLICY "Public courses are viewable by everyone" ON public.courses FOR
SELECT USING (status = 'published');
CREATE POLICY "Instructors can CRUD their own courses" ON public.courses FOR ALL USING (auth.uid() = instructor_id);
-- RLS Policies for course_modules
CREATE POLICY "Modules viewable if course is published or by instructor" ON public.course_modules FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.courses
            WHERE id = course_id
                AND (
                    status = 'published'
                    OR instructor_id = auth.uid()
                )
        )
    );
CREATE POLICY "Instructors can CRUD modules of their courses" ON public.course_modules FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.courses
        WHERE id = course_id
            AND instructor_id = auth.uid()
    )
);
-- RLS Policies for course_videos
CREATE POLICY "Videos viewable if course is published or by instructor" ON public.course_videos FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.course_modules cm
                JOIN public.courses c ON c.id = cm.course_id
            WHERE cm.id = module_id
                AND (
                    c.status = 'published'
                    OR c.instructor_id = auth.uid()
                )
        )
    );
CREATE POLICY "Instructors can CRUD videos of their courses" ON public.course_videos FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.course_modules cm
            JOIN public.courses c ON c.id = cm.course_id
        WHERE cm.id = module_id
            AND c.instructor_id = auth.uid()
    )
);
-- Note: Depending on your exact requirements, you might also need policies for authenticated students 
-- who are specifically enrolled to view the modules/videos, but the above allows any student to view 
-- published course content.