import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, ArrowRight, Layers, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { format } from 'date-fns';
import { useInstructorS3Courses } from '@/hooks/useCourseBuilder';
import { API_URL } from '@/lib/api';
import { Course } from '@/hooks/useInstructorData';
import { CourseBuilder } from '../instructor/courses/CourseBuilder';

export function ManagerCourses() {
    const { data: courses, isLoading } = useInstructorS3Courses();
    const [viewingCourse, setViewingCourse] = useState<Course | null>(null);

    if (viewingCourse) {
        return <CourseBuilder course={viewingCourse} onBack={() => setViewingCourse(null)} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">All Courses</h2>
                    <p className="text-muted-foreground mt-1">View and manage all courses in the system.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="animate-pulse bg-muted/50 h-[280px]" />
                    ))}
                </div>
            ) : courses?.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <Layers className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="mb-2">No Courses Available</CardTitle>
                    <p className="text-muted-foreground max-w-sm">
                        There are no courses in the system yet. Courses will appear here once created by admins.
                    </p>
                </Card>
            ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <AnimatePresence>
                        {courses?.map((course: Course, index: number) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
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
                                            <span className="bg-primary hover:bg-primary/90 text-primary-foreground px-2 py-1 rounded-md text-xs font-medium shadow-sm backdrop-blur-md">
                                                {course.category || 'Course'}
                                            </span>
                                        </div>
                                    </div>
                                    <CardContent className="p-4 flex-1 flex flex-col">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                                                {course.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm line-clamp-2">
                                                {course.description || "No description provided."}
                                            </p>
                                        </div>
                                        <div className="mt-4 pt-3 border-t flex items-center justify-between">
                                            <div className="text-xs text-muted-foreground">
                                                {course.created_at ? format(new Date(course.created_at), 'MMM d, yyyy') : ''}
                                            </div>
                                            <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                                                View <ArrowRight className="ml-1 h-4 w-4" />
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
