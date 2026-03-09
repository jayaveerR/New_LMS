 -- =====================
 -- ADMIN FEATURE TABLES
 -- =====================
 
 -- Platform Settings
 CREATE TABLE public.platform_settings (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     setting_key TEXT NOT NULL UNIQUE,
     setting_value JSONB NOT NULL,
     category TEXT DEFAULT 'general' CHECK (category IN ('general', 'exam', 'security', 'notification', 'leaderboard', 'branding')),
     description TEXT,
     is_public BOOLEAN DEFAULT false,
     updated_by UUID REFERENCES auth.users(id),
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now()
 );
 
 -- System Logs
 CREATE TABLE public.system_logs (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     log_type TEXT NOT NULL CHECK (log_type IN ('info', 'warning', 'error', 'security', 'audit', 'system')),
     module TEXT NOT NULL,
     action TEXT NOT NULL,
     user_id UUID REFERENCES auth.users(id),
     ip_address TEXT,
     user_agent TEXT,
     details JSONB DEFAULT '{}'::jsonb,
     severity INTEGER DEFAULT 1,
     created_at TIMESTAMPTZ DEFAULT now()
 );
 
 -- Create index for faster log queries
 CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at DESC);
 CREATE INDEX idx_system_logs_type ON public.system_logs(log_type);
 CREATE INDEX idx_system_logs_user ON public.system_logs(user_id);
 
 -- User Suspensions
 CREATE TABLE public.user_suspensions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
     reason TEXT NOT NULL,
     suspended_by UUID REFERENCES auth.users(id) NOT NULL,
     suspended_at TIMESTAMPTZ DEFAULT now(),
     expires_at TIMESTAMPTZ,
     is_active BOOLEAN DEFAULT true,
     lifted_at TIMESTAMPTZ,
     lifted_by UUID REFERENCES auth.users(id),
     notes TEXT
 );
 
 -- Course Approvals
 CREATE TABLE public.course_approvals (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL UNIQUE,
     status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'disabled')),
     reviewed_by UUID REFERENCES auth.users(id),
     reviewed_at TIMESTAMPTZ,
     rejection_reason TEXT,
     notes TEXT,
     created_at TIMESTAMPTZ DEFAULT now()
 );
 
 -- Platform Analytics (aggregated data)
 CREATE TABLE public.platform_analytics (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     date DATE NOT NULL,
     metric_type TEXT NOT NULL,
     metric_value JSONB NOT NULL,
     created_at TIMESTAMPTZ DEFAULT now(),
     UNIQUE (date, metric_type)
 );
 
 -- Security Events
 CREATE TABLE public.security_events (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     event_type TEXT NOT NULL CHECK (event_type IN (
         'login_success', 'login_failure', 'logout', 'password_change', 
         'role_change', 'permission_denied', 'suspicious_activity',
         'account_locked', 'account_unlocked', 'api_key_created', 'api_key_revoked'
     )),
     user_id UUID REFERENCES auth.users(id),
     ip_address TEXT,
     user_agent TEXT,
     location TEXT,
     details JSONB DEFAULT '{}'::jsonb,
     risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
     resolved BOOLEAN DEFAULT false,
     resolved_by UUID REFERENCES auth.users(id),
     resolved_at TIMESTAMPTZ,
     created_at TIMESTAMPTZ DEFAULT now()
 );
 
 -- Create index for security events
 CREATE INDEX idx_security_events_created_at ON public.security_events(created_at DESC);
 CREATE INDEX idx_security_events_user ON public.security_events(user_id);
 CREATE INDEX idx_security_events_risk ON public.security_events(risk_level);
 
 -- =====================
 -- HELPER FUNCTIONS
 -- =====================
 
 -- Check if user is admin
 CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
 RETURNS BOOLEAN
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path = public
 AS $$
   SELECT public.has_role(_user_id, 'admin')
 $$;
 
 -- Log system event
 CREATE OR REPLACE FUNCTION public.log_system_event(
     _log_type TEXT,
     _module TEXT,
     _action TEXT,
     _details JSONB DEFAULT '{}'::jsonb
 )
 RETURNS UUID
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
 AS $$
 DECLARE
     new_id UUID;
 BEGIN
     INSERT INTO public.system_logs (log_type, module, action, user_id, details)
     VALUES (_log_type, _module, _action, auth.uid(), _details)
     RETURNING id INTO new_id;
     
     RETURN new_id;
 END;
 $$;
 
 -- =====================
 -- ENABLE RLS
 -- =====================
 
 ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
 ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
 ALTER TABLE public.user_suspensions ENABLE ROW LEVEL SECURITY;
 ALTER TABLE public.course_approvals ENABLE ROW LEVEL SECURITY;
 ALTER TABLE public.platform_analytics ENABLE ROW LEVEL SECURITY;
 ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
 
 -- =====================
 -- RLS POLICIES - ADMIN ACCESS
 -- =====================
 
 -- Platform Settings: Admins can manage all, public settings readable by all
 CREATE POLICY "Admins can manage platform settings"
 ON public.platform_settings FOR ALL
 USING (public.is_admin(auth.uid()));
 
 CREATE POLICY "Public settings are viewable by all"
 ON public.platform_settings FOR SELECT
 USING (is_public = true);
 
 -- System Logs: Only admins
 CREATE POLICY "Admins can view system logs"
 ON public.system_logs FOR SELECT
 USING (public.is_admin(auth.uid()));
 
 CREATE POLICY "System can insert logs"
 ON public.system_logs FOR INSERT
 WITH CHECK (true);
 
 -- User Suspensions: Only admins
 CREATE POLICY "Admins can manage suspensions"
 ON public.user_suspensions FOR ALL
 USING (public.is_admin(auth.uid()));
 
 -- Course Approvals: Admins full access, instructors can view their own
 CREATE POLICY "Admins can manage course approvals"
 ON public.course_approvals FOR ALL
 USING (public.is_admin(auth.uid()));
 
 CREATE POLICY "Instructors can view own course approvals"
 ON public.course_approvals FOR SELECT
 USING (
     EXISTS (
         SELECT 1 FROM public.courses
         WHERE courses.id = course_id
         AND courses.instructor_id = auth.uid()
     )
 );
 
 -- Platform Analytics: Admins and managers
 CREATE POLICY "Admins can view platform analytics"
 ON public.platform_analytics FOR ALL
 USING (public.is_admin(auth.uid()));
 
 CREATE POLICY "Managers can view platform analytics"
 ON public.platform_analytics FOR SELECT
 USING (public.is_manager(auth.uid()));
 
 -- Security Events: Only admins
 CREATE POLICY "Admins can manage security events"
 ON public.security_events FOR ALL
 USING (public.is_admin(auth.uid()));
 
 -- =====================
 -- ADMIN OVERRIDES FOR OTHER TABLES
 -- =====================
 
 -- Admins can view all profiles
 CREATE POLICY "Admins can update all profiles"
 ON public.profiles FOR UPDATE
 USING (public.is_admin(auth.uid()));
 
 -- Admins can manage all user roles
 CREATE POLICY "Admins can insert user roles"
 ON public.user_roles FOR INSERT
 WITH CHECK (public.is_admin(auth.uid()));
 
 CREATE POLICY "Admins can delete user roles"
 ON public.user_roles FOR DELETE
 USING (public.is_admin(auth.uid()));
 
 -- Admins can manage all guest credentials
 CREATE POLICY "Admins full access guest credentials"
 ON public.guest_credentials FOR ALL
 USING (public.is_admin(auth.uid()));
 
 -- =====================
 -- INSERT DEFAULT PLATFORM SETTINGS
 -- =====================
 
 INSERT INTO public.platform_settings (setting_key, setting_value, category, description, is_public) VALUES
 ('platform_name', '"AOTMS Learning Platform"', 'branding', 'Platform display name', true),
 ('max_login_attempts', '5', 'security', 'Maximum failed login attempts before lockout', false),
 ('session_timeout_minutes', '60', 'security', 'Session timeout in minutes', false),
 ('exam_default_duration', '60', 'exam', 'Default exam duration in minutes', false),
 ('exam_negative_marking', 'true', 'exam', 'Enable negative marking by default', false),
 ('leaderboard_visible', 'true', 'leaderboard', 'Show leaderboard to students', true),
 ('leaderboard_update_frequency', '"daily"', 'leaderboard', 'How often to update leaderboard', false),
 ('maintenance_mode', 'false', 'general', 'Enable maintenance mode', false);