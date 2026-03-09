-- Migration to add approval_status to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';
-- Optional: Update existing users to approved if they already have roles
UPDATE public.profiles p
SET approval_status = 'approved'
FROM public.user_roles ur
WHERE p.id = ur.user_id
    AND p.approval_status = 'pending';