import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAuth } from "@/hooks/useAuth";
import { useAdminData } from "@/hooks/useAdminData";
import { UserManagement } from "@/components/admin/UserManagement";
import { CourseApproval } from "@/components/admin/CourseApproval";
import { SecurityMonitor } from "@/components/admin/SecurityMonitor";
import { QuestionBankApproval } from "@/components/admin/QuestionBankApproval";
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
} from "lucide-react";

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
    approveCourse,
    rejectCourse,
    resolveSecurityEvent,
    sendApprovalEmail,
  } = useAdminData();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

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
        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-10 custom-scrollbar">
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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                      className={`p-2.5 rounded-lg bg-${stat.color === "blue" ? "primary" : "accent"}/10`}
                    >
                      <stat.icon
                        className={`h-5 w-5 text-${stat.color === "blue" ? "primary" : "accent"}`}
                      />
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend.startsWith("+") ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-600"}`}
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
            <Tabs defaultValue="users" className="space-y-6">
              <div className="flex flex-col gap-4 border-b border-slate-200">
                <div className="w-full overflow-x-auto custom-scrollbar pb-2">
                  <TabsList className="bg-transparent h-auto p-0 gap-6 sm:gap-8 flex min-w-max">
                    {[
                      { id: "users", label: "User Management", icon: Users },
                      {
                        id: "questions",
                        label: "Question Bank",
                        icon: FileQuestion,
                      },
                      {
                        id: "courses",
                        label: "Course Approvals",
                        icon: BookOpen,
                      },
                      { id: "security", label: "Security Center", icon: Shield },
                    ].map((tab) => (
                      <TabsTrigger
                        key={tab.id}
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
                <AnimatePresence mode="wait">
                  <TabsContent value="users" className="mt-0 outline-none">
                    <motion.div
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

                  <TabsContent value="questions" className="mt-0 outline-none">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <QuestionBankApproval />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="courses" className="mt-0 outline-none">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <CourseApproval
                        courses={courses}
                        loading={dataLoading}
                        onApprove={approveCourse}
                        onReject={rejectCourse}
                      />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="security" className="mt-0 outline-none">
                    <motion.div
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
