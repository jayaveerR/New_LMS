import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useStudentStats, useEnrolledCourses } from '@/hooks/useStudentData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Users, ArrowUpRight } from "lucide-react";
import {
  BookOpen,
  Trophy,
  Clock,
  TrendingUp,
  Play,
  Calendar,
  FileText,
  Award,
  User,
  Video,
  ClipboardCheck,
  History,
  Bell,
  Settings,
} from 'lucide-react';
import { UserProfile } from './UserProfile';
import { CourseList } from './CourseList';
import { ExamModule } from './ExamModule';
import { StudentCourseViewer } from './StudentCourseViewer';
import { StudentCourse, useStudentAnnouncements, useLeaderboard, useLiveClasses, Announcement, LeaderboardEntry, LiveClass } from '@/hooks/useStudentData';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

// Wrapper for Courses to manage view state
function CoursesTab() {
  const [viewingCourse, setViewingCourse] = useState<StudentCourse | null>(null);

  if (viewingCourse) {
    return (
      <StudentCourseViewer
        course={viewingCourse}
        isEnrolled={true}
        onBack={() => setViewingCourse(null)}
      />
    );
  }

  return (
    <div className="w-full">
      <CourseList
        type="enrolled"
        onSelectCourse={(c) => { setViewingCourse(c); }}
      />
    </div>
  );
}

function AnnouncementsSection() {
  const { data: announcements, isLoading } = useStudentAnnouncements();

  return (
    <Card className="border-border/40 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/10 bg-muted/5">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <Bell className="h-5 w-5 text-blue-600 animate-pulse" />
            Recent Updates
          </CardTitle>
          {announcements && announcements.length > 0 && (
            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">{announcements.length} New</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          ) : !announcements || announcements.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-sm">No new announcements yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/10">
              {announcements.map((item: Announcement) => (
                <div key={item.id} className="p-4 hover:bg-muted/30 transition-colors cursor-default">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-sm text-foreground">{item.title}</h4>
                    <span className="text-[10px] text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function LeaderboardTab() {
  const { data: board, isLoading } = useLeaderboard();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-border/40 shadow-lg rounded-3xl overflow-hidden bg-gradient-to-br from-card to-muted/20">
        <CardHeader className="text-center pb-8 pt-10">
          <div className="mx-auto h-16 w-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
            <Trophy className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-3xl font-bold">Top Learners</CardTitle>
          <CardDescription>Competing for excellence with peers across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              [1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)
            ) : !board || board.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No leaderboard data available yet.</div>
            ) : (
              board.map((user: LeaderboardEntry, idx: number) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={user.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl border ${idx === 0 ? 'bg-yellow-500/5 border-yellow-500/20 shadow-sm' : 'bg-background/40 border-border/50'} transition-all hover:scale-[1.01]`}
                >
                  <div className={`h-10 w-10 flex items-center justify-center font-bold text-lg ${idx === 0 ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                    {idx + 1}
                  </div>
                  <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_id}`} />
                    <AvatarFallback>{user.user_id.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-bold text-foreground">User {user.user_id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{user.exams_completed} exams completed</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-primary text-lg">{user.total_score}</p>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Points</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LiveClassesTab() {
  const { data: classes, isLoading } = useLiveClasses();
  const navigate = useNavigate();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {isLoading ? (
        [1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-3xl" />)
      ) : !classes || classes.length === 0 ? (
        <div className="col-span-full py-20 text-center bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
          <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold">No Sessions Scheduled</h3>
          <p className="text-sm text-muted-foreground">Check back later for new live learning sessions.</p>
        </div>
      ) : (
        classes.map((session: LiveClass) => (
          <Card key={session.id} className="border-border/40 shadow-sm rounded-3xl overflow-hidden hover:shadow-xl transition-all group relative">
            <div className="h-32 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 flex flex-col justify-end text-white overflow-hidden relative">
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                {session.status}
              </div>
              <h3 className="font-bold text-lg line-clamp-1">{session.title}</h3>
              <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                  <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span>{new Date(session.scheduled_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/5 flex items-center justify-center text-blue-500">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span>{new Date(session.scheduled_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} ({session.duration_minutes || 60}m)</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => session.meeting_id && navigate(`/live/${session.meeting_id}?role=0`)}
                  className="w-full rounded-xl bg-slate-900 font-bold hover:bg-primary transition-all duration-300 h-11 shadow-lg shadow-primary/10 gap-2"
                  disabled={!session.meeting_id}
                >
                  Join Live Session
                  <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function DashboardHome() {
  const { data: stats } = useStudentStats();
  const { data: enrolledCourses } = useEnrolledCourses();
  const { user } = useAuth();
  const latestCourse = enrolledCourses?.[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-foreground">
            Welcome back, <span className="text-blue-600">{user?.user_metadata?.full_name?.split(' ')[0] || 'Student'}</span>! 👋
          </h1>
          <p className="text-slate-500 dark:text-muted-foreground mt-1">
            Let's pick up where you left off. Here's your learning progress.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#f8faff] dark:bg-blue-950/20 border-[#e5edff] dark:border-blue-900/50 shadow-none overflow-hidden relative rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Enrolled Courses</CardTitle>
            <BookOpen className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.enrolled_courses || 0}</div>
            <p className="text-xs mt-1 text-blue-600 font-medium">courses in progress</p>
          </CardContent>
        </Card>

        <Card className="bg-[#f6fcf8] dark:bg-green-950/20 border-[#e6f4ea] dark:border-green-900/50 shadow-none overflow-hidden relative rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Completed Courses</CardTitle>
            <Award className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.completed_courses || 0}</div>
            <p className="text-xs mt-1 text-slate-500 dark:text-slate-400 font-medium">achievements unlocked</p>
          </CardContent>
        </Card>

        <Card className="bg-[#f8f9fc] dark:bg-slate-900/50 border-[#eff1f8] dark:border-slate-800 shadow-none overflow-hidden relative rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Hours Learned</CardTitle>
            <Clock className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.total_watch_minutes ? Math.floor(stats.total_watch_minutes / 60) : 0}h {stats?.total_watch_minutes ? stats.total_watch_minutes % 60 : 0}m</div>
            <p className="text-xs mt-1 text-slate-500 dark:text-slate-400 font-medium">total screen time</p>
          </CardContent>
        </Card>

        <Card className="bg-[#fff9f5] dark:bg-orange-950/20 border-[#ffede0] dark:border-orange-900/50 shadow-none overflow-hidden relative rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Certificates</CardTitle>
            <Trophy className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.certificates_earned || 0}</div>
            <p className="text-xs mt-1 text-orange-500 font-medium">earned credentials</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/40 shadow-sm rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-slate-200">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              Learning Activity
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm mt-1">Your activity over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full flex items-center justify-center rounded-2xl bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-50 to-white dark:from-slate-900 dark:to-background border border-dashed border-blue-200 dark:border-blue-900/50">
              <div className="text-center">
                <div className="h-16 w-16 bg-blue-100 dark:bg-blue-950/40 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-bold text-sm">Real-time stats tracking</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1.5 max-w-[200px]">Complete modules and take exams to build your learning profile</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <AnnouncementsSection />
      </div>

      <Card className="border-border/40 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-slate-200">
            <Play className="h-6 w-6 text-orange-500 fill-orange-500/20" />
            Continue Learning
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm mt-1">Pick up where you left off</CardDescription>
        </CardHeader>
        <CardContent>
          {!latestCourse ? (
            <div className="h-[280px] text-center py-10 px-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-[#fafafa] dark:bg-slate-900/50 flex flex-col items-center justify-center">
              <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-5" />
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-lg">No active courses yet</p>
              <p className="text-sm text-slate-500 mt-1.5 mb-6">Please contact your instructor for course access</p>
              <Button asChild variant="outline" className="font-semibold shadow-sm rounded-xl">
                <a href="/student-dashboard/profile">View My Learning ID</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="group relative rounded-2xl overflow-hidden border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all p-4">
                <div className="flex gap-4">
                  <div className="h-24 w-40 rounded-xl overflow-hidden bg-muted group-hover:scale-105 transition-transform shrink-0">
                    <img
                      src={latestCourse.thumbnail_url?.startsWith('http') ? latestCourse.thumbnail_url : `http://localhost:5000/api/s3/public/${latestCourse.thumbnail_url}`}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop'; }}
                    />
                  </div>
                  <div className="flex flex-col justify-center flex-1 min-w-0">
                    <Badge variant="secondary" className="w-fit mb-2 bg-blue-500/10 text-blue-600 border-none text-[10px] h-5 uppercase font-bold">In Progress</Badge>
                    <h4 className="font-bold text-foreground truncate text-lg group-hover:text-primary transition-colors">{latestCourse.title}</h4>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1.5 font-bold">
                        <span className="text-muted-foreground">Overall Progress</span>
                        <span className="text-primary">{latestCourse.progress}%</span>
                      </div>
                      <Progress value={latestCourse.progress} className="h-1.5" />
                    </div>
                  </div>
                </div>
              </div>
              <Button asChild className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-primary dark:hover:bg-primary/90 text-white font-bold group shadow-xl">
                <a href="/student-dashboard/courses">
                  Continue My Path
                  <TrendingUp className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Route mapping for dashboard pages
const routeConfig: Record<string, { title: string; description: string; icon: React.ElementType; component?: React.ReactNode }> = {
  '/student-dashboard/profile': { title: 'My Profile', description: 'Manage your personal information and Learning ID', icon: User, component: <UserProfile /> },
  '/student-dashboard/courses': { title: 'My Training', description: 'Access your assigned AWS training courses', icon: BookOpen, component: <CoursesTab /> },
  '/student-dashboard/live-classes': { title: 'Live Classes', description: 'Join and schedule live learning sessions', icon: Calendar, component: <LiveClassesTab /> },
  '/student-dashboard/mock-papers': { title: 'Practice Tests', description: 'Practice with mock exam papers', icon: FileText, component: <ExamModule type="mock" /> },
  '/student-dashboard/exams': { title: 'Final Exams', description: 'Take your final certification examinations', icon: ClipboardCheck, component: <ExamModule type="live" /> },
  '/student-dashboard/history': { title: 'Results History', description: 'Review your past performance and credits', icon: History },
  '/student-dashboard/leaderboard': { title: 'Hall of Fame', description: 'See how you rank among the top AWS learners', icon: Trophy, component: <LeaderboardTab /> },
  '/student-dashboard/notifications': { title: 'Alerts', description: 'Real-time updates and important notices', icon: Bell },
  '/student-dashboard/settings': { title: 'Preferences', description: 'Control your dashboard experience', icon: Settings },
};

export function DashboardContent() {
  const location = useLocation();
  const currentPath = location.pathname;

  if (currentPath === '/student-dashboard' || currentPath === '/student-dashboard/') {
    return <DashboardHome />;
  }

  const config = routeConfig[currentPath];

  if (config) {
    if (config.component) return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <config.icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{config.title}</h1>
            <p className="text-muted-foreground">{config.description}</p>
          </div>
        </div>
        {config.component}
      </div>
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <config.icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{config.title}</h1>
            <p className="text-muted-foreground">{config.description}</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <config.icon className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">Coming Soon</h3>
            <p className="text-sm text-muted-foreground/70 mt-1 max-w-md">
              This module is under development. Stay tuned for updates!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <DashboardHome />;
}
