import { fetchWithAuth } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Course, Playlist } from './useInstructorData';
import { supabase } from '@/integrations/supabase/client';


export function useStudentEnrollments() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!user?.id) return;
        const channel = supabase
            .channel('simple-enrollments')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'course_enrollments', filter: `user_id=eq.${user.id}` },
                () => queryClient.invalidateQueries({ queryKey: ['student-enrollments', user.id] }))
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [user?.id, queryClient]);

    return useQuery({
        queryKey: ['student-enrollments', user?.id],
        queryFn: () => fetchWithAuth(`/data/course_enrollments?user_id=eq.${user?.id}`),
        enabled: !!user?.id,
    });
}

export function useStudentStats() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!user?.id) return;
        const channel = supabase
            .channel('dashboard-stats')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'leaderboard_stats', filter: `user_id=eq.${user.id}` },
                () => queryClient.invalidateQueries({ queryKey: ['student-stats', user.id] }))
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [user?.id, queryClient]);

    return useQuery({
        queryKey: ['student-stats', user?.id],
        queryFn: () => fetchWithAuth(`/data/leaderboard_stats?user_id=eq.${user?.id}`),
        enabled: !!user?.id,
        select: (data) => data[0] || null,
    });
}

export function useStudentExams() {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['student-exams', user?.id],
        queryFn: async () => {
            const accessible = await fetchWithAuth('/student/accessible-exams');
            return (accessible as any[])
                .filter((a) => a.exam_id)
                .map((a) => ({
                    ...a.exam_schedules,
                    id: a.exam_id // Ensure ID consistency
                }));
        },
        enabled: !!user?.id,
    });
}

export function useStudentMockPapers() {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['student-mock-papers', user?.id],
        queryFn: async () => {
            const accessible = await fetchWithAuth('/student/accessible-exams');
            return (accessible as any[])
                .filter((a) => a.mock_paper_id)
                .map((a) => ({
                    ...a.mock_papers,
                    id: a.mock_paper_id
                }));
        },
        enabled: !!user?.id,
    });
}

export function useStudentAnnouncements() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!user?.id) return;
        const channel = supabase
            .channel('announcements-updates')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'announcements' },
                () => { queryClient.invalidateQueries({ queryKey: ['announcements'] }); }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user?.id, queryClient]);

    return useQuery({
        queryKey: ['announcements'],
        queryFn: () => fetchWithAuth('/data/announcements?order=created_at.desc&limit=5'),
        enabled: !!user?.id,
    });
}

export function useLeaderboard() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        const channel = supabase
            .channel('leaderboard-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'leaderboard_stats' },
                () => { queryClient.invalidateQueries({ queryKey: ['leaderboard'] }); }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [queryClient]);

    return useQuery({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            const data = await fetchWithAuth('/data/leaderboard_stats?order=total_score.desc&limit=10');
            // Mocking names/avatars if not fully linked in profiles for this view, 
            // but the SQL schema has user_id, so it should ideally join.
            // For now, let's assume the API returns what we need or we fetch profiles.
            return data;
        },
        enabled: !!user?.id,
    });
}

export function useLiveClasses() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        const channel = supabase
            .channel('live-classes-realtime')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'live_classes' },
                () => { queryClient.invalidateQueries({ queryKey: ['student-live-classes'] }); }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [queryClient]);

    return useQuery({
        queryKey: ['student-live-classes'],
        queryFn: () => fetchWithAuth('/data/live_classes?order=scheduled_at.asc'),
        enabled: !!user?.id,
    });
}

export interface Enrollment {
    id: string;
    user_id: string;
    course_id: string;
    enrolled_at: string;
    status: string;
    progress_percentage: number;
}

export interface StudentCourse extends Course {
    progress: number;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    created_at: string;
}

export interface LeaderboardEntry {
    id: string;
    user_id: string;
    total_score: number;
    exams_completed: number;
    rank?: number;
}

export interface LiveClass {
    id: string;
    instructor_id: string;
    course_id: string | null;
    title: string;
    description: string | null;
    scheduled_at: string;
    duration_minutes: number;
    meeting_id: string | null;
    meeting_url: string | null;
    start_url: string | null;
    status: string;
}

export function useEnrolledCourses() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!user?.id) return;

        // Listener for enrollment changes
        const enrollmentChannel = supabase
            .channel('enrollments-updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'course_enrollments', filter: `user_id=eq.${user.id}` },
                () => { queryClient.invalidateQueries({ queryKey: ['enrolled-courses-details', user.id] }); }
            )
            .subscribe();

        // Listener for course metadata changes for any course
        const coursesChannel = supabase
            .channel('metadata-updates')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'courses' },
                () => { queryClient.invalidateQueries({ queryKey: ['enrolled-courses-details', user.id] }); }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(enrollmentChannel);
            supabase.removeChannel(coursesChannel);
        };
    }, [user?.id, queryClient]);

    return useQuery({
        queryKey: ['enrolled-courses-details', user?.id],
        queryFn: async () => {
            try {
                const url = `/data/course_enrollments?user_id=eq.${user?.id}`;
                const enrollments: Enrollment[] = await fetchWithAuth(url);
                console.log(`[StudentData] Found ${enrollments.length} enrollments for user ${user?.id}`);

                if (!enrollments.length) return [];

                const courseIds = enrollments.map((e) => e.course_id);
                // Efficiency: fetch only the courses we are enrolled in using the new 'in' operator
                const courseUrl = `/data/courses?id=in.(${courseIds.join(',')})`;
                const courses: Course[] = await fetchWithAuth(courseUrl);
                console.log(`[StudentData] Successfully fetched ${courses.length} / ${courseIds.length} course details`);

                return courses.map((c) => {
                    const enrollment = enrollments.find((e) => e.course_id === c.id);
                    return {
                        id: c.id,
                        title: c.title,
                        description: c.description,
                        category: c.category || 'Video Course',
                        status: c.status || 'published',
                        thumbnail_url: c.thumbnail_url,
                        instructor_id: c.instructor_id,
                        created_at: c.created_at,
                        progress: enrollment?.progress_percentage || 0
                    } as StudentCourse;
                });
            } catch (error) {
                console.error("[StudentData Error] Failed fetching enrolled courses:", error);
                return [];
            }
        },
        enabled: !!user?.id,
    });
}

export function useAvailableCourses() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        const channel = supabase
            .channel('courses-updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'courses' },
                () => { queryClient.invalidateQueries({ queryKey: ['available-courses'] }); }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [queryClient]);

    return useQuery({
        queryKey: ['available-courses'],
        queryFn: async () => {
            try {
                const data: Course[] = await fetchWithAuth('/data/courses?status=eq.published');
                let enrolledCourseIds = new Set<string>();

                if (user?.id) {
                    try {
                        const enrollments: Enrollment[] = await fetchWithAuth(`/data/course_enrollments?user_id=eq.${user.id}`);
                        enrolledCourseIds = new Set(enrollments.map(e => e.course_id));
                    } catch (err) {
                        console.warn('Could not fetch enrollments for filtering', err);
                    }
                }

                return data
                    .filter(course => !enrolledCourseIds.has(course.id))
                    .map(course => ({
                        id: course.id,
                        title: course.title,
                        description: course.description,
                        category: course.category || 'Video Course',
                        status: course.status || 'published',
                        thumbnail_url: course.thumbnail_url,
                        instructor_id: course.instructor_id,
                        created_at: course.created_at,
                        progress: 0
                    } as StudentCourse));
            } catch (error) {
                console.error("Failed fetching available courses:", error);
                return [];
            }
        }
    });
}

export function useEnrollCourse() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (courseId: string) => {
            if (!user?.id) throw new Error("Not logged in");
            return fetchWithAuth('/data/course_enrollments', {
                method: 'POST',
                body: JSON.stringify({
                    user_id: user.id,
                    course_id: courseId,
                    status: 'active',
                    progress_percentage: 0
                })
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enrolled-courses-details'] });
            queryClient.invalidateQueries({ queryKey: ['available-courses'] });
            queryClient.invalidateQueries({ queryKey: ['student-stats'] });

            // Note: useToast hook should be imported and used here if available, 
            // but since we are inside a hook, we can just return success and let the component handle it.
            // Or use a window alert/toast for immediate feedback.
        }
    });
}
