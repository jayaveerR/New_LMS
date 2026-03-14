import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchWithAuth } from '@/lib/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helper to get auth headers - always use anon key for public data
const getAuthHeaders = (includeToken: boolean = false) => {
  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = {
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
  
  // If includeToken is true and we have a token, use the user's token
  // Otherwise use the anon key for both Authorization and apikey
  if (includeToken && token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
  }
  
  return headers;
};

export interface Course {
  id: number;
  slug: string;
  title: string;
  category: string;
  image: string;
  duration: string;
  level: string;
  price: string;
  original_price: string;
  rating: number;
  theme_color: string;
  trainer: string;
  is_active: boolean;
  instructor_id?: string;
  status?: string;
}

interface DatabaseCourse {
  id: number;
  slug: string;
  title: string;
  category: string;
  image: string;
  duration: string;
  level: string;
  price: string;
  original_price: string;
  rating: number;
  theme_color: string;
  trainer: string;
  is_active: boolean;
  status?: string;
  instructor_id?: string;
}

export interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: number;
  course_name: string;
  price: string;
  source: string;
  status: 'pending' | 'active' | 'rejected'; // Added status field
  enrollment_date: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

interface CoursesResponse {
  courses: Course[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchCourses = useCallback(async (pageNum: number = 1, category: string = 'all', reset: boolean = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const data = await fetchWithAuth(`/data/courses?is_active=eq.true&select=*&order=id.asc${category && category !== 'all' ? `&category=ilike.*${category}*` : ''}`) as DatabaseCourse[];
      const coursesData: Course[] = (data || []).map((c) => ({
        id: c.id,
        slug: c.slug || '',
        title: c.title || '',
        category: c.category || '',
        image: c.image || '',
        duration: c.duration || '',
        level: c.level || '',
        price: c.price || '',
        original_price: c.original_price || '',
        rating: c.rating || 0,
        theme_color: c.theme_color || '',
        trainer: c.trainer || '',
        is_active: c.is_active,
        status: c.status,
        instructor_id: c.instructor_id
      }));

      const startIndex = (pageNum - 1) * 9;
      const endIndex = startIndex + 9;
      const paginatedCourses = coursesData.slice(startIndex, endIndex);

      if (reset) {
        setCourses(paginatedCourses);
      } else {
        setCourses(prev => [...prev, ...paginatedCourses]);
      }
      
      setHasMore(endIndex < coursesData.length);
      setPage(pageNum);

      // Set categories
      const cats = [...new Set(coursesData.map((c: Course) => c.category))];
      setCategories(cats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('courses')
        .select('category')
        .eq('is_active', true);
      
      if (data) {
        const cats = [...new Set(data.map(c => c.category))];
        setCategories(cats);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  const enrollCourse = useCallback(async (courseId: number, courseName: string, price: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Please login to enroll');
    }

    // Attempt to extract the correct Supabase token from the nested JWT structure
    let authToken = token;
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        // If the token is nested (as seen in the debug data), grab the inner supabaseToken
        if (payload.supabaseToken) {
          authToken = payload.supabaseToken;
        }
      }
    } catch (e) {
      console.warn('Could not parse token for nesting, using original', e);
    }

    // Decode the active token to get the actual user ID
    let userId;
    try {
      const activeParts = authToken.split('.');
      const activePayload = JSON.parse(atob(activeParts[1]));
      userId = activePayload.sub || activePayload.id;
    } catch (e) {
      throw new Error('Invalid token session. Please login again.');
    }

    if (!userId) {
      throw new Error('User ID not found in session.');
    }

    // Check if already enrolled using backend API
    const existing = await fetchWithAuth(
      `/courses/enrollment/${courseId}`
    );
    
    if (existing?.enrolled) {
      throw new Error('Already enrolled in this course');
    }
    
    // Insert enrollment using backend API
    const insertRes = await fetchWithAuth(
      `/courses/enroll`,
      {
        method: 'POST',
        body: JSON.stringify({
          courseId,
          courseName,
          price
        })
      }
    );

    if (!insertRes) { // fetchWithAuth throws on !res.ok, so this check is for empty response
      throw new Error('Enrollment failed or returned no data');
    }

    return { message: 'Successfully enrolled!' };
  }, []);

  const fetchEnrollments = useCallback(async (): Promise<CourseEnrollment[]> => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Please login');
    }

    // Decode JWT to get user_id
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Invalid token');
    }
    const payload = JSON.parse(atob(tokenParts[1]));
    const currentUserId = payload.id;

    // Try to get role from localStorage first (set by useAuth)
    const userRole = localStorage.getItem('user_role');
    
    let enrollmentsData: CourseEnrollment[];
    
    // Check if user is admin or manager - use the correct API endpoint
    if (userRole === 'admin' || userRole === 'manager') {
      // Admin/manager - get all enrollments with user details from backend
      try {
        enrollmentsData = await fetchWithAuth('/courses/enrollments');
        console.log('[fetchEnrollments] Admin/Manager mode, got enrollments:', enrollmentsData?.length);
      } catch (err) {
        console.error('[fetchEnrollments] Error fetching all enrollments:', err);
        enrollmentsData = [];
      }
    } else {
      // Regular user - get own enrollments
      enrollmentsData = await fetchWithAuth(`/data/course_enrollments?user_id=eq.${currentUserId}&select=*&order=enrollment_date.desc`);
      console.log('[fetchEnrollments] Regular user mode, got enrollments:', enrollmentsData?.length);
    }

    if (!enrollmentsData) enrollmentsData = [];
    
    // If admin/manager, data already includes user_name and user_email from backend
    // For regular users, fetch their profile info
    if (userRole !== 'admin' && userRole !== 'manager') {
      const userIds = [...new Set(enrollmentsData.map((e: CourseEnrollment) => e.user_id))];
      if (userIds.length > 0) {
        const profilesRes = await fetch(
          `${SUPABASE_URL}/rest/v1/profiles?id=in.(${userIds.join(',')})&select=id,full_name,email`,
          { headers: getAuthHeaders() }
        );
        const profiles = await profilesRes.json();

        const profileMap = (profiles || []).reduce((acc: Record<string, { full_name: string; email: string }>, p: { id: string; full_name: string; email: string }) => {
          acc[p.id] = p;
          return acc;
        }, {});

        return enrollmentsData.map((e: CourseEnrollment) => ({
          ...e,
          user_name: profileMap[e.user_id]?.full_name || 'Unknown',
          user_email: profileMap[e.user_id]?.email || 'Unknown'
        }));
      }
    }
    
    return enrollmentsData;
  }, []);

  const fetchMyEnrollments = useCallback(async (): Promise<CourseEnrollment[]> => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Please login');
    }

    // Decode JWT to get user_id
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('Invalid token');
    }
    const payload = JSON.parse(atob(tokenParts[1]));
    const userId = payload.id;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/course_enrollments?user_id=eq.${userId}&select=*&order=enrollment_date.desc`,
      { headers: getAuthHeaders() }
    );

    if (!res.ok) {
      throw new Error('Failed to fetch enrollments');
    }

    const enrollments = await res.json();
    return enrollments || [];
  }, []);

  const checkEnrollment = useCallback(async (courseId: number): Promise<boolean> => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return false;
    }

    // Decode JWT to get user_id
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return false;
    }
    const payload = JSON.parse(atob(tokenParts[1]));
    const userId = payload.id;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/course_enrollments?user_id=eq.${userId}&course_id=eq.${courseId}&select=id`,
      { headers: getAuthHeaders() }
    );

    if (!res.ok) {
      return false;
    }

    const data = await res.json();
    return data && data.length > 0;
  }, []);

  return {
    courses,
    loading,
    error,
    hasMore,
    page,
    categories,
    fetchCourses,
    fetchCategories,
    enrollCourse,
    fetchEnrollments,
    fetchMyEnrollments,
    checkEnrollment
  };
}
