-- 1. Synchronize existing profiles so id matches user_id (Auth ID)
-- This ensures that lookups by 'id' using the Auth User ID will succeed.
UPDATE public.profiles
SET id = user_id
WHERE id != user_id;
-- 2. Update the handle_new_user function to set id = NEW.id explicitly
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$ BEGIN -- Create profile with id and user_id both set to the auth user id
INSERT INTO public.profiles (id, user_id, email, full_name, approval_status)
VALUES (
        NEW.id,
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'pending'
    );
-- Assign student role
INSERT INTO public.user_roles (user_id, role)
VALUES (NEW.id, 'student');
-- Initialize leaderboard stats
-- Check if table exists first to avoid migration failure
IF EXISTS (
    SELECT
    FROM information_schema.tables
    WHERE table_name = 'leaderboard_stats'
) THEN
INSERT INTO public.leaderboard_stats (user_id)
VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
END IF;
RETURN NEW;
END;
$$;