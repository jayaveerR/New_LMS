-- =====================
-- Auto-approve all existing users who have admin or manager roles
-- This ensures admins/managers are never stuck on the pending-approval page
-- =====================
-- 1. Auto-approve profiles for users with admin role
UPDATE public.profiles
SET approval_status = 'approved'
WHERE id IN (
        SELECT user_id
        FROM public.user_roles
        WHERE role = 'admin'
    )
    AND (
        approval_status IS NULL
        OR approval_status = 'pending'
    );
-- 2. Auto-approve profiles for users with manager role  
UPDATE public.profiles
SET approval_status = 'approved'
WHERE id IN (
        SELECT user_id
        FROM public.user_roles
        WHERE role = 'manager'
    )
    AND (
        approval_status IS NULL
        OR approval_status = 'pending'
    );
-- 3. Ensure default approval_status exists (safe to re-run)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';
-- 4. Update the handle_new_user trigger to auto-approve admin/manager users
-- (This relies on role assignment happening before profile creation, which it doesn't by default)
-- Instead: ensure any future role assignment also updates approval_status
-- Create a trigger function that auto-approves when role is set to admin/manager
CREATE OR REPLACE FUNCTION public.auto_approve_on_role() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$ BEGIN IF NEW.role IN ('admin', 'manager') THEN
UPDATE public.profiles
SET approval_status = 'approved'
WHERE id = NEW.user_id;
END IF;
RETURN NEW;
END;
$$;
-- Attach trigger to user_roles table
DROP TRIGGER IF EXISTS on_role_assigned ON public.user_roles;
CREATE TRIGGER on_role_assigned
AFTER
INSERT
    OR
UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.auto_approve_on_role();