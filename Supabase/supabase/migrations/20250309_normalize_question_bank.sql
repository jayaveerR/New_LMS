-- 1. Loosen question_type constraint to allow all UI-supported types
ALTER TABLE public.question_bank DROP CONSTRAINT IF EXISTS question_bank_question_type_check;
ALTER TABLE public.question_bank
ADD CONSTRAINT question_bank_question_type_check CHECK (
        question_type IN (
            'mcq',
            'true_false',
            'short',
            'long',
            'short_answer',
            'long_answer',
            'fill_blank',
            'match',
            'coding'
        )
    );
-- 2. Ensure columns from latest workflow exists
ALTER TABLE public.question_bank
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (
        approval_status IN ('pending', 'approved', 'rejected')
    );
ALTER TABLE public.question_bank
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;
-- 3. Ensure difficulty constraint matches UI
ALTER TABLE public.question_bank DROP CONSTRAINT IF EXISTS question_bank_difficulty_check;
ALTER TABLE public.question_bank
ADD CONSTRAINT question_bank_difficulty_check CHECK (difficulty IN ('easy', 'medium', 'hard'));
-- 4. Sync created_by column type if needed
-- This ensures it can handle the auth.uid() consistently
ALTER TABLE public.question_bank
ALTER COLUMN created_by TYPE UUID USING created_by::UUID;