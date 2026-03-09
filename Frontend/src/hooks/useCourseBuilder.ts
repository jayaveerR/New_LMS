import { fetchWithAuth, API_URL } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Course } from './useInstructorData';

export interface CourseModule {
    id: string;
    course_id: string;
    title: string;
    order_index: number;
    created_at: string;
}

export interface S3CourseVideo {
    id: string;
    module_id: string;
    title: string;
    video_type: string;
    video_url: string;
    order_index: number;
    created_at: string;
}


export function useInstructorS3Courses() {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['s3-courses', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            return fetchWithAuth(`/data/courses?instructor_id=eq.${user.id}`);
        },
        enabled: !!user?.id,
    });
}

export function useCourseModules(courseId: string | null) {
    return useQuery({
        queryKey: ['course-modules', courseId],
        queryFn: async () => {
            if (!courseId) return [];
            return fetchWithAuth(`/data/course_modules?course_id=eq.${courseId}&sort=order_index&order=asc`);
        },
        enabled: !!courseId,
    });
}

export function useModuleVideos(moduleId: string | null) {
    return useQuery({
        queryKey: ['module-videos', moduleId],
        queryFn: async () => {
            if (!moduleId) return [];
            return fetchWithAuth(`/data/course_videos?module_id=eq.${moduleId}&sort=order_index&order=asc`);
        },
        enabled: !!moduleId,
    });
}

export function useCreateS3Course() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (course: Partial<Course>) => {
            return fetchWithAuth('/data/courses', {
                method: 'POST',
                body: JSON.stringify({ ...course, instructor_id: user?.id }),
            });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['s3-courses'] }),
    });
}

export function useUpdateCourseStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ courseId, status }: { courseId: string; status: string }) => {
            const result = await fetchWithAuth(`/data/courses/${courseId}`, {
                method: 'PUT',
                body: JSON.stringify({ status }),
            });

            if (status === 'pending') {
                // Log action for Admin notification
                await fetchWithAuth('/rpc/log_admin_action', {
                    method: 'POST',
                    body: JSON.stringify({
                        _module: 'Course',
                        _action: 'New Course Submitted',
                        _details: { course_id: courseId },
                    })
                });
            }

            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['s3-courses'] });
            queryClient.invalidateQueries({ queryKey: ['available-courses'] });
        },
    });
}

export function useCreateCourseModule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (module: Partial<CourseModule>) => {
            return fetchWithAuth('/data/course_modules', {
                method: 'POST',
                body: JSON.stringify(module),
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['course-modules', variables.course_id] });
        },
    });
}

export function useCreateCourseVideo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (video: Partial<S3CourseVideo>) => {
            return fetchWithAuth('/data/course_videos', {
                method: 'POST',
                body: JSON.stringify(video),
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['module-videos', variables.module_id] });
        },
    });
}

export function useS3Upload() {
    const { user } = useAuth();

    return useMutation({
        mutationFn: async ({ file, customTitle, folder, onProgress }: {
            file: File,
            customTitle?: string,
            folder?: string,
            onProgress?: (pct: number) => void
        }) => {
            const token = localStorage.getItem('access_token');
            const fileExt = file.name.split('.').pop();
            const fileNameToUse = customTitle ? `${customTitle}.${fileExt}` : file.name;

            // Step 1: Get presigned URL
            const res = await fetch(`${API_URL}/s3/upload-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    fileName: fileNameToUse,
                    fileType: file.type,
                    folder: folder || 'LMS VIDEOS'
                })
            });

            if (!res.ok) throw new Error('Failed to get upload URL');
            const { uploadUrl, fileName: s3Key } = await res.json();

            // Step 2: Upload directly to S3
            return new Promise<string>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.upload.addEventListener("progress", (e) => {
                    if (e.lengthComputable && onProgress) {
                        onProgress(Math.round((e.loaded * 100) / e.total));
                    }
                });

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        // Return the full bucket URL
                        const bucketUrl = `https://aotms-lms-backend.s3.ap-southeast-2.amazonaws.com/${s3Key}`;
                        resolve(bucketUrl);
                    } else {
                        reject(new Error(`S3 upload failed with status ${xhr.status}`));
                    }
                };

                xhr.onerror = () => reject(new Error('Network error during S3 upload'));

                xhr.open('PUT', uploadUrl);
                xhr.setRequestHeader('Content-Type', file.type);
                xhr.send(file);
            });
        }
    });
}
