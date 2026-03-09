-- Add approval_status to question_bank
ALTER TABLE public.question_bank
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (
        approval_status IN ('pending', 'approved', 'rejected')
    );
-- Add approval_status to mock_papers
ALTER TABLE public.mock_papers
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (
        approval_status IN ('pending', 'approved', 'rejected')
    );
-- Create student_exam_access table for UUID-based student access
CREATE TABLE IF NOT EXISTS public.student_exam_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    exam_id UUID REFERENCES public.exam_schedules(id) ON DELETE CASCADE,
    mock_paper_id UUID REFERENCES public.mock_papers(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (student_id, exam_id),
    UNIQUE (student_id, mock_paper_id)
);
-- Enable RLS
ALTER TABLE public.student_exam_access ENABLE ROW LEVEL SECURITY;
-- Policies for student_exam_access
CREATE POLICY "Managers can manage student_exam_access" ON public.student_exam_access FOR ALL USING (public.is_admin_or_manager(auth.uid()));
CREATE POLICY "Students can view their own access" ON public.student_exam_access FOR
SELECT USING (auth.uid() = student_id);
-- Update RLS for question_bank to allow Admin/Manager to update approval_status
-- (Existing policies might already cover this via is_admin_or_manager, but let's be explicit if needed)
CREATE POLICY "Admins can update question_bank approval_status" ON public.question_bank FOR
UPDATE USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));