import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { CourseList } from "@/components/dashboard/CourseList";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { ExamModule } from "@/components/dashboard/ExamModule";
import { useAuth } from "@/hooks/useAuth";
import { useEnrolledCourses, useStudentStats } from "@/hooks/useStudentData";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: enrolledCourses, isLoading: coursesLoading } = useEnrolledCourses();
  const { data: stats, isLoading: statsLoading } = useStudentStats();

  const { userRole } = useAuth();
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
      } else if (userRole === 'instructor' && location.pathname === '/student-dashboard') {
        // If instructor landing on student root, send to instructor hub
        navigate("/instructor");
      } else if (userRole === 'admin' && location.pathname === '/student-dashboard') {
        navigate("/admin");
      }
    }
  }, [user, authLoading, userRole, navigate]);

  if (authLoading || coursesLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground animate-pulse">Initializing Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <DashboardSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-hidden bg-background">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <DashboardContent />
            </motion.div>
          </AnimatePresence>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
