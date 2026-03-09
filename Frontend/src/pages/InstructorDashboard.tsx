import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { InstructorSidebar } from "@/components/instructor/InstructorSidebar";
import { InstructorHeader } from "@/components/instructor/InstructorHeader";
import { useAuth } from "@/hooks/useAuth";
import { useInstructorCourses, useInstructorPlaylists, useInstructorStats, Course } from "@/hooks/useInstructorData";
import { InstructorStats } from "@/components/instructor/dashboard/InstructorStats";
import { PerformanceCharts } from "@/components/instructor/dashboard/PerformanceCharts";
import { SmartAlerts } from "@/components/instructor/dashboard/SmartAlerts";
import { InstructorCourses } from "@/components/instructor/courses/InstructorCourses";
import { InstructorStudentDashboard } from "@/components/instructor/dashboard/InstructorStudentDashboard";
import { DoubtManager } from "@/components/instructor/dashboard/DoubtManager";
import { resources as ResourcesDashboard } from "@/components/instructor/dashboard/ResourcesDashboard";
import AssignmentsDashboard from "@/components/instructor/dashboard/AssignmentsDashboard";
import PerformanceDashboard from "@/components/instructor/dashboard/PerformanceDashboard";
import { LiveClassManager } from "@/components/instructor/dashboard/LiveClassManager";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Bell, Sparkles, RefreshCw } from "lucide-react";

// ─── Welcome Banner ───────────────────────────────────────────────────────────
function WelcomeBanner({ name }: { name: string }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-muted-foreground">{greeting},</span>
          <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">
            <Sparkles className="h-3 w-3 mr-1" />Instructor
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{name || "Instructor"}</h1>
        <p className="text-sm text-muted-foreground mt-1">Here's your teaching overview for today.</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" className="gap-2 h-9"><Bell className="h-3.5 w-3.5" />Notifications</Button>
      </div>
    </motion.div>
  );
}

// ─── Page transition ──────────────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function InstructorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: courses = [], isLoading: coursesLoading, error, refetch } = useInstructorCourses();
  const { data: stats, isLoading: statsLoading } = useInstructorStats();
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  const { userRole } = useAuth();
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
      } else if (userRole !== 'instructor' && userRole !== 'admin') {
        // If not instructor/admin, kick to student dashboard
        navigate("/student-dashboard");
      }
    }
  }, [user, authLoading, userRole, navigate]);

  useEffect(() => {
    if (user?.id && authLoading === false) {
      refetch();
    }
  }, [user?.id, authLoading, refetch]);

  if (authLoading || coursesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const path = location.pathname;
  const isRoot = path === "/instructor" || path === "/instructor/";
  const isCourses = path.startsWith("/instructor/courses");
  const isStudents = path === "/instructor/students";
  const isDoubts = path === "/instructor/doubts";
  const isResources = path === "/instructor/resources";
  const isAssignments = path === "/instructor/assignments" || path === "/instructor/assignments/";
  const isPerformance = path === "/instructor/performance";
  const isVideos = path === "/instructor/videos";
  const isExams = path === "/instructor/exams";
  const isAnnouncements = path === "/instructor/announcements";
  const isLiveClasses = path === "/instructor/live-classes";
  const isSchedule = path === "/instructor/schedule";

  console.log('Instructor Dashboard Router:', { path, isRoot, isAssignments, isPerformance });

  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <InstructorSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-hidden bg-background">
        <InstructorHeader />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          <AnimatePresence mode="wait">
            {/* ── Dashboard ─────────────────────────────────────────── */}
            {isRoot && (
              <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
                <WelcomeBanner name={user?.user_metadata?.full_name || "Instructor"} />
                <InstructorStats coursesCount={courses.length} stats={stats} loading={statsLoading || coursesLoading} />
                <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                  <PerformanceCharts loading={statsLoading} />
                  <SmartAlerts />
                </div>
              </motion.div>
            )}

            {/* ── Assignments ────────────────────────────────────────── */}
            {isAssignments && (
              <motion.div key="assignments" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <AssignmentsDashboard />
              </motion.div>
            )}

            {/* ── My Courses ────────────────────────────────────────── */}
            {isCourses && (
              <motion.div key="courses" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <InstructorCourses />
              </motion.div>
            )}

            {/* ── Students ─────────────────────────────────────────── */}
            {isStudents && (
              <motion.div key="students" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <InstructorStudentDashboard />
              </motion.div>
            )}

            {/* ── Doubts & Q&A ─────────────────────────────────────── */}
            {isDoubts && (
              <motion.div key="doubts" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <DoubtManager />
              </motion.div>
            )}

            {/* ── Resources ────────────────────────────────────────── */}
            {isResources && (
              <motion.div key="resources" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <ResourcesDashboard />
              </motion.div>
            )}

            {/* ── Performance ────────────────────────────────────────── */}
            {isPerformance && (
              <motion.div key="performance" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <PerformanceDashboard />
              </motion.div>
            )}

            {/* ── Videos ────────────────────────────────────────── */}
            {isVideos && (
              <motion.div key="videos" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <div className="flex flex-col items-center justify-center py-32 text-center bg-card/30 rounded-3xl border border-dashed backdrop-blur-sm">
                  <div className="text-7xl mb-6 drop-shadow-lg">🎬</div>
                  <h2 className="text-2xl font-bold text-foreground mb-3">Content Library</h2>
                  <p className="text-muted-foreground text-base max-w-md mx-auto mb-8">
                    Your centralized video repository is under construction. Currently, you can manage videos within specific courses.
                  </p>
                  <Button
                    onClick={() => navigate("/instructor/courses")}
                    className="h-12 px-8 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20"
                  >
                    Manage via Courses
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Announcements ────────────────────────────────────────── */}
            {isAnnouncements && (
              <motion.div key="announcements" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <div className="flex flex-col items-center justify-center py-32 text-center bg-card/30 rounded-3xl border border-dashed backdrop-blur-sm">
                  <div className="text-7xl mb-6 drop-shadow-lg">📢</div>
                  <h2 className="text-2xl font-bold text-foreground mb-3">Broadcast Center</h2>
                  <p className="text-muted-foreground text-base max-w-md mx-auto mb-8">
                    Post updates and notifications for your students. Global announcements feature is being polished.
                  </p>
                  <Button
                    onClick={() => navigate("/instructor/courses")}
                    className="h-12 px-8"
                  >
                    Go to Course Announcements
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Exams ────────────────────────────────────────── */}
            {isExams && (
              <motion.div key="exams" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <div className="flex flex-col items-center justify-center py-32 text-center bg-card/30 rounded-3xl border border-dashed backdrop-blur-sm">
                  <div className="text-7xl mb-6 drop-shadow-lg">📝</div>
                  <h2 className="text-2xl font-bold text-foreground mb-3">Examination Portal</h2>
                  <p className="text-muted-foreground text-base max-w-md mx-auto mb-8">
                    Create quizzes, mid-terms, and final exams. This advanced module will be enabled in the next update.
                  </p>
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => navigate("/instructor")} className="h-11 px-6">Return Home</Button>
                    <Button className="h-11 px-6 animate-pulse">Request Early Access</Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Live Classes ────────────────────────────────────────── */}
            {isLiveClasses && (
              <motion.div key="live" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <LiveClassManager />
              </motion.div>
            )}

            {/* ── Schedule ────────────────────────────────────────── */}
            {isSchedule && (
              <motion.div key="schedule" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
                <div className="flex flex-col items-center justify-center py-32 text-center bg-card/30 rounded-3xl border border-dashed backdrop-blur-sm">
                  <div className="text-7xl mb-6 drop-shadow-lg">📅</div>
                  <h2 className="text-2xl font-bold text-foreground mb-3">Academic Calendar</h2>
                  <p className="text-muted-foreground text-base max-w-md mx-auto mb-8">
                    Plan your lectures, assignment deadlines, and exam dates. Your personalized schedule is being synced.
                  </p>
                  <Button variant="outline" onClick={() => navigate("/instructor")} className="h-11 px-8">Back to Overview</Button>
                </div>
              </motion.div>
            )}

            {/* ── Catch-all for other /instructor/* pages ───────────── */}
            {!isRoot && !isCourses && !isStudents && !isDoubts && !isResources && !isAssignments && !isPerformance && !isVideos && !isAnnouncements && !isExams && !isLiveClasses && !isSchedule && (
              <motion.div key="other" variants={pageVariants} initial="initial" animate="animate" exit="exit"
                className="flex flex-col items-center justify-center py-32 text-center"
              >
                <div className="text-6xl mb-4">🚧</div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h2>
                <p className="text-muted-foreground text-sm mb-6">This section is under construction.</p>
                <Button onClick={() => navigate("/instructor")} variant="outline">← Back to Dashboard</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
