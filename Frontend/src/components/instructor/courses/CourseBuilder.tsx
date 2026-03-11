import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Video, PlayCircle, Edit, ArrowLeft, Trash, UploadCloud, GripVertical, UserPlus, UserCheck, Loader2, CheckCircle2, XCircle, Copy, Check, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useCourseModules, useCreateCourseModule, useModuleVideos, useCreateCourseVideo, useS3Upload, useUpdateCourseStatus, CourseModule, S3CourseVideo } from '@/hooks/useCourseBuilder';
import { Course, useGrantAccess, useStudentLookup } from '@/hooks/useInstructorData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface CourseBuilderProps {
    course: Course;
    onBack: () => void;
}

function ModuleItem({ module, course }: { module: CourseModule, course: Course }) {
    const { data: videos } = useModuleVideos(module.id);
    const createVideo = useCreateCourseVideo();
    const uploadS3 = useS3Upload();
    const { toast } = useToast();

    const [isVideoUploadOpen, setIsVideoUploadOpen] = useState(false);
    const [videoTitle, setVideoTitle] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [copiedModule, setCopiedModule] = useState(false);

    const handleCopyModuleId = () => {
        navigator.clipboard.writeText(module.id);
        setCopiedModule(true);
        toast({ title: "Module ID Copied", description: module.id });
        setTimeout(() => setCopiedModule(false), 2000);
    };

    const handleUploadVideo = async () => {
        if (!selectedFile || !videoTitle) return;

        try {
            // 1. Upload to S3
            const bucketUrl = await uploadS3.mutateAsync({
                file: selectedFile,
                customTitle: videoTitle,
                folder: 'LMS VIDEOS',
                onProgress: setUploadProgress
            });

            // 2. Save to database
            await createVideo.mutateAsync({
                module_id: module.id,
                title: videoTitle,
                video_type: 's3',
                video_url: bucketUrl,
                order_index: (videos?.length || 0) + 1
            });

            setIsVideoUploadOpen(false);
            setVideoTitle('');
            setSelectedFile(null);
            setUploadProgress(0);
            toast({ title: "Success", description: "Video uploaded and linked successfully." });
        } catch (err) {
            console.error('Video upload failed', err);
            toast({ title: "Upload Failed", description: "Could not upload video to S3.", variant: "destructive" });
        }
    };

    return (
        <Card className="mb-4">
            <CardHeader className="py-4 bg-muted/50 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <CardTitle className="text-lg flex items-center gap-2">
                        {module.title}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors"
                            onClick={handleCopyModuleId}
                            title="Copy Module ID"
                        >
                            {copiedModule ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                    </CardTitle>
                </div>

                <Dialog open={isVideoUploadOpen} onOpenChange={setIsVideoUploadOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Plus className="h-4 w-4" /> Add Video
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload Course Video</DialogTitle>
                            <DialogDescription>
                                Drag & Drop your video file or click to select. It will be stored securely on AWS S3.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Video Title</Label>
                                <Input
                                    placeholder="E.g., Getting Started with React"
                                    value={videoTitle}
                                    onChange={(e) => setVideoTitle(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Video File</Label>
                                <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/30 hover:bg-muted/50 transition-colors relative">
                                    <Input
                                        type="file"
                                        accept="video/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    />
                                    {selectedFile ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Video className="h-8 w-8 text-primary" />
                                            <span className="text-sm font-medium">{selectedFile.name}</span>
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>Remove</Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <UploadCloud className="h-8 w-8 text-muted-foreground" />
                                            <span className="text-sm">Click or drag video here</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {uploadS3.isPending && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span>Uploading to S3...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <Progress value={uploadProgress} />
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsVideoUploadOpen(false)}>Cancel</Button>
                            <Button
                                onClick={handleUploadVideo}
                                disabled={!selectedFile || !videoTitle || uploadS3.isPending}
                            >
                                {uploadS3.isPending ? 'Uploading...' : 'Confirm Upload'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="pt-4">
                {videos?.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No videos in this module yet.</p>
                ) : (
                    <div className="space-y-2">
                        {videos?.map((vid: S3CourseVideo) => (
                            <div key={vid.id} className="flex flex-col gap-3 p-3 bg-card border rounded-md">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-full"><Video className="h-4 w-4 text-primary" /></div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{vid.title}</p>
                                        <p className="text-xs text-muted-foreground text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px] sm:max-w-md">{vid.video_url}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-destructive"><Trash className="h-4 w-4" /></Button>
                                </div>

                                <div className="mt-2 rounded-md overflow-hidden bg-black aspect-video max-w-sm">
                                    <video
                                        controls
                                        className="w-full h-full"
                                        preload="metadata"
                                    >
                                        <source src={vid.video_url.startsWith('http') ? vid.video_url : `/s3/public/${vid.video_url}`} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function CourseBuilder({ course, onBack }: CourseBuilderProps) {
    const { data: modules } = useCourseModules(course.id);
    const updateStatus = useUpdateCourseStatus();
    const grantAccess = useGrantAccess();
    const { toast } = useToast();

    const [copiedCourse, setCopiedCourse] = useState(false);

    const handleCopyCourseId = () => {
        navigator.clipboard.writeText(course.id);
        setCopiedCourse(true);
        toast({ title: "Course ID Copied", description: course.id });
        setTimeout(() => setCopiedCourse(false), 2000);
    };

    const handlePublish = async () => {
        try {
            await updateStatus.mutateAsync({
                courseId: course.id,
                status: 'pending'
            });
            toast({
                title: "Submitted for Review",
                description: "Admin will review your course shortly."
            });
        } catch (error) {
            toast({
                title: "Submission Failed",
                description: "Please try again later.",
                variant: 'destructive'
            });
        }
    };

    // Manual Access State
    const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false);
    const [studentUuid, setStudentUuid] = useState('');

    // Student identity verification
    const { data: studentInfo, isLoading: isLookingUp, error: lookupError } = useStudentLookup(studentUuid);


    const handleGrantAccess = async () => {
        if (!studentUuid || !studentInfo) return;
        await grantAccess.mutateAsync({
            courseId: course.id,
            studentId: studentUuid
        });
        setStudentUuid('');
        setIsAccessDialogOpen(false);
    };

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-3xl font-bold tracking-tight">{course.title}</h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={handleCopyCourseId}
                            title="Copy Course ID"
                        >
                            {copiedCourse ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Badge
                            variant={
                                (course.status === 'approved' || course.status === 'published') ? 'default' :
                                    course.status === 'pending' ? 'secondary' :
                                        course.status === 'rejected' ? 'destructive' : 'outline'
                            }
                            className="ml-2 py-0.5 px-2 text-[10px] font-bold uppercase tracking-wider"
                        >
                            {(course.status === 'approved' || course.status === 'published') && <CheckCircle className="h-3 w-3 mr-1" />}
                            {course.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                            {course.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                            {(course.status === 'approved' || course.status === 'published') ? 'Approved' : (course.status || 'Draft')}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm flex items-center gap-2">
                        <span className={`flex h-2 w-2 rounded-full ${(course.status === 'approved' || course.status === 'published') ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                        {(course.status === 'approved' || course.status === 'published') ? 'Live on Platform' : 'Manual Enrollment Mode'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {(course.status === 'draft' || course.status === 'rejected') && (
                        <Button
                            variant="default"
                            className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
                            onClick={handlePublish}
                            disabled={updateStatus.isPending || (modules?.length === 0)}
                        >
                            {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                            Submit for Approval
                        </Button>
                    )}
                    <Dialog open={isAccessDialogOpen} onOpenChange={setIsAccessDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                                disabled={course.status !== 'approved' && course.status !== 'published'}
                            >
                                <UserPlus className="h-4 w-4" /> Grant Student Access
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <UserCheck className="h-5 w-5 text-blue-600" />
                                    Enroll Student Manually
                                </DialogTitle>
                                <DialogDescription>
                                    Paste the student's unique UUID below to verify their identity and grant access.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="student-uuid">Student UUID</Label>
                                    <div className="relative">
                                        <Input
                                            id="student-uuid"
                                            placeholder="Paste UUID here..."
                                            value={studentUuid}
                                            onChange={(e) => setStudentUuid(e.target.value)}
                                            className="font-mono text-xs pr-10"
                                        />
                                        {isLookingUp && (
                                            <div className="absolute right-3 top-2.5">
                                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Student Profile Preview Section */}
                                <div className="rounded-2xl border-2 border-dashed border-border/60 bg-muted/30 p-4 min-h-[100px] flex flex-col items-center justify-center transition-all duration-300">
                                    {isLookingUp ? (
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                            <p className="text-xs font-medium">Identifying student...</p>
                                        </div>
                                    ) : studentInfo ? (
                                        <div className="w-full animate-in zoom-in-95 duration-300">
                                            <div className="flex items-center gap-4 bg-card p-3 rounded-xl border shadow-sm">
                                                <Avatar className="h-14 w-14 border-2 border-blue-100 shadow-sm">
                                                    <AvatarImage src={studentInfo.avatar_url || ''} />
                                                    <AvatarFallback className="bg-blue-600 text-white font-bold text-lg">
                                                        {studentInfo.full_name?.[0]?.toUpperCase() || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 mb-0.5">
                                                        <p className="font-bold text-slate-800 dark:text-slate-100 truncate text-base">{studentInfo.full_name}</p>
                                                        <CheckCircle2 className="h-4 w-4 text-green-500 fill-green-500/10" />
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground truncate font-medium">{studentInfo.email}</p>
                                                    <div className="mt-2 flex items-center gap-1.5">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-tight">Verified Student</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : lookupError ? (
                                        <div className="text-center space-y-2 animate-in fade-in duration-300">
                                            <div className="bg-destructive/10 p-2 rounded-full w-fit mx-auto">
                                                <XCircle className="h-5 w-5 text-destructive" />
                                            </div>
                                            <p className="text-xs text-destructive font-bold uppercase tracking-tight">Access Denied</p>
                                            <p className="text-[11px] text-muted-foreground">ID not found in database. Please verify the UUID.</p>
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-1.5 opacity-60">
                                            <UserPlus className="h-8 w-8 text-muted-foreground mx-auto mb-1" />
                                            <p className="text-xs font-semibold text-slate-500">Ready for lookup</p>
                                            <p className="text-[10px] text-slate-400">Enter a student UUID above to continue</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" className="rounded-xl h-11" onClick={() => setIsAccessDialogOpen(false)}>Cancel</Button>
                                <Button
                                    onClick={handleGrantAccess}
                                    disabled={!studentInfo || grantAccess.isPending}
                                    className="bg-blue-600 hover:bg-blue-700 rounded-xl h-11 flex-1 font-bold shadow-lg shadow-blue-500/20"
                                >
                                    {grantAccess.isPending ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enrolling...</>
                                    ) : (
                                        "Confirm & Enroll Access"
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-4">
                    {modules?.length === 0 ? (
                        <div className="text-center p-12 bg-muted/30 border-2 border-dashed rounded-xl">
                            <h3 className="text-lg font-medium mb-2">No modules found</h3>
                            <p className="text-muted-foreground mb-4">Modules are initialized during course creation.</p>
                        </div>
                    ) : (
                        modules?.map((mod: CourseModule) => (
                            <ModuleItem key={mod.id} module={mod} course={course} />
                        ))
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Course Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            {course.thumbnail_url && (
                                <div className="aspect-video w-full rounded-md overflow-hidden bg-muted">
                                    <img src={course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `/s3/public/${course.thumbnail_url}`} className="w-full h-full object-cover" alt="Thumbnail" />
                                </div>
                            )}
                            <div><span className="font-semibold">Category:</span> {course.category || 'N/A'}</div>
                            <div><span className="font-semibold">Level:</span> {course.level || 'N/A'}</div>
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">Status:</span>
                                <Badge
                                    variant={
                                        (course.status === 'approved' || course.status === 'published') ? 'default' :
                                            course.status === 'pending' ? 'secondary' :
                                                course.status === 'rejected' ? 'destructive' : 'outline'
                                    }
                                    className="text-[10px] font-bold uppercase tracking-widest"
                                >
                                    {course.status || 'Draft'}
                                </Badge>
                            </div>
                            {course.status !== 'approved' && (
                                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-800">
                                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <p className="text-xs leading-relaxed font-medium">
                                        Granting access is disabled until the course is <strong>Approved</strong> by an Admin.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
}
