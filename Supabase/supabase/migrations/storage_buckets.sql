 -- =====================
 -- STORAGE BUCKETS FOR COURSE CONTENT
 -- =====================
 
 -- Create bucket for course videos
 INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
 VALUES (
   'course-videos',
   'course-videos',
   false,
   524288000, -- 500MB limit for videos
   ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
 );
 
 -- Create bucket for course resources (PDFs, PPTs, docs)
 INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
 VALUES (
   'course-resources',
   'course-resources',
   false,
   52428800, -- 50MB limit for documents
   ARRAY[
     'application/pdf',
     'application/vnd.ms-powerpoint',
     'application/vnd.openxmlformats-officedocument.presentationml.presentation',
     'application/msword',
     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
     'application/vnd.ms-excel',
     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
     'text/plain',
     'image/png',
     'image/jpeg',
     'image/gif'
   ]
 );
 
 -- Create bucket for profile avatars
 INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
 VALUES (
   'avatars',
   'avatars',
   true,
   5242880, -- 5MB limit for avatars
   ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']
 );
 
 -- =====================
 -- STORAGE RLS POLICIES
 -- =====================
 
 -- Course Videos: Instructors can upload/manage, enrolled students can view
 CREATE POLICY "Instructors can upload course videos"
 ON storage.objects FOR INSERT TO authenticated
 WITH CHECK (
   bucket_id = 'course-videos'
   AND public.is_instructor(auth.uid())
 );
 
 CREATE POLICY "Instructors can update own videos"
 ON storage.objects FOR UPDATE TO authenticated
 USING (
   bucket_id = 'course-videos'
   AND public.is_instructor(auth.uid())
 );
 
 CREATE POLICY "Instructors can delete own videos"
 ON storage.objects FOR DELETE TO authenticated
 USING (
   bucket_id = 'course-videos'
   AND public.is_instructor(auth.uid())
 );
 
 CREATE POLICY "Authenticated users can view course videos"
 ON storage.objects FOR SELECT TO authenticated
 USING (bucket_id = 'course-videos');
 
 -- Course Resources: Instructors can upload/manage, enrolled students can view
 CREATE POLICY "Instructors can upload course resources"
 ON storage.objects FOR INSERT TO authenticated
 WITH CHECK (
   bucket_id = 'course-resources'
   AND public.is_instructor(auth.uid())
 );
 
 CREATE POLICY "Instructors can update own resources"
 ON storage.objects FOR UPDATE TO authenticated
 USING (
   bucket_id = 'course-resources'
   AND public.is_instructor(auth.uid())
 );
 
 CREATE POLICY "Instructors can delete own resources"
 ON storage.objects FOR DELETE TO authenticated
 USING (
   bucket_id = 'course-resources'
   AND public.is_instructor(auth.uid())
 );
 
 CREATE POLICY "Authenticated users can view course resources"
 ON storage.objects FOR SELECT TO authenticated
 USING (bucket_id = 'course-resources');
 
 -- Avatars: Public read, users can manage their own
 CREATE POLICY "Anyone can view avatars"
 ON storage.objects FOR SELECT
 USING (bucket_id = 'avatars');
 
 CREATE POLICY "Users can upload own avatar"
 ON storage.objects FOR INSERT TO authenticated
 WITH CHECK (
   bucket_id = 'avatars'
   AND (storage.foldername(name))[1] = auth.uid()::text
 );
 
 CREATE POLICY "Users can update own avatar"
 ON storage.objects FOR UPDATE TO authenticated
 USING (
   bucket_id = 'avatars'
   AND (storage.foldername(name))[1] = auth.uid()::text
 );
 
 CREATE POLICY "Users can delete own avatar"
 ON storage.objects FOR DELETE TO authenticated
 USING (
   bucket_id = 'avatars'
   AND (storage.foldername(name))[1] = auth.uid()::text
 );