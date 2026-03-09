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
import { CourseBuilder } from './CourseBuilder';
import { useToast } from "@/hooks/use-toast";

export function InstructorCourses() {
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
                    onProgress: setUploadProgress
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
            setTitle('');
            setDescription('');
            setCategory('');
            setModuleTitles(['Module 1']);
            setThumbnailFile(null);
            setUploadProgress(0);
        } catch (error) {
            console.error('Failed to create course', error);
            toast({
                title: "Creation Failed",
                description: "Failed to set up course or modules.",
                variant: "destructive"
            });
        }
    };

    if (viewingCourse) {
        return <CourseBuilder course={viewingCourse} onBack={() => setViewingCourse(null)} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My AWS Courses</h2>
                    <p className="text-muted-foreground mt-1">Manage your native video courses and module content.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2"><Plus className="h-4 w-4" /> Create Course</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Native Course</DialogTitle>
                            <DialogDescription>
                                Set up your course and its initial modules. All content is stored in AWS S3.
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
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto p-1">
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
                                                <div className="bg-primary/10 p-3 rounded-full mb-2"><ImageIcon className="h-6 w-6 text-primary" /></div>
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
                            <Button onClick={handleCreateCourse} disabled={!title || !category || createCourse.isPending || uploadS3.isPending}>
                                {(createCourse.isPending || uploadS3.isPending) ? 'Creating...' : 'Create Course & Modules'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse bg-muted/50 h-[300px]" />
                    ))}
                </div>
            ) : courses?.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <UploadCloud className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="mb-2">No Native Courses Yet</CardTitle>
                    <p className="text-muted-foreground max-w-sm mb-6">
                        Start by creating your first course and uploading your modules and videos to AWS S3.
                    </p>
                    <Button onClick={() => setIsCreateOpen(true)}>Create First Course</Button>
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
                                <Card className="overflow-hidden h-full flex flex-col hover:border-primary/50 transition-colors group cursor-pointer" onClick={() => setViewingCourse(course)}>
                                    <div className="relative aspect-video bg-muted border-b">
                                        {course.thumbnail_url ? (
                                            <img
                                                src={course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `http://localhost:5000/api/s3/public/${course.thumbnail_url}`}
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
                                        </div>
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            <span className="bg-background/80 hover:bg-background text-foreground px-2 py-1 rounded-md text-xs font-medium shadow-sm flex items-center gap-1 backdrop-blur-md">
                                                {course.level}
                                            </span>
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
                                            <div className="text-xs text-muted-foreground">
                                                {format(new Date(course.created_at || new Date()), 'MMM d, yyyy')}
                                            </div>
                                            <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                                                Open Builder <ArrowRight className="ml-1 h-4 w-4" />
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
