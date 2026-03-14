import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, Edit, ArrowRight, Trash2, Layers, Clock, AlertCircle, CheckCircle, Send, FileEdit, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useInstructorS3Courses } from '@/hooks/useCourseBuilder';
import { API_URL } from '@/lib/api';
import { Course } from '@/hooks/useInstructorData';
import { CourseBuilder } from './CourseBuilder';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { fetchWithAuth } from '@/lib/api';

interface InstructorCoursesProps {
    limit?: number;
    hideHeader?: boolean;
}

export function InstructorCourses({ limit, hideHeader }: InstructorCoursesProps = {}) {
    const { data: allCourses, isLoading, refetch } = useInstructorS3Courses();
    const courses = limit ? allCourses?.slice(0, limit) : allCourses;
    const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
    const [processing, setProcessing] = useState<string | null>(null);
    const { toast } = useToast();

    const handleSubmitForReview = async (courseId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setProcessing(courseId);
        try {
            await fetchWithAuth('/instructor/submit-course', {
                method: 'POST',
                body: JSON.stringify({ courseId })
            });
            toast({ title: 'Success', description: 'Course submitted for review' });
            refetch();
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to submit course', variant: 'destructive' });
        } finally {
            setProcessing(null);
        }
    };

    const handleSaveDraft = async (courseId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setProcessing(courseId);
        try {
            await fetchWithAuth('/instructor/save-draft', {
                method: 'POST',
                body: JSON.stringify({ courseId })
            });
            toast({ title: 'Success', description: 'Course saved as draft' });
            refetch();
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to save draft', variant: 'destructive' });
        } finally {
            setProcessing(null);
        }
    };

    if (viewingCourse) {
        return <CourseBuilder course={viewingCourse} onBack={() => setViewingCourse(null)} />;
    }

    return (
        <div className="space-y-6">
            {!hideHeader && (
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">My Courses</h2>
                        <p className="text-muted-foreground mt-1">View and manage your assigned courses.</p>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse bg-muted/50 h-[300px]" />
                    ))}
                </div>
            ) : courses?.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <Layers className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="mb-2">No Courses Assigned</CardTitle>
                    <p className="text-muted-foreground max-w-sm">
                        You don't have any courses assigned yet. Contact your manager to assign courses to you.
                    </p>
                </Card>
            ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence>
                        {courses?.map((course: Course, index: number) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="overflow-hidden h-full flex flex-col hover:border-primary/50 transition-colors group cursor-pointer" onClick={() => setViewingCourse(course)}>
                                    <div className="relative aspect-video bg-muted border-b">
                                        {course.thumbnail_url ? (
                                            <img
                                                src={course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `${API_URL}/s3/public/${course.thumbnail_url}`}
                                                alt={course.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop'; }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                                <PlayCircle className="h-12 w-12 text-muted-foreground/30" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            <span className="bg-primary hover:bg-primary/90 text-primary-foreground px-2 py-1 rounded-md text-xs font-medium shadow-sm flex items-center gap-1 backdrop-blur-md">
                                                {course.category}
                                            </span>
                                            <Badge variant={
                                                (course.status?.toLowerCase() === 'approved' || course.status?.toLowerCase() === 'published') ? 'default' :
                                                    course.status?.toLowerCase() === 'pending' ? 'secondary' :
                                                        course.status?.toLowerCase() === 'rejected' ? 'destructive' : 'outline'
                                            } className="text-[10px]">
                                                {course.status === 'published' ? 'Published' : course.status === 'pending' ? 'Pending Review' : course.status === 'rejected' ? 'Rejected' : course.status === 'draft' ? 'Draft' : course.status || 'Draft'}
                                            </Badge>
                                        </div>
                                        <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/30 hover:bg-black/50 text-white">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {(course.status === 'draft' || !course.status) && (
                                                        <DropdownMenuItem onClick={(e) => handleSubmitForReview(course.id, e)} disabled={processing === course.id}>
                                                            <Send className="h-4 w-4 mr-2" />
                                                            Submit for Review
                                                        </DropdownMenuItem>
                                                    )}
                                                    {course.status === 'pending' && (
                                                        <DropdownMenuItem onClick={(e) => handleSaveDraft(course.id, e)} disabled={processing === course.id}>
                                                            <FileEdit className="h-4 w-4 mr-2" />
                                                            Save as Draft
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                    <CardContent className="p-5 flex-1 flex flex-col">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                                                {course.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm line-clamp-2">
                                                {course.description || "No description provided."}
                                            </p>
                                        </div>

                                        <div className="mt-4 pt-4 border-t flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {course.status?.toLowerCase() === 'pending' && (
                                                    <Clock className="h-3 w-3 text-yellow-600" />
                                                )}
                                                {course.status?.toLowerCase() === 'rejected' && (
                                                    <AlertCircle className="h-3 w-3 text-red-600" />
                                                )}
                                                {(course.status?.toLowerCase() === 'published' || course.status?.toLowerCase() === 'approved') && (
                                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    {course.created_at ? format(new Date(course.created_at), 'MMM d, yyyy') : ''}
                                                </span>
                                            </div>
                                            <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                                                Open Course <ArrowRight className="ml-1 h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
