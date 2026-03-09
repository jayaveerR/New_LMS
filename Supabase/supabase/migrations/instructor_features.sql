 -- =====================
 -- INSTRUCTOR FEATURE TABLES
 -- =====================
 
 -- Course topics for tracking completion
 CREATE TABLE public.course_topics (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
     title TEXT NOT NULL,
     description TEXT,
     order_index INTEGER DEFAULT 0,
     is_completed BOOLEAN DEFAULT false,
     completed_at TIMESTAMPTZ,
     created_at TIMESTAMPTZ DEFAULT now()
 );
 
 -- Course resources (notes, PPTs, assignments)
 CREATE TABLE public.course_resources (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
     uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
     title TEXT NOT NULL,
     description TEXT,
     resource_type TEXT NOT NULL CHECK (resource_type IN ('note', 'ppt', 'assignment', 'pdf', 'other')),
     file_url TEXT NOT NULL,
     file_size INTEGER,
     order_index INTEGER DEFAULT 0,
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now()
 );
 
 -- Course announcements
 CREATE TABLE public.announcements (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
     instructor_id UUID REFERENCES auth.users(id) NOT NULL,
     title TEXT NOT NULL,
     content TEXT NOT NULL,
     priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
     is_pinned BOOLEAN DEFAULT false,
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now()
 );
 
 -- Course timeline/milestones
 CREATE TABLE public.course_timeline (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
     title TEXT NOT NULL,
     description TEXT,
     milestone_date DATE NOT NULL,
     milestone_type TEXT DEFAULT 'general' CHECK (milestone_type IN ('start', 'deadline', 'exam', 'live_class', 'general')),
     is_completed BOOLEAN DEFAULT false,
     created_at TIMESTAMPTZ DEFAULT now()
 );
 
 -- Student topic progress tracking
 CREATE TABLE public.student_topic_progress (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
     topic_id UUID REFERENCES public.course_topics(id) ON DELETE CASCADE NOT NULL,
     is_completed BOOLEAN DEFAULT false,
     completed_at TIMESTAMPTZ,
     UNIQUE (user_id, topic_id)
 );
 
 -- =====================
 -- HELPER FUNCTIONS
 -- =====================
 
 -- Check if user is instructor of a course
 CREATE OR REPLACE FUNCTION public.is_course_instructor(_user_id UUID, _course_id UUID)
 RETURNS BOOLEAN
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path = public
 AS $$
   SELECT EXISTS (
     SELECT 1
     FROM public.courses
     WHERE id = _course_id
       AND instructor_id = _user_id
   )
 $$;
 
 -- Check if user is an instructor (has instructor role)
 CREATE OR REPLACE FUNCTION public.is_instructor(_user_id UUID)
 RETURNS BOOLEAN
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path = public
 AS $$
   SELECT public.has_role(_user_id, 'instructor')
 $$;
 
 -- =====================
 -- ENABLE RLS
 -- =====================
 
 ALTER TABLE public.course_topics ENABLE ROW LEVEL SECURITY;
 ALTER TABLE public.course_resources ENABLE ROW LEVEL SECURITY;
 ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
 ALTER TABLE public.course_timeline ENABLE ROW LEVEL SECURITY;
 ALTER TABLE public.student_topic_progress ENABLE ROW LEVEL SECURITY;
 
 -- =====================
 -- RLS POLICIES - INSTRUCTOR ACCESS
 -- =====================
 
 -- Instructors can manage their own courses
 CREATE POLICY "Instructors can view own courses" ON public.courses
     FOR SELECT USING (instructor_id = auth.uid());
 
 CREATE POLICY "Instructors can create courses" ON public.courses
     FOR INSERT WITH CHECK (
         auth.uid() = instructor_id 
         AND public.is_instructor(auth.uid())
     );
 
 CREATE POLICY "Instructors can update own courses" ON public.courses
     FOR UPDATE USING (instructor_id = auth.uid());
 
 CREATE POLICY "Instructors can delete own courses" ON public.courses
     FOR DELETE USING (instructor_id = auth.uid());
 
 -- Videos: Instructors can manage videos for their courses
 CREATE POLICY "Instructors can manage course videos" ON public.videos
     FOR ALL USING (public.is_course_instructor(auth.uid(), course_id));
 
 -- Live classes: Instructors can manage for their courses
 CREATE POLICY "Instructors can manage live classes" ON public.live_classes
     FOR ALL USING (public.is_course_instructor(auth.uid(), course_id));
 
 -- Mock papers: Instructors can manage for their courses
 CREATE POLICY "Instructors can manage mock papers" ON public.mock_papers
     FOR ALL USING (public.is_course_instructor(auth.uid(), course_id));
 
 -- Live exams: Instructors can manage for their courses
 CREATE POLICY "Instructors can manage live exams" ON public.live_exams
     FOR ALL USING (public.is_course_instructor(auth.uid(), course_id));
 
 -- Instructors can view exam attempts for their courses
 CREATE POLICY "Instructors can view course exam attempts" ON public.live_exam_attempts
     FOR SELECT USING (
         EXISTS (
             SELECT 1 FROM public.live_exams le
             JOIN public.courses c ON le.course_id = c.id
             WHERE le.id = live_exam_id
             AND c.instructor_id = auth.uid()
         )
     );
 
 -- Instructors can view mock paper attempts for their courses
 CREATE POLICY "Instructors can view course mock attempts" ON public.mock_paper_attempts
     FOR SELECT USING (
         EXISTS (
             SELECT 1 FROM public.mock_papers mp
             JOIN public.courses c ON mp.course_id = c.id
             WHERE mp.id = mock_paper_id
             AND c.instructor_id = auth.uid()
         )
     );
 
 -- Instructors can view enrollments for their courses
 CREATE POLICY "Instructors can view course enrollments" ON public.course_enrollments
     FOR SELECT USING (
         EXISTS (
             SELECT 1 FROM public.courses
             WHERE id = course_id
             AND instructor_id = auth.uid()
         )
     );
 
 -- =====================
 -- RLS POLICIES - NEW TABLES
 -- =====================
 
 -- Course Topics
 CREATE POLICY "Instructors can manage course topics" ON public.course_topics
     FOR ALL USING (public.is_course_instructor(auth.uid(), course_id));
 
 CREATE POLICY "Enrolled students can view topics" ON public.course_topics
     FOR SELECT USING (public.is_enrolled(auth.uid(), course_id));
 
 -- Course Resources
 CREATE POLICY "Instructors can manage course resources" ON public.course_resources
     FOR ALL USING (public.is_course_instructor(auth.uid(), course_id));
 
 CREATE POLICY "Enrolled students can view resources" ON public.course_resources
     FOR SELECT USING (public.is_enrolled(auth.uid(), course_id));
 
 -- Announcements
 CREATE POLICY "Instructors can manage announcements" ON public.announcements
     FOR ALL USING (public.is_course_instructor(auth.uid(), course_id));
 
 CREATE POLICY "Enrolled students can view announcements" ON public.announcements
     FOR SELECT USING (public.is_enrolled(auth.uid(), course_id));
 
 -- Course Timeline
 CREATE POLICY "Instructors can manage timeline" ON public.course_timeline
     FOR ALL USING (public.is_course_instructor(auth.uid(), course_id));
 
 CREATE POLICY "Enrolled students can view timeline" ON public.course_timeline
     FOR SELECT USING (public.is_enrolled(auth.uid(), course_id));
 
 -- Student Topic Progress
 CREATE POLICY "Students can manage own progress" ON public.student_topic_progress
     FOR ALL USING (auth.uid() = user_id);
 
 CREATE POLICY "Instructors can view student progress" ON public.student_topic_progress
     FOR SELECT USING (
         EXISTS (
             SELECT 1 FROM public.course_topics ct
             JOIN public.courses c ON ct.course_id = c.id
             WHERE ct.id = topic_id
             AND c.instructor_id = auth.uid()
         )
     );
 
 -- =====================
 -- ADMIN ACCESS
 -- =====================
 
 -- Admins can manage all courses
 CREATE POLICY "Admins can manage all courses" ON public.courses
     FOR ALL USING (public.has_role(auth.uid(), 'admin'));
 
 -- Admins can view all user roles
 CREATE POLICY "Admins can manage user roles" ON public.user_roles
     FOR ALL USING (public.has_role(auth.uid(), 'admin'));
 
 -- Admins can view all profiles
 CREATE POLICY "Admins can view all profiles" ON public.profiles
     FOR SELECT USING (public.has_role(auth.uid(), 'admin'));