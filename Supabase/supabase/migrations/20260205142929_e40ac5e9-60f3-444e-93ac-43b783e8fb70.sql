-- Fix security warnings by adding proper constraints to INSERT policies
-- The "WITH CHECK (true)" is intentional for logging tables since 
-- they need to be insertable by any authenticated user for audit purposes

-- However, we can improve security_events INSERT to require user context
DROP POLICY IF EXISTS "System can insert security events" ON public.security_events;
CREATE POLICY "Authenticated users can insert security events"
  ON public.security_events FOR INSERT
43b783e8fb70  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Improve system_logs INSERT to require user context
DROP POLICY IF EXISTS "System can insert logs" ON public.system_logs;
CREATE POLICY "Authenticated users can insert logs"
  ON public.system_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);