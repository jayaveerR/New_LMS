import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { UserRole } from '@/types/auth';

// Simplified types to replace Supabase types
interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    [key: string]: unknown;
  };
  approval_status?: string;
  [key: string]: unknown;
}

interface Session {
  access_token: string;
  user: User | null;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'https://new-lms-m5l5.onrender.com/api');

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage for instant persistence on refresh
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [session, setSession] = useState<Session | null>(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    const savedUser = localStorage.getItem('user');
    return {
      access_token: token,
      user: savedUser ? JSON.parse(savedUser) : null
    } as Session;
  });
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    return localStorage.getItem('user_role') as UserRole | null;
  });

  const [loading, setLoading] = useState(true);

  const signOut = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('user_role');
      setUser(null);
      setSession(null);
      setUserRole(null);
      setLoading(false);
    }
  }, []);

  const checkSession = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // 1. Validate session and fetch role with backend
      // Using fetch with a timeout or better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const [profileRes, roleRes] = await Promise.all([
        fetch(`${API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        }),
        fetch(`${API_URL}/user/role`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        })
      ]);

      clearTimeout(timeoutId);

      if (profileRes.status === 401 || profileRes.status === 403) {
        throw new Error('Session expired');
      }

      if (!profileRes.ok) {
        // Temporary server error, don't log out yet
        setLoading(false);
        return;
      }

      const { user: userData } = await profileRes.json();

      // Update local state and storage with fresh profile data
      setUser(userData);
      setSession({ access_token: token, user: userData } as Session);
      localStorage.setItem('user', JSON.stringify(userData));

      // Only update role if role fetch succeeded to prevent accidental reversion to 'student' on server error
      if (roleRes.ok) {
        const roleData = await roleRes.json();
        const freshRole = roleData.role as UserRole;
        setUserRole(freshRole);
        localStorage.setItem('user_role', freshRole);
      }

    } catch (error: unknown) {
      console.error('Session validation failed:', error);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn('Session check timed out, keeping current local session');
        } else if (error.message?.includes('expired') || error.message?.includes('token') || error.message?.includes('401')) {
          void signOut();
        }
      }
    } finally {
      setLoading(false);
    }
  }, [signOut]);

  useEffect(() => {
    // This effect runs on app load and handles the persistence check
    const initAuth = async () => {
      await checkSession();
    };
    initAuth();
  }, [checkSession]);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: new Error(data.error || 'Signup failed') };
      }

      if (data.session) {
        localStorage.setItem('access_token', data.session.access_token);
        if (data.session.refresh_token) {
          localStorage.setItem('refresh_token', data.session.refresh_token);
        }
        const newUser = { ...data.user, approval_status: 'pending' };
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('user_role', 'student');

        setUser(newUser);
        setSession(data.session);
        setUserRole('student');
      }
      return { error: null };
    } catch (error: unknown) {
      if (error instanceof Error) return { error };
      return { error: new Error('Unknown error during signup') };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        return { error: new Error(data.error || 'Login failed') };
      }

      if (data.session) {
        localStorage.setItem('access_token', data.session.access_token);
        if (data.session.refresh_token) {
          localStorage.setItem('refresh_token', data.session.refresh_token);
        }
        localStorage.setItem('user', JSON.stringify(data.user));

        setUser(data.user);
        setSession(data.session);

        // Fetch role after login
        const roleRes = await fetch(`${API_URL}/user/role`, {
          headers: { Authorization: `Bearer ${data.session.access_token}` }
        });

        let role: UserRole = 'student';
        if (roleRes.ok) {
          const roleData = await roleRes.json();
          role = roleData.role;
        }

        setUserRole(role);
        localStorage.setItem('user_role', role);

        // Fetch approval status
        const profileRes = await fetch(`${API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${data.session.access_token}` }
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const updatedUser = {
            ...data.user,
            approval_status: profileData.user?.approval_status || 'pending'
          };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }

      setLoading(false);
      return { error: null };
    } catch (error: unknown) {
      setLoading(false);
      if (error instanceof Error) return { error };
      return { error: new Error('Unknown error during signin') };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, userRole, loading, signUp, signIn, signOut, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}