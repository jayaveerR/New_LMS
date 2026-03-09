import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Search, Filter, Download, Mail, MoreHorizontal, 
  BookOpen, Clock, CheckCircle2, AlertTriangle, PlayCircle,
  TrendingUp, TrendingDown, UserPlus, UserMinus, Activity,
  Eye, FileText, ChevronRight, RefreshCw, Bell, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { 
  useInstructorAllStudents, 
  useInstructorStudentStats, 
  useInstructorPlaylists,
  useSendReminder,
  type InstructorStudent 
} from '@/hooks/useInstructorData';

interface RecentActivity {
  id: string;
  studentId: string;
  studentName: string;
  action: 'started' | 'completed' | 'watching' | 'enrolled' | 'dropped';
  courseName: string;
  timestamp: string;
  details?: string;
}

const getStatusConfig = (status: InstructorStudent['status']) => {
  switch (status) {
    case 'active':
      return { color: 'bg-green-500', text: 'text-green-500', label: 'Active', bg: 'bg-green-500/10' };
    case 'completed':
      return { color: 'bg-blue-500', text: 'text-blue-500', label: 'Completed', bg: 'bg-blue-500/10' };
    case 'at-risk':
      return { color: 'bg-amber-500', text: 'text-amber-500', label: 'At Risk', bg: 'bg-amber-500/10' };
    case 'inactive':
      return { color: 'bg-gray-500', text: 'text-gray-500', label: 'Inactive', bg: 'bg-gray-500/10' };
  }
};

const getActivityIcon = (action: RecentActivity['action']) => {
  switch (action) {
    case 'started': return <UserPlus className="w-4 h-4 text-green-500" />;
    case 'completed': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    case 'watching': return <PlayCircle className="w-4 h-4 text-purple-500" />;
    case 'enrolled': return <UserPlus className="w-4 h-4 text-green-500" />;
    case 'dropped': return <UserMinus className="w-4 h-4 text-red-500" />;
  }
};

const formatWatchTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
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

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  color,
  loading 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  trend?: 'up' | 'down'; 
  trendValue?: string;
  color: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-muted animate-pulse h-9 w-9" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            <div className="h-3 w-24 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            {trend && (
              <div className={`flex items-center gap-1 text-xs ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trendValue}
              </div>
            )}
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{title}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StudentRow({ student, onSendMessage, onViewDetails }: { 
  student: InstructorStudent; 
  onSendMessage: (id: string) => void;
  onViewDetails: (id: string) => void;
}) {
  const status = getStatusConfig(student.status);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
    >
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-primary/10 text-primary text-sm">
          {student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">{student.name}</p>
          <Badge variant="secondary" className={`${status.bg} ${status.text} text-xs`}>
            {status.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">{student.email}</p>
      </div>

      <div className="hidden md:flex items-center gap-6 text-xs">
        <div className="text-center">
          <p className="font-medium">{student.enrolledPlaylists}</p>
          <p className="text-muted-foreground">Enrolled</p>
        </div>
        <div className="text-center">
          <p className="font-medium">{student.completedPlaylists}</p>
          <p className="text-muted-foreground">Completed</p>
        </div>
        <div className="text-center">
          <p className="font-medium">{formatWatchTime(student.totalWatchTimeMinutes)}</p>
          <p className="text-muted-foreground">Watch Time</p>
        </div>
      </div>

      <div className="hidden lg:block w-24">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{student.overallProgress}%</span>
        </div>
        <Progress 
          value={student.overallProgress} 
          className="h-1.5"
          indicatorClassName={
            student.status === 'completed' ? 'bg-blue-500' :
            student.status === 'at-risk' ? 'bg-amber-500' :
            student.status === 'inactive' ? 'bg-gray-400' : 'bg-green-500'
          }
        />
      </div>

      <div className="text-xs text-muted-foreground hidden sm:block">
        {formatTimeAgo(student.lastActiveAt)}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onViewDetails(student.userId)}>
            <Eye className="w-4 h-4 mr-2" /> View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSendMessage(student.userId)}>
            <Mail className="w-4 h-4 mr-2" /> Send Message
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            <UserMinus className="w-4 h-4 mr-2" /> Remove Student
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}

function ActivityFeed({ activities, students }: { activities: RecentActivity[]; students: InstructorStudent[] }) {
  const liveStudents = students.filter(s => {
    const lastActive = new Date(s.lastActiveAt).getTime();
    const hourAgo = Date.now() - (60 * 60 * 1000);
    return lastActive > hourAgo;
  });

  const recentCompletions = students
    .filter(s => s.status === 'completed')
    .slice(0, 3)
    .map(s => ({
      id: `completed-${s.userId}`,
      studentId: s.userId,
      studentName: s.name,
      action: 'completed' as const,
      courseName: s.playlistEnrollments[0]?.playlistTitle || 'Course',
      timestamp: formatTimeAgo(s.lastActiveAt)
    }));

  const allActivities = [...activities, ...recentCompletions]
    .sort((a, b) => {
      const timeA = a.timestamp === 'Just now' ? 0 : a.timestamp.includes('m') ? parseInt(a.timestamp) * 60000 :
                    a.timestamp.includes('h') ? parseInt(a.timestamp) * 3600000 : parseInt(a.timestamp) * 86400000;
      const timeB = b.timestamp === 'Just now' ? 0 : b.timestamp.includes('m') ? parseInt(b.timestamp) * 60000 :
                    b.timestamp.includes('h') ? parseInt(b.timestamp) * 3600000 : parseInt(b.timestamp) * 86400000;
      return timeA - timeB;
    })
    .slice(0, 10);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Live Activity
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {liveStudents.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-2">
          <div className="space-y-3">
            {allActivities.length > 0 ? (
              allActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-0.5">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.studentName}</span>{' '}
                      <span className="text-muted-foreground">
                        {activity.action === 'watching' ? 'is watching' : 
                         activity.action === 'completed' ? 'completed' :
                         activity.action === 'enrolled' ? 'enrolled in' :
                         activity.action === 'started' ? 'started' : 'dropped'}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{activity.courseName}</p>
                    {activity.details && (
                      <p className="text-xs text-amber-500 mt-0.5">{activity.details}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.timestamp}
                  </span>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function InstructorStudentDashboard() {
  const { toast } = useToast();
  const { data: students, isLoading: studentsLoading, refetch } = useInstructorAllStudents();
  const { data: playlists, isLoading: playlistsLoading } = useInstructorPlaylists();
  const { stats, isLoading: statsLoading } = useInstructorStudentStats();
  const sendReminder = useSendReminder();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activities] = useState<RecentActivity[]>([]);

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    
    return students.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
      const matchesCourse = courseFilter === 'all' || 
        student.playlistEnrollments.some(e => e.playlistId === courseFilter);
      return matchesSearch && matchesStatus && matchesCourse;
    });
  }, [students, searchQuery, statusFilter, courseFilter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({ title: 'Data refreshed', description: 'Student data has been updated' });
    } catch (error) {
      toast({ title: 'Error refreshing data', variant: 'destructive' });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSendMessage = (studentId: string) => {
    const student = students?.find(s => s.userId === studentId);
    toast({ title: 'Message feature', description: `Would send message to ${student?.name || 'student'}` });
  };

  const handleViewDetails = (studentId: string) => {
    console.log('View details for:', studentId);
  };

  const loading = studentsLoading || statsLoading || playlistsLoading;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Student Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor student progress and engagement across all your courses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Students" 
          value={loading ? '...' : stats.totalStudents} 
          icon={Users} 
          color="bg-primary/10 text-primary"
          loading={loading}
        />
        <StatCard 
          title="Active Now" 
          value={loading ? '...' : stats.activeStudents} 
          icon={Activity} 
          color="bg-green-500/10 text-green-500"
          loading={loading}
        />
        <StatCard 
          title="At Risk" 
          value={loading ? '...' : stats.atRiskStudents} 
          icon={AlertTriangle} 
          color="bg-amber-500/10 text-amber-500"
          loading={loading}
        />
        <StatCard 
          title="Total Watch Time" 
          value={loading ? '...' : formatWatchTime(stats.totalWatchTimeMinutes)} 
          icon={Clock} 
          color="bg-blue-500/10 text-blue-500"
          loading={loading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-base">All Students ({filteredStudents.length})</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 w-[200px]"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px] h-9">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="at-risk">At Risk</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="hidden md:grid grid-cols-12 gap-2 px-3 text-xs text-muted-foreground font-medium">
                <div className="col-span-4">Student</div>
                <div className="col-span-3 text-center">Courses</div>
                <div className="col-span-2 text-center">Watch Time</div>
                <div className="col-span-2 text-center">Progress</div>
                <div className="col-span-1 text-right">Active</div>
              </div>
              <ScrollArea className="h-[400px] pr-2">
                <div className="space-y-2">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <StudentRow
                        key={student.id}
                        student={student}
                        onSendMessage={handleSendMessage}
                        onViewDetails={handleViewDetails}
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Users className="w-10 h-10 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">No students found</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {searchQuery || statusFilter !== 'all' || courseFilter !== 'all'
                          ? 'Try adjusting your filters' 
                          : 'Students will appear once they enroll in your courses'}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <ActivityFeed activities={activities} students={students || []} />
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Course Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {playlistsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-2 animate-pulse">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-2 w-full bg-muted rounded" />
                    </div>
                  ))}
                </div>
              ) : playlists && playlists.length > 0 ? (
                playlists.slice(0, 5).map((playlist) => {
                  const enrolledCount = students?.filter(s => 
                    s.playlistEnrollments.some(e => e.playlistId === playlist.id)
                  ).length || 0;
                  const completedCount = students?.filter(s => 
                    s.playlistEnrollments.some(e => e.playlistId === playlist.id && e.progress === 100)
                  ).length || 0;
                  const avgProgress = enrolledCount > 0 
                    ? Math.round(
                        students
                          ?.filter(s => s.playlistEnrollments.some(e => e.playlistId === playlist.id))
                          .reduce((acc, s) => acc + s.playlistEnrollments.find(e => e.playlistId === playlist.id)!.progress, 0) || 0
                        / enrolledCount
                      )
                    : 0;

                  return (
                    <div key={playlist.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground truncate flex-1 mr-2">{playlist.title}</span>
                        <span className="font-medium">{avgProgress}%</span>
                      </div>
                      <Progress value={avgProgress} className="h-2" indicatorClassName={
                        avgProgress >= 70 ? 'bg-green-500' : 
                        avgProgress >= 40 ? 'bg-blue-500' : 'bg-amber-500'
                      } />
                      <p className="text-xs text-muted-foreground">
                        {enrolledCount} enrolled, {completedCount} completed
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No courses yet</p>
                  <p className="text-xs">Create courses to track student progress</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
