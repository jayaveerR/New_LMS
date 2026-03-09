import { fetchWithAuth } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Types for admin data
export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  status: 'active' | 'suspended';
  approval_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  last_active_at: string | null;
  created_at: string;
  role?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'manager' | 'instructor' | 'student';
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor_id: string | null;
  instructor_name: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'disabled' | 'published' | 'draft';
  category: string | null;
  thumbnail_url: string | null;
  submitted_at?: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export interface SecurityEvent {
  id: string;
  event_type: string;
  user_id: string | null;
  user_email: string | null;
  ip_address: string | null;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, unknown> | null;
  resolved: boolean;
  created_at: string;
}

export interface SystemLog {
  id: string;
  log_type: 'info' | 'warning' | 'error' | 'audit' | 'system';
  module: string;
  action: string;
  user_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  activeCourses: number;
  pendingCourses: number;
  securityEvents: number;
  highPriorityEvents: number;
  roleCounts: Record<string, number>;
}


export function useAdminData() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeCourses: 0,
    pendingCourses: 0,
    securityEvents: 0,
    highPriorityEvents: 0,
    roleCounts: {},
  });

  // Fetch all admin data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch in parallel
      const [profilesData, rolesData, coursesData, eventsData, logsData] = await Promise.all([
        fetchWithAuth('/data/profiles?sort=created_at&order=desc'),
        fetchWithAuth('/data/user_roles'),
        fetchWithAuth('/data/courses?sort=created_at&order=desc'),
        fetchWithAuth('/data/security_events?sort=created_at&order=desc&limit=50'),
        fetchWithAuth('/data/system_logs?sort=created_at&order=desc&limit=100'),
      ]);

      if (profilesData && rolesData) {
        const rolesMap = (rolesData as UserRole[]).reduce((acc, r) => {
          acc[r.user_id] = r.role;
          return acc;
        }, {} as Record<string, string>);

        const mergedProfiles = (profilesData as Profile[]).map(p => ({
          ...p,
          role: rolesMap[p.id] || 'student',
          approval_status: p.approval_status || 'pending'
        }));

        setProfiles(mergedProfiles as Profile[]);
        setUserRoles(rolesData as UserRole[]);

        // Calculate role counts
        const counts: Record<string, number> = {};
        (rolesData as UserRole[]).forEach((r) => {
          counts[r.role] = (counts[r.role] || 0) + 1;
        });
        setStats((prev) => ({ ...prev, roleCounts: counts }));
      }
      if (coursesData) {
        setCourses(coursesData as Course[]);
        const pending = (coursesData as Course[]).filter((c) => c.status?.toLowerCase() === 'pending').length;
        const approved = (coursesData as Course[]).filter((c) => c.status?.toLowerCase() === 'approved' || c.status?.toLowerCase() === 'published').length;
        setStats((prev) => ({ ...prev, pendingCourses: pending, activeCourses: approved }));
      }
      if (eventsData) {
        setSecurityEvents(eventsData as SecurityEvent[]);
        const highPriority = (eventsData as SecurityEvent[]).filter(
          (e) => e.risk_level === 'high' || e.risk_level === 'critical'
        ).length;
        setStats((prev) => ({
          ...prev,
          securityEvents: eventsData?.length || 0,
          highPriorityEvents: highPriority,
        }));
      }
      if (logsData) setSystemLogs(logsData as SystemLog[]);

      // Update total users count
      setStats((prev) => ({ ...prev, totalUsers: profilesData?.length || 0 }));
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Set up polling instead of realtime
  useEffect(() => {
    fetchAllData();
    // Poll every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Admin actions
  const updateUserStatus = async (userId: string, status: 'approved' | 'rejected' | 'suspended' | 'active') => {
    try {
      await fetchWithAuth('/admin/update-user-status', {
        method: 'PUT',
        body: JSON.stringify({ userId, status: status === 'active' ? 'approved' : status })
      });

      // Log action
      await fetchWithAuth('/rpc/log_admin_action', {
        method: 'POST',
        body: JSON.stringify({
          _module: 'User',
          _action: `User status changed to ${status}`,
          _details: { user_id: userId, status },
        })
      });

      toast({ title: 'Success', description: `User status updated to ${status}` });
      fetchAllData(); // Refresh data
      return true;
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update user status', variant: 'destructive' });
      return false;
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'manager' | 'instructor' | 'student') => {
    try {
      await fetchWithAuth('/admin/update-user-role', {
        method: 'PUT',
        body: JSON.stringify({ userId, role: newRole })
      });

      // Log action
      await fetchWithAuth('/rpc/log_admin_action', {
        method: 'POST',
        body: JSON.stringify({
          _module: 'Role',
          _action: `Role changed to ${newRole}`,
          _details: { user_id: userId, new_role: newRole },
        })
      });

      toast({ title: 'Success', description: `User role updated to ${newRole}` });
      fetchAllData();
      return true;
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update user role', variant: 'destructive' });
      return false;
    }
  };

  const sendApprovalEmail = async (userId: string) => {
    try {
      await fetchWithAuth('/admin/send-approval-email', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      toast({ title: 'Success', description: 'Approval email sent via N8N' });
      return true;
    } catch (error) {
      const err = error as Error;
      toast({
        title: 'Error Notification',
        description: err.message || 'Failed to send notification email',
        variant: 'destructive'
      });
      return false;
    }
  };

  const approveCourse = async (courseId: string) => {
    try {
      await fetchWithAuth('/admin/approve-course', {
        method: 'PUT',
        body: JSON.stringify({ courseId, status: 'published' })
      });

      // Optimistically update local state immediately
      setCourses(prev => prev.map(c =>
        c.id === courseId ? { ...c, status: 'published', reviewed_at: new Date().toISOString() } : c
      ));

      toast({ title: '✅ Course Approved', description: 'Course is now published and visible to students.' });

      // Refresh from server after a short delay to sync real DB state
      setTimeout(fetchAllData, 1500);
      return true;
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to approve course', variant: 'destructive' });
      return false;
    }
  };

  const rejectCourse = async (courseId: string, reason: string) => {
    try {
      await fetchWithAuth('/admin/approve-course', {
        method: 'PUT',
        body: JSON.stringify({ courseId, status: 'rejected', rejectionReason: reason })
      });

      // Optimistically update local state
      setCourses(prev => prev.map(c =>
        c.id === courseId ? { ...c, status: 'rejected', rejection_reason: reason, reviewed_at: new Date().toISOString() } : c
      ));

      toast({ title: 'Course Rejected', description: 'Course has been rejected.' });

      setTimeout(fetchAllData, 1500);
      return true;
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reject course', variant: 'destructive' });
      return false;
    }
  };

  const resolveSecurityEvent = async (eventId: string) => {
    try {
      const { user } = await fetchWithAuth('/user/profile');

      await fetchWithAuth(`/data/security_events/${eventId}`, {
        method: 'PUT',
        body: JSON.stringify({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.user?.id || user.id,
        })
      });

      toast({ title: 'Success', description: 'Security event marked as resolved' });
      fetchAllData();
      return true;
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to resolve security event', variant: 'destructive' });
      return false;
    }
  };

  // Get user with their role
  const getUsersWithRoles = (): Profile[] => {
    return profiles.map((profile) => {
      const userRole = userRoles.find((r) => r.user_id === profile.id);
      return {
        ...profile,
        role: userRole?.role || 'student',
      };
    });
  };

  return {
    loading,
    profiles: getUsersWithRoles(),
    courses,
    securityEvents,
    systemLogs,
    stats,
    userRoles,
    refresh: fetchAllData,
    updateUserStatus,
    updateUserRole,
    approveCourse,
    rejectCourse,
    resolveSecurityEvent,
    sendApprovalEmail,
  };
}
