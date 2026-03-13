import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, PlayCircle, Edit, ArrowRight, UploadCloud, Image as ImageIcon, X, Trash2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Progress } from "@/components/ui/progress";
import { format } from 'date-fns';
import { useInstructorS3Courses, useCreateS3Course, useS3Upload, useCreateCourseModule } from '@/hooks/useCourseBuilder';
import { Course } from '@/hooks/useInstructorData';
import { CourseBuilder } from '../instructor/courses/CourseBuilder';
import { useToast } from "@/hooks/use-toast";
import { API_URL } from '@/lib/api';
import { cn } from '@/lib/utils';

export function ManagerCourses() {
    const { data: courses, isLoading } = useInstructorS3Courses();
    const [viewingCourse, setViewingCourse] = useState<Course | null>(null);

    // Hooks for creating a course
    const createCourse = useCreateS3Course();
    const uploadS3 = useS3Upload();
    const { toast } = useToast();

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [moduleTitles, setModuleTitles] = useState<string[]>(['Module 1']);

    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const createModule = useCreateCourseModule();

    const handleAddModuleField = () => {
        setModuleTitles([...moduleTitles, `Module ${moduleTitles.length + 1}`]);
    };

    const handleModuleTitleChange = (index: number, val: string) => {
        const newTitles = [...moduleTitles];
        newTitles[index] = val;
        setModuleTitles(newTitles);
    };

    const handleCreateCourse = async () => {
        if (!title || !category || moduleTitles.some(t => !t.trim())) return;

        try {
            let thumbnailUrl = '';

            // 1. Upload thumbnail to S3 securely
            if (thumbnailFile) {
                thumbnailUrl = await uploadS3.mutateAsync({
                    file: thumbnailFile,
                    onProgress: setUploadProgress,
                    folder: 'LMS THUMBNAILS'
                });
            }

            // 2. Create course in database
            const newCourse = await createCourse.mutateAsync({
                title,
                description,
                category,
                thumbnail_url: thumbnailUrl,
                status: 'draft'
            });

            // 3. Create modules sequentially
            const createdModules = [];
            for (let i = 0; i < moduleTitles.length; i++) {
                const mod = await createModule.mutateAsync({
                    course_id: newCourse.id,
                    title: moduleTitles[i],
                    order_index: i + 1
                });
                createdModules.push(mod);
            }

            toast({
                title: "Course & Modules Created",
                description: `Course ID: ${newCourse.id}. ${createdModules.length} modules initialized.`,
            });

            setIsCreateOpen(false);
            resetForm();
        } catch (error) {
            console.error('Failed to create course', error);
            toast({
                title: "Creation Failed",
                description: "Failed to set up course or modules.",
                variant: "destructive"
            });
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setCategory('');
        setModuleTitles(['Module 1']);
        setThumbnailFile(null);
        setUploadProgress(0);
    }

    if (viewingCourse) {
        return <CourseBuilder course={viewingCourse} onBack={() => setViewingCourse(null)} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Manager Video Library</h2>
                    <p className="text-muted-foreground mt-1">Full access to cloud media management and student enrollment.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                            <Plus className="h-4 w-4" /> Create New Course
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Native Course</DialogTitle>
                            <DialogDescription>
                                Set up a new course and its initial modules. All content is stored in AWS S3.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4 md:grid-cols-2">
                            {/* Left Column: Details */}
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Course Title</Label>
                                    <Input placeholder="E.g., Complete JavaScript Bootcamp" value={title} onChange={(e) => setTitle(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Category</Label>
                                    <Select onValueChange={setCategory} value={category}>
                                        <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="development">Development</SelectItem>
                                            <SelectItem value="business">Business</SelectItem>
                                            <SelectItem value="design">Design</SelectItem>
                                            <SelectItem value="marketing">Marketing</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Course Modules</Label>
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto p-1 text-xs">
                                        {moduleTitles.map((t, i) => (
                                            <div key={i} className="flex gap-2">
                                                <Input
                                                    placeholder={`Module ${i + 1} Title`}
                                                    value={t}
                                                    onChange={(e) => handleModuleTitleChange(i, e.target.value)}
                                                />
                                                {moduleTitles.length > 1 && (
                                                    <Button variant="ghost" size="icon" onClick={() => setModuleTitles(moduleTitles.filter((_, idx) => idx !== i))}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="outline" size="sm" onClick={handleAddModuleField} className="mt-2 w-full border-dashed">
                                        <Plus className="h-3 w-3 mr-1" /> Add Another Module
                                    </Button>
                                </div>
                            </div>

                            {/* Right Column: Thumbnail */}
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Course Thumbnail (1920x1080)</Label>
                                    <div className="border-2 border-dashed border-primary/20 rounded-xl bg-muted/30 aspect-video flex flex-col items-center justify-center p-6 text-center hover:bg-muted/50 transition-colors relative overflow-hidden">
                                        <Input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" id="thumbnail-upload" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} />

                                        {thumbnailFile ? (
                                            <div className="absolute inset-0 w-full h-full">
                                                <img src={URL.createObjectURL(thumbnailFile)} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                    <Label htmlFor="thumbnail-upload" className="cursor-pointer bg-background/80 px-4 py-2 rounded-md font-medium">Change Image</Label>
                                                </div>
                                            </div>
                                        ) : (
                                            <Label htmlFor="thumbnail-upload" className="cursor-pointer flex flex-col items-center gap-2 w-full h-full justify-center">
                                                <div className="bg-indigo-500/10 p-3 rounded-full mb-2"><ImageIcon className="h-6 w-6 text-indigo-600" /></div>
                                                <span className="font-medium">Upload Thumbnail</span>
                                                <span className="text-xs text-muted-foreground w-48">Recommended size: 1920x1080px (JPG, PNG)</span>
                                            </Label>
                                        )}
                                    </div>
                                </div>
                                {uploadS3.isPending && (
                                    <div className="space-y-2 mt-4">
                                        <div className="flex justify-between text-xs text-muted-foreground"><span>Uploading to AWS S3...</span><span>{uploadProgress}%</span></div>
                                        <Progress value={uploadProgress} className="h-2" />
                                    </div>
                                )}
                            </div>

                            <div className="md:col-span-2 grid gap-2">
                                <Label>Description</Label>
                                <Textarea placeholder="What will students learn in this course?" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleCreateCourse} disabled={!title || !category || createCourse.isPending || uploadS3.isPending}>
                                {(createCourse.isPending || uploadS3.isPending) ? 'Creating...' : 'Create Course & Modules'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse bg-muted/50 h-[300px] border-none rounded-2xl" />
                    ))}
                </div>
            ) : courses?.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-20 text-center border-none bg-muted/20 rounded-3xl">
                    <div className="bg-indigo-500/10 p-6 rounded-full mb-6">
                        <UploadCloud className="h-10 w-10 text-indigo-600" />
                    </div>
                    <CardTitle className="text-2xl mb-2">No Native Courses Yet</CardTitle>
                    <p className="text-muted-foreground max-w-sm mb-8">
                        Managers can create and oversee course content. Start by creating your first course and uploading media to AWS S3.
                    </p>
                    <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20" onClick={() => setIsCreateOpen(true)}>
                        Create Your First Course
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence>
                        {courses?.map((course: Course, index: number) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="overflow-hidden h-full flex flex-col border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer bg-card rounded-2xl" onClick={() => setViewingCourse(course)}>
                                    <div className="relative aspect-video bg-muted overflow-hidden">
                                        {course.thumbnail_url ? (
                                            <img
                                                src={course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `${API_URL}/s3/public/${course.thumbnail_url}`}
                                                alt={course.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop'; }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                                                <PlayCircle className="h-14 w-14 text-indigo-200" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                            <p className="text-white text-xs font-medium uppercase tracking-wider">Expand Details</p>
                                        </div>
                                        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                                            <span className="bg-indigo-600/90 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-md border border-white/20">
                                                {course.category}
                                            </span>
                                            {course.status && (
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-md border border-white/10",
                                                    course.status === 'approved' || course.status === 'published' ? "bg-emerald-500/90 text-white" :
                                                    course.status === 'pending' ? "bg-amber-500/90 text-white" : "bg-slate-700/90 text-white"
                                                )}>
                                                    {course.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <CardContent className="p-6 flex-1 flex flex-col">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-xl line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors leading-tight">
                                                {course.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                                                {course.description || "No description provided."}
                                            </p>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-muted flex items-center justify-between">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                        {format(new Date(course.created_at || new Date()), 'MMM d, yyyy')}
                                                    </span>
                                                </div>
                                                {course.instructor_id && (
                                                    <span className="text-[9px] text-muted-foreground/60 font-medium">
                                                        ID: {course.instructor_id.split('-')[0]}...
                                                    </span>
                                                )}
                                            </div>
                                            <Button variant="secondary" size="sm" className="h-8 px-3 text-xs font-bold rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                Open Library <ArrowRight className="ml-1 h-3 w-3" />
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

