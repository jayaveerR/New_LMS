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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Shield,
  BookOpen,
  BarChart3,
  Settings,
  TrendingUp,
  Server,
  Database,
  Globe,
  ShieldAlert,
  RefreshCw,
  FileText,
  Trash2,
  FileQuestion,
} from "lucide-react";

const platformMetrics = [
  { label: "CPU Usage", value: 32, max: 100 },
  { label: "Memory", value: 68, max: 100 },
  { label: "Storage", value: 45, max: 100 },
  { label: "Bandwidth", value: 23, max: 100 },
];

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <AdminSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Admin Control Panel 🔐
              </h1>
              <p className="text-muted-foreground mt-1">
                Full system access and platform management
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={refresh}
                disabled={dataLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${dataLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Users
                </CardTitle>
                <Users className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                {dataLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {stats.totalUsers.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Real-time data
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Courses
                </CardTitle>
                <BookOpen className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                {dataLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {stats.activeCourses}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.pendingCourses} pending approval
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Security Events
                </CardTitle>
                <ShieldAlert className="h-5 w-5 text-destructive" />
              </CardHeader>
              <CardContent>
                {dataLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {stats.securityEvents}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.highPriorityEvents} high priority
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  System Health
                </CardTitle>
                <Server className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All systems normal
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full max-w-3xl grid-cols-6">
              <TabsTrigger value="users" className="gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="questions" className="gap-2">
                <FileQuestion className="h-4 w-4" />
                Q-Bank
              </TabsTrigger>
              <TabsTrigger value="courses" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Courses
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <UserManagement
                users={profiles}
                loading={dataLoading}
                roleCounts={stats.roleCounts}
                onUpdateStatus={updateUserStatus}
                onUpdateRole={updateUserRole}
                onSendEmail={sendApprovalEmail}
              />
            </TabsContent>

            {/* Question Bank Approval Tab */}
            <TabsContent value="questions" className="space-y-6">
              <QuestionBankApproval />
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-6">
              <CourseApproval
                courses={courses}
                loading={dataLoading}
                onApprove={approveCourse}
                onReject={rejectCourse}
              />
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <SecurityMonitor
                securityEvents={securityEvents}
                systemLogs={systemLogs}
                loading={dataLoading}
                highPriorityCount={stats.highPriorityEvents}
                onResolveEvent={resolveSecurityEvent}
              />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-primary" />
                          Platform Analytics
                        </CardTitle>
                        <CardDescription>
                          Overview of platform performance
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          This Week
                        </Button>
                        <Button variant="outline" size="sm">
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-sm text-muted-foreground">
                            Active Users (Today)
                          </span>
                        </div>
                        <p className="text-2xl font-bold">{stats.totalUsers}</p>
                        <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                          <TrendingUp className="h-3 w-3" /> Real-time data
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4 text-accent" />
                          <span className="text-sm text-muted-foreground">
                            Active Courses
                          </span>
                        </div>
                        <p className="text-2xl font-bold">
                          {stats.activeCourses}
                        </p>
                        <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                          <TrendingUp className="h-3 w-3" />{" "}
                          {stats.pendingCourses} pending
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-destructive" />
                          <span className="text-sm text-muted-foreground">
                            Security Events
                          </span>
                        </div>
                        <p className="text-2xl font-bold">
                          {stats.securityEvents}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          {stats.highPriorityEvents} high priority
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="h-4 w-4 text-primary" />
                          <span className="text-sm text-muted-foreground">
                            Role Distribution
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          {Object.entries(stats.roleCounts).map(
                            ([role, count]) => (
                              <div key={role} className="flex justify-between">
                                <span className="capitalize">{role}s</span>
                                <Badge variant="secondary">{count}</Badge>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5 text-accent" />
                      System Resources
                    </CardTitle>
                    <CardDescription>Server health metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {platformMetrics.map((metric) => (
                      <div key={metric.label} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{metric.label}</span>
                          <span
                            className={`font-medium ${metric.value > 80
                              ? "text-destructive"
                              : metric.value > 60
                                ? "text-accent"
                                : "text-green-600"
                              }`}
                          >
                            {metric.value}%
                          </span>
                        </div>
                        <Progress value={metric.value} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-primary" />
                      Platform Settings
                    </CardTitle>
                    <CardDescription>
                      Configure global platform settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Maintenance Mode</Label>
                        <p className="text-xs text-muted-foreground">
                          Disable access for non-admins
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>New User Registration</Label>
                        <p className="text-xs text-muted-foreground">
                          Allow new signups
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-xs text-muted-foreground">
                          Send system emails
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Public Leaderboard</Label>
                        <p className="text-xs text-muted-foreground">
                          Show rankings to all
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-accent" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>
                      Configure security policies
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Max Login Attempts</Label>
                      <Input type="number" defaultValue={5} className="w-24" />
                    </div>
                    <div className="space-y-2">
                      <Label>Session Timeout (minutes)</Label>
                      <Input type="number" defaultValue={60} className="w-24" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-xs text-muted-foreground">
                          Require 2FA for admins
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>IP Whitelisting</Label>
                        <p className="text-xs text-muted-foreground">
                          Restrict admin access by IP
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <Button className="w-full">Save Security Settings</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Exam Policies
                    </CardTitle>
                    <CardDescription>
                      Default exam configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Default Duration (minutes)</Label>
                      <Input type="number" defaultValue={60} className="w-24" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Negative Marking</Label>
                        <p className="text-xs text-muted-foreground">
                          Enable by default
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Question Shuffling</Label>
                        <p className="text-xs text-muted-foreground">
                          Randomize questions
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Proctoring</Label>
                        <p className="text-xs text-muted-foreground">
                          Enable webcam monitoring
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-accent" />
                      Data Management
                    </CardTitle>
                    <CardDescription>Backup and maintenance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3"
                    >
                      <Database className="h-4 w-4" />
                      Create Backup
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Clear Cache
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3"
                    >
                      <FileText className="h-4 w-4" />
                      Export All Data
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Purge Old Logs
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
