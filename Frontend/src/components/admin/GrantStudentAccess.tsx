import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Search, 
  BookOpen, 
  UserPlus, 
  UserCheck, 
  CheckCircle, 
  XCircle, 
  Loader2,
  GraduationCap,
  Mail,
  Plus
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  status: string;
}

interface Student {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

export function GrantStudentAccess() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [studentUuid, setStudentUuid] = useState('');
  const [studentInfo, setStudentInfo] = useState<Student | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch approved courses
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['approved-courses'],
    queryFn: async () => {
      const data = await fetchWithAuth('/data/courses?status=eq.published&select=id,title,status');
      return data as Course[];
    }
  });

  // Lookup student by UUID
  const lookupStudent = async () => {
    if (!studentUuid || studentUuid.length < 32) return;
    setIsLookingUp(true);
    try {
      const profiles = await fetchWithAuth(`/data/profiles?id=eq.${studentUuid}`);
      if (profiles && profiles.length > 0) {
        setStudentInfo(profiles[0]);
      } else {
        setStudentInfo(null);
        toast({ title: 'Student Not Found', description: 'No student found with this UUID', variant: 'destructive' });
      }
    } catch (err) {
      setStudentInfo(null);
    } finally {
      setIsLookingUp(false);
    }
  };

  // Grant access mutation
  const grantAccess = useMutation({
    mutationFn: async () => {
      if (!selectedCourse || !studentInfo) return;
      
      return fetchWithAuth('/data/course_enrollments', {
        method: 'POST',
        body: JSON.stringify({
          user_id: studentInfo.id,
          course_id: selectedCourse.id,
          status: 'active',
          progress_percentage: 0
        })
      });
    },
    onSuccess: () => {
      toast({ title: 'Access Granted', description: `Student has been enrolled in ${selectedCourse?.title}` });
      setStudentUuid('');
      setStudentInfo(null);
      setSelectedCourse(null);
      setIsOpen(false);
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message || 'Failed to grant access', variant: 'destructive' });
    }
  });

  const handleCourseSelect = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    setSelectedCourse(course || null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Grant Student Access
            </CardTitle>
            <CardDescription>
              Manually enroll students in courses
            </CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Enroll Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Enroll Student in Course
                </DialogTitle>
                <DialogDescription>
                  Select a course and enter student's UUID to grant access
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Course Selection */}
                <div className="space-y-2">
                  <Label>Select Course</Label>
                  {coursesLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading courses...
                    </div>
                  ) : (
                    <select
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20"
                      value={selectedCourse?.id || ''}
                      onChange={(e) => handleCourseSelect(e.target.value)}
                    >
                      <option value="">Select a course...</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Student UUID Input */}
                <div className="space-y-2">
                  <Label>Student UUID</Label>
                  <div className="relative">
                    <Input
                      placeholder="Paste student UUID here..."
                      value={studentUuid}
                      onChange={(e) => setStudentUuid(e.target.value)}
                      onBlur={lookupStudent}
                      className="font-mono text-xs pr-10"
                    />
                    {isLookingUp && (
                      <div className="absolute right-3 top-2.5">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Student Preview */}
                {studentInfo && (
                  <div className="rounded-xl border bg-card p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={studentInfo.avatar_url || ''} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {studentInfo.full_name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{studentInfo.full_name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {studentInfo.email}
                        </p>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button
                  onClick={() => grantAccess.mutate()}
                  disabled={!selectedCourse || !studentInfo || grantAccess.isPending}
                >
                  {grantAccess.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enrolling...</>
                  ) : (
                    <>Grant Access</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">Manual Enrollment</p>
          <p className="text-sm">Click "Enroll Student" to grant a student access to a course</p>
        </div>
      </CardContent>
    </Card>
  );
}
