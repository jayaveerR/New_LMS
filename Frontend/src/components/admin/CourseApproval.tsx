import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import type { Course } from '@/hooks/useAdminData';

interface CourseApprovalProps {
  courses: Course[];
  loading: boolean;
  onApprove: (courseId: string) => Promise<boolean>;
  onReject: (courseId: string, reason: string) => Promise<boolean>;
}

export function CourseApproval({
  courses,
  loading,
  onApprove,
  onReject
}: CourseApprovalProps) {
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'draft' | 'all'>('pending');

  const pendingCourses = courses.filter((c) => c.status?.toLowerCase() === 'pending');
  const approvedCourses = courses.filter((c) => c.status?.toLowerCase() === 'approved' || c.status?.toLowerCase() === 'published');
  const rejectedCourses = courses.filter((c) => c.status?.toLowerCase() === 'rejected');
  const draftCourses = courses.filter((c) => !c.status || c.status?.toLowerCase() === 'draft');
  const disabledCourses = courses.filter((c) => c.status?.toLowerCase() === 'disabled');

  const filteredCourses = filter === 'all' ? courses :
    filter === 'pending' ? pendingCourses :
      filter === 'approved' ? approvedCourses :
        filter === 'rejected' ? rejectedCourses : draftCourses;

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleApprove = async (course: Course) => {
    setProcessing(true);
    await onApprove(course.id);
    setProcessing(false);
  };

  const handleReject = async () => {
    if (selectedCourse && rejectReason) {
      setProcessing(true);
      await onReject(selectedCourse.id, rejectReason);
      setProcessing(false);
      setShowRejectDialog(false);
      setSelectedCourse(null);
      setRejectReason('');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Unknown date';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid date';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Course Management
              </CardTitle>
              <CardDescription>Review and manage all platform courses</CardDescription>
            </div>
            <div className="flex gap-1 bg-muted p-1 rounded-md">
              <Button
                variant={filter === 'pending' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('pending')}
                className="h-8 text-[11px] uppercase tracking-wider"
              >
                Pending ({pendingCourses.length})
              </Button>
              <Button
                variant={filter === 'approved' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('approved')}
                className="h-8 text-[11px] uppercase tracking-wider"
              >
                Approved ({approvedCourses.length})
              </Button>
              <Button
                variant={filter === 'draft' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('draft')}
                className="h-8 text-[11px] uppercase tracking-wider"
              >
                Drafts ({draftCourses.length})
              </Button>
              <Button
                variant={filter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
                className="h-8 text-[11px] uppercase tracking-wider"
              >
                All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
              <CheckCircle className="h-12 w-12 mb-4 opacity-20" />
              <p>No courses found in the "{filter}" category</p>
              {filter === 'pending' && courses.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="mt-4"
                >
                  View All Platform Courses ({courses.length})
                </Button>
              )}
            </div>
          ) : (
            filteredCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-transparent hover:border-border"
              >
                <div className="h-14 w-24 rounded-md bg-accent/10 flex items-center justify-center overflow-hidden border border-border">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `/s3/public/${course.thumbnail_url}`}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    <BookOpen className="h-5 w-5 text-accent" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{course.title}</h4>
                    <Badge variant={
                      (course.status?.toLowerCase() === 'approved' || course.status?.toLowerCase() === 'published') ? 'default' :
                        course.status?.toLowerCase() === 'pending' ? 'secondary' :
                          course.status?.toLowerCase() === 'rejected' ? 'destructive' : 'outline'
                    } className="text-[9px] h-4 px-1">
                      {course.status || 'draft'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    by {course.instructor_name || 'Unknown'} • <Clock className="h-3 w-3 inline" /> {formatDate(course.submitted_at || course.created_at)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" title="Preview">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Approve"
                    className="text-green-600"
                    disabled={processing || course.status?.toLowerCase() === 'approved' || course.status?.toLowerCase() === 'published'}
                    onClick={() => handleApprove(course)}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Reject"
                    className="text-destructive"
                    disabled={processing || course.status === 'rejected'}
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowRejectDialog(true);
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Course Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Course Statistics</CardTitle>
          <CardDescription>Platform-wide course data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Total Courses</span>
              <span className="font-bold">{courses.length}</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>
          <div className="p-4 rounded-lg bg-green-500/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-green-600">Published</span>
              <span className="font-bold">{approvedCourses.length}</span>
            </div>
            <Progress
              value={courses.length > 0 ? (approvedCourses.length / courses.length) * 100 : 0}
              className="h-2"
            />
          </div>
          <div className="p-4 rounded-lg bg-accent/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-accent">Pending</span>
              <span className="font-bold">{pendingCourses.length}</span>
            </div>
            <Progress
              value={courses.length > 0 ? (pendingCourses.length / courses.length) * 100 : 0}
              className="h-2"
            />
          </div>
          <div className="p-4 rounded-lg bg-destructive/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-destructive">Rejected</span>
              <span className="font-bold">{rejectedCourses.length}</span>
            </div>
            <Progress
              value={courses.length > 0 ? (rejectedCourses.length / courses.length) * 100 : 0}
              className="h-2"
            />
          </div>
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Disabled</span>
              <span className="font-bold">{disabledCourses.length}</span>
            </div>
            <Progress
              value={courses.length > 0 ? (disabledCourses.length / courses.length) * 100 : 0}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Course</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting "{selectedCourse?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason || processing}
            >
              Reject Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
