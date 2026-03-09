-- Supabase migration: uplodevide.sql
-- Creates the playlist_videos table to store videos uploaded to a specific playlist/course

CREATE TABLE IF NOT EXISTS public.playlist_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
    youtube_url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS
ALTER TABLE public.playlist_videos ENABLE ROW LEVEL SECURITY;

-- Policies for Instructors
CREATE POLICY "Instructors can insert videos into their playlists"
ON public.playlist_videos FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.playlists p
        WHERE p.id = playlist_id
        AND p.created_by = auth.uid()
    )
);

CREATE POLICY "Instructors can view videos in their playlists"
ON public.playlist_videos FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.playlists p
        WHERE p.id = playlist_id
        AND p.created_by = auth.uid()
    )
);

CREATE POLICY "Instructors can update videos in their playlists"
ON public.playlist_videos FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.playlists p
        WHERE p.id = playlist_id
        AND p.created_by = auth.uid()
    )
);

CREATE POLICY "Instructors can delete videos from their playlists"
ON public.playlist_videos FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.playlists p
        WHERE p.id = playlist_id
        AND p.created_by = auth.uid()
    )
);
