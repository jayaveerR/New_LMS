import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, CheckCircle2, PlayCircle, AlertTriangle, 
  ChevronRight, Search, Filter, Clock, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';

export interface StudentProgress {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  avatarUrl?: string;
  enrolledAt: string;
  lastActiveAt: string;
  overallProgress: number;
  completedModules: number;
  totalModules: number;
  currentModuleIndex: number;
  currentVideoTitle?: string;
  watchedPercentage: number;
  status: 'completed' | 'active' | 'stuck' | 'inactive';
  timeSpentMinutes: number;
}

interface StudentProgressTrackerProps {
  students: StudentProgress[];
  isLoading?: boolean;
  onSendReminder?: (studentId: string) => void;
  onViewProfile?: (studentId: string) => void;
}

const getStatusConfig = (status: StudentProgress['status']) => {
  switch (status) {
    case 'completed':
      return {
        icon: CheckCircle2,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        label: 'Completed',
        badgeColor: 'bg-green-500'
      };
    case 'active':
      return {
        icon: PlayCircle,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        label: 'Watching',
        badgeColor: 'bg-blue-500'
      };
    case 'stuck':
      return {
        icon: AlertTriangle,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        label: 'Stuck',
        badgeColor: 'bg-amber-500'
      };
    case 'inactive':
      return {
        icon: Clock,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted',
        label: 'Inactive',
        badgeColor: 'bg-muted-foreground'
      };
  }
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const StudentCard = ({ 
  student, 
  onSendReminder,
  onViewProfile 
}: { 
  student: StudentProgress;
  onSendReminder?: (studentId: string) => void;
  onViewProfile?: (studentId: string) => void;
}) => {
  const statusConfig = getStatusConfig(student.status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="text-sm bg-primary/10 text-primary">
            {student.studentName.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-sm truncate">{student.studentName}</p>
            <Badge 
              variant="secondary" 
              className={`${statusConfig.bgColor} ${statusConfig.color} gap-1 text-xs shrink-0`}
            >
              <StatusIcon className="w-3 h-3" />
              {statusConfig.label}
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {student.studentEmail}
          </p>

          {student.currentVideoTitle && student.status === 'active' && (
            <div className="mt-2 p-2 rounded bg-muted/50">
              <p className="text-xs text-muted-foreground">Currently watching</p>
              <p className="text-xs font-medium truncate">{student.currentVideoTitle}</p>
            </div>
          )}

          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{student.overallProgress}%</span>
            </div>
            <Progress 
              value={student.overallProgress} 
              className="h-1.5 bg-muted"
              indicatorClassName={
                student.status === 'completed' ? 'bg-green-500' :
                student.status === 'stuck' ? 'bg-amber-500' : 'bg-blue-500'
              }
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{student.completedModules}/{student.totalModules} modules</span>
              <span>{student.timeSpentMinutes}m spent</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => onViewProfile?.(student.studentId)}
            >
              View
            </Button>
            {(student.status === 'stuck' || student.status === 'inactive') && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => onSendReminder?.(student.studentId)}
              >
                Remind
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export function StudentProgressTracker({
  students,
  isLoading = false,
  onSendReminder,
  onViewProfile
}: StudentProgressTrackerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const completedStudents = students.filter(s => s.status === 'completed');
  const activeStudents = students.filter(s => s.status === 'active');
  const stuckStudents = students.filter(s => s.status === 'stuck');
  const inactiveStudents = students.filter(s => s.status === 'inactive');

  const stats = [
    { 
      label: 'Completed', 
      count: completedStudents.length, 
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    { 
      label: 'Watching', 
      count: activeStudents.length, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    { 
      label: 'Stuck', 
      count: stuckStudents.length, 
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10'
    },
    { 
      label: 'Inactive', 
      count: inactiveStudents.length, 
      color: 'text-muted-foreground',
      bgColor: 'bg-muted'
    }
  ];

  const handleSendReminder = (student: StudentProgress) => {
    setSelectedStudent(student);
    setIsReminderOpen(true);
  };

  const confirmSendReminder = () => {
    if (selectedStudent) {
      onSendReminder?.(selectedStudent.studentId);
      setIsReminderOpen(false);
      setSelectedStudent(null);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-base">Student Progress</CardTitle>
          </div>
          <Badge variant="outline">
            {students.length} enrolled
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-2">
          {stats.map((stat) => (
            <div 
              key={stat.label}
              className={`p-2 rounded-lg ${stat.bgColor} text-center cursor-pointer transition-colors hover:opacity-80`}
              onClick={() => setStatusFilter(stat.label.toLowerCase())}
            >
              <p className={`text-lg font-bold ${stat.color}`}>{stat.count}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-9">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="active">Watching</SelectItem>
              <SelectItem value="stuck">Stuck</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Student List */}
        <ScrollArea className="h-[350px] pr-2">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
              </div>
            ) : filteredStudents.length > 0 ? (
              <div className="space-y-2">
                {filteredStudents.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    onSendReminder={handleSendReminder}
                    onViewProfile={onViewProfile}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="w-10 h-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No students found</p>
                <p className="text-xs text-muted-foreground">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Students will appear once enrolled'}
                </p>
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {/* Reminder Dialog */}
        <Dialog open={isReminderOpen} onOpenChange={setIsReminderOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Send Reminder</DialogTitle>
              <DialogDescription>
                Send a reminder to {selectedStudent?.studentName} to continue their course.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {selectedStudent?.studentName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedStudent?.studentName}</p>
                    <p className="text-sm text-muted-foreground">{selectedStudent?.studentEmail}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Progress: </span>
                    <span className="font-medium">{selectedStudent?.overallProgress}%</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Status: </span>
                    <Badge variant="secondary" className="ml-1">
                      {selectedStudent?.status}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReminderOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmSendReminder}>
                Send Reminder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export { type StudentProgress };
