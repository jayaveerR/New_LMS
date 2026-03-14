import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAuth } from "@/hooks/useAuth";
import { useAdminData } from "@/hooks/useAdminData";
import { useCourses, CourseEnrollment } from "@/hooks/useCourses";
import { UserManagement } from "@/components/admin/UserManagement";
import { CourseApproval } from "@/components/admin/CourseApproval";
import { SecurityMonitor } from "@/components/admin/SecurityMonitor";
import { QuestionBankApproval } from "@/components/admin/QuestionBankApproval";
import { EnrollmentsList } from "@/components/admin/EnrollmentsList";
import { GrantStudentAccess } from "@/components/admin/GrantStudentAccess";
import InstructorCoursesAdmin from "@/pages/InstructorCourses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Shield,
  BookOpen,
  BarChart3,
  Settings,
  ShieldAlert,
  RefreshCw,
  FileQuestion,
  ArrowUpRight,
  UserCheck,
  LayoutGrid,
  Activity,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Course {
  id: number;
  image: string | null;
  title: string;
  is_active: boolean;
  category: string | null;
  level: string | null;
  duration: number | null;
  price: string | null;
}

function AllCoursesList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('id', { ascending: false });
        
        if (error) throw error;
        setCourses(data || []);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">All Courses</h2>
          <p className="text-slate-500">View and manage all courses in the system</p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {courses.length} Courses
        </Badge>
      </div>

      {courses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LayoutGrid className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No courses found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video relative bg-slate-100">
                {course.image ? (
                  <img 
                    src={course.image.startsWith('http') ? course.image : `/s3/public/${course.image}`}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-slate-300" />
                  </div>
                )}
                <Badge 
                  className={`absolute top-2 right-2 ${
                    course.is_active ? 'bg-green-500' : 'bg-slate-400'
                  }`}
                >
                  {course.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {course.category || 'Uncategorized'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {course.level || 'All Levels'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{course.duration || '0'} hours</span>
                  <span className="font-medium">{course.price || 'Free'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const {
    loading: dataLoading,
    profiles,
    courses,
    securityEvents,
    systemLogs,
    stats,
    refresh,
    updateUserStatus,
    updateUserRole,
    updateEnrollmentStatus,
    resolveSecurityEvent,
    sendApprovalEmail,
    approveCourse,
    rejectCourse,
    updateCourseStatus,
  } = useAdminData();

  const { fetchEnrollments } = useCourses();
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("users");

  const loadEnrollments = useCallback(async () => {
    setEnrollmentsLoading(true);
    try {
      const data = await fetchEnrollments();
      setEnrollments(data);
    } catch (err) {
      console.error('Failed to load enrollments:', err);
    } finally {
      setEnrollmentsLoading(false);
    }
  }, [fetchEnrollments]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadEnrollments();
    }
  }, [user, loadEnrollments]);

  useEffect(() => {
    const tabUrlMap: Record<string, string> = {
      "/admin": "users",
      "/admin/users": "users",
      "/admin/enrollments": "enrollments",
      "/admin/all-courses": "all-courses",
      "/admin/instructor-courses": "instructor-courses",
      "/admin/questions": "questions",
      "/admin/courses": "courses",
      "/admin/security": "security",
    };
    const path = location.pathname;
    const tab = tabUrlMap[path];
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.pathname]); // Removed tabUrlMap from dependencies as it's now internal

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-slate-500 animate-pulse">
            Initializing Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider className="h-[100dvh] w-full overflow-hidden mesh-bg font-sans">
      <AdminSidebar />
      <SidebarInset className="flex flex-col h-[100dvh] w-full overflow-hidden bg-transparent">
        <AdminHeader />
        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6 lg:space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  Platform Administration
                </h1>
                <p className="text-slate-500 font-medium">
                  Overview of system performance, user activities, and security
                  protocols.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={refresh}
                  disabled={dataLoading}
                  className="h-10 px-4 gap-2 rounded-lg border-slate-200 text-slate-600 font-semibold"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${dataLoading ? "animate-spin" : ""}`}
                  />
                  Sync Data
                </Button>
                <Button className="pro-button-primary h-10 px-6 gap-2 rounded-lg shadow-md">
                  <Shield className="h-4 w-4" />
                  Security Protocol
                </Button>
              </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {[
                {
                  label: "Total Users",
                  value: stats.totalUsers,
                  icon: Users,
                  color: "blue",
                  trend: "+12.5%",
                  description: "Registered accounts",
                },
                {
                  label: "Active Courses",
                  value: stats.activeCourses,
                  icon: BookOpen,
                  color: "orange",
                  trend: "Steady",
                  description: "Verified curriculum",
                },
                {
                  label: "Pending Enrollments",
                  value: stats.pendingEnrollments,
                  icon: GraduationCap,
                  color: "red",
                  trend: stats.pendingEnrollments > 0 ? "Action needed" : "Clear",
                  description: "Approval queue",
                },
                {
                  label: "Security Events",
                  value: stats.securityEvents,
                  icon: ShieldAlert,
                  color: "blue",
                  trend: "-5%",
                  description: "Requiring attention",
                },
                {
                  label: "System Health",
                  value: "99.9%",
                  icon: Activity,
                  color: "blue",
                  trend: "Optimal",
                  description: "Across all nodes",
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: i * 0.05 },
                  }}
                  className="pro-card p-6 bg-white relative overflow-hidden group hover:border-primary/20 cursor-default shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-2.5 rounded-lg ${stat.color === "red" ? "bg-red-50" : stat.color === "blue" ? "bg-primary/10" : "bg-accent/10"}`}
                    >
                      <stat.icon
                        className={`h-5 w-5 ${stat.color === "red" ? "text-red-500" : stat.color === "blue" ? "text-primary" : "text-accent"}`}
                      />
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend === "Action needed" ? "bg-red-50 text-red-600" : stat.trend.startsWith("+") ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-600"}`}
                    >
                      {stat.trend}
                    </span>
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                        {dataLoading ? "..." : stat.value}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      {stat.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Management Portal */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex flex-col gap-4 border-b border-slate-200">
                <div className="w-full overflow-x-auto custom-scrollbar pb-2">
                  <TabsList className="bg-transparent h-auto p-0 gap-6 sm:gap-8 flex min-w-max">
                    {[
                      { id: "users", label: "User Management", icon: Users, key: "tab-users" },
                      { id: "enrollments", label: "Enrollments", icon: GraduationCap, key: "tab-enrollments" },
                      { id: "grant-access", label: "Grant Access", icon: UserCheck, key: "tab-grant-access" },
                      { id: "instructor-courses", label: "Instructor Courses", icon: BookOpen, key: "tab-instructor-courses" },
                      { id: "all-courses", label: "All Courses", icon: LayoutGrid, key: "tab-all-courses" },
                      {
                        id: "questions",
                        label: "Question Bank",
                        icon: FileQuestion,
                        key: "tab-questions",
                      },
                      { id: "security", label: "Security Center", icon: Shield, key: "tab-security" },
                    ].map((tab) => (
                      <TabsTrigger
                        key={tab.key}
                        value={tab.id}
                        className="px-0 py-4 h-auto border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none text-slate-500 font-semibold text-sm data-[state=active]:text-primary transition-all flex items-center gap-2"
                      >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                <div className="hidden lg:flex items-center gap-2 text-slate-400 absolute right-0 top-4">
                  <LayoutGrid className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-widest">
                    Administrative Grid
                  </span>
                </div>
              </div>

              <div className="min-h-[600px]">
                <AnimatePresence>
                  <TabsContent key="tab-users" value="users" className="mt-0 outline-none">
                    <motion.div
                      key="motion-users"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <UserManagement
                        users={profiles}
                        loading={dataLoading}
                        roleCounts={stats.roleCounts}
                        onUpdateStatus={updateUserStatus}
                        onUpdateRole={updateUserRole}
                        onSendEmail={sendApprovalEmail}
                      />
                    </motion.div>
                  </TabsContent>

                  <TabsContent key="tab-enrollments" value="enrollments" className="mt-0 outline-none">
                    <motion.div
                      key="motion-enrollments"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <EnrollmentsList
                        enrollments={enrollments}
                        loading={enrollmentsLoading}
                        onUpdateStatus={updateEnrollmentStatus}
                      />
                    </motion.div>
                  </TabsContent>

                  <TabsContent key="tab-grant-access" value="grant-access" className="mt-0 outline-none">
                    <motion.div
                      key="motion-grant-access"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <GrantStudentAccess />
                    </motion.div>
                  </TabsContent>

                  <TabsContent key="tab-instructor-courses" value="instructor-courses" className="mt-0 outline-none">
                    <motion.div
                      key="motion-instructor-courses"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <InstructorCoursesAdmin />
                    </motion.div>
                  </TabsContent>

                  <TabsContent key="tab-all-courses" value="all-courses" className="mt-0 outline-none">
                    <motion.div
                      key="motion-all-courses"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <AllCoursesList />
                    </motion.div>
                  </TabsContent>

                  <TabsContent key="tab-questions" value="questions" className="mt-0 outline-none">
                    <motion.div
                      key="motion-questions"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <QuestionBankApproval />
                    </motion.div>
                  </TabsContent>

                  <TabsContent key="tab-courses" value="courses" className="mt-0 outline-none">
                    <motion.div
                      key="motion-courses"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <CourseApproval
                        courses={courses}
                        loading={dataLoading}
                        onApprove={approveCourse}
                        onReject={rejectCourse}
                        onUpdateStatus={updateCourseStatus}
                      />
                    </motion.div>
                  </TabsContent>

                  <TabsContent key="tab-security" value="security" className="mt-0 outline-none">
                    <motion.div
                      key="motion-security"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <SecurityMonitor
                        securityEvents={securityEvents}
                        systemLogs={systemLogs}
                        loading={dataLoading}
                        highPriorityCount={stats.highPriorityEvents}
                        onResolveEvent={resolveSecurityEvent}
                      />
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </div>
            </Tabs>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
