-- Add question_bank_topic and access_type columns to student_exam_access
-- to support granting students access to specific question bank topics
ALTER TABLE public.student_exam_access
ADD COLUMN IF NOT EXISTS question_bank_topic TEXT,
    ADD COLUMN IF NOT EXISTS access_type TEXT DEFAULT 'exam',
    ADD COLUMN IF NOT EXISTS granted_at TIMESTAMPTZ DEFAULT now();
-- Allow null exam_id and mock_paper_id when access is question_bank type
-- The existing NOT NULL constraints may need to be relaxed
ALTER TABLE public.student_exam_access
ALTER COLUMN exam_id DROP NOT NULL,
    ALTER COLUMN mock_paper_id DROP NOT NULL;
-- Add a unique constraint for question_bank access
ALTER TABLE public.student_exam_access DROP CONSTRAINT IF EXISTS student_exam_access_student_id_question_bank_topic_key;
ALTER TABLE public.student_exam_access
ADD CONSTRAINT student_exam_access_student_id_question_bank_topic_key UNIQUE (student_id, question_bank_topic);
-- RLS: Managers can insert access records
CREATE POLICY IF NOT EXISTS "Managers can grant access" ON public.student_exam_access FOR
INSERT TO authenticated WITH CHECK (
        public.has_role(auth.uid(), 'manager')
        OR public.has_role(auth.uid(), 'admin')
    );
-- Students can see their own access
CREATE POLICY IF NOT EXISTS "Students see their own access" ON public.student_exam_access FOR
SELECT TO authenticated USING (
        student_id = auth.uid()
        OR public.has_role(auth.uid(), 'manager')
        OR public.has_role(auth.uid(), 'admin')
    );