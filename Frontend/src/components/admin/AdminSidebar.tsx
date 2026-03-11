import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Shield,
  BookOpen,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  FileText,
  Activity,
  Database,
  Lock,
  Box,
  ChevronRight,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const mainNavItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "User Management", url: "/admin/users", icon: Users },
  { title: "Role Distribution", url: "/admin/roles", icon: UserCog },
  { title: "Course Registry", url: "/admin/courses", icon: BookOpen },
];

const securityNavItems = [
  { title: "Security Matrix", url: "/admin/security", icon: Shield },
  { title: "System Logs", url: "/admin/logs", icon: FileText },
  { title: "Access Control", url: "/admin/access", icon: Lock },
];

const analyticNavItems = [
  { title: "Platform Data", url: "/admin/analytics", icon: BarChart3 },
  { title: "System Health", url: "/admin/health", icon: Activity },
  { title: "Database Nodes", url: "/admin/database", icon: Database },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-200/60 !bg-white/70 backdrop-blur-xl font-sans"
    >
      <SidebarHeader className="h-20 flex items-center justify-center px-4 group-data-[collapsible=icon]:px-0 border-b border-slate-200/60">
        <Link
          to="/"
          className="flex flex-col gap-1 items-center active:scale-95 transition-transform"
        >
          <img
            src={logo}
            alt="AOTMS Logo"
            className="h-10 w-auto object-contain group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8"
          />
          {!collapsed && (
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Admin Panel
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 group-data-[collapsible=icon]:px-2 py-6 space-y-8 custom-scrollbar">
        {/* Main Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Central Hub</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="h-11 px-4 rounded-lg transition-all duration-200 group relative data-[active=true]:bg-primary/5 data-[active=true]:text-primary"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon
                        className={`h-4.5 w-4.5 transition-colors ${isActive(item.url) ? "text-primary" : "text-slate-500 group-hover:text-slate-700"}`}
                      />
                      {!collapsed && <span>{item.title}</span>}
                      {isActive(item.url) && !collapsed && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Analytics Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {analyticNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="h-11 px-4 rounded-lg transition-all duration-200 group data-[active=true]:bg-primary/5 data-[active=true]:text-primary"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon
                        className={`h-4.5 w-4.5 transition-colors ${isActive(item.url) ? "text-primary" : "text-slate-500 group-hover:text-slate-700"}`}
                      />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Security Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
            Security
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {securityNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="h-11 px-4 rounded-lg transition-all duration-200 group data-[active=true]:bg-primary/5 data-[active=true]:text-primary"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon
                        className={`h-4.5 w-4.5 transition-colors ${isActive(item.url) ? "text-primary" : "text-slate-500 group-hover:text-slate-700"}`}
                      />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[collapsible=icon]:p-2 border-t border-slate-50 bg-slate-50/50">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start group-data-[collapsible=icon]:justify-center gap-3 h-11 px-4 group-data-[collapsible=icon]:px-0 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
            onClick={() => navigate("/admin/settings")}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="text-sm">Configurations</span>}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start group-data-[collapsible=icon]:justify-center gap-3 h-11 px-4 group-data-[collapsible=icon]:px-0 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="text-sm">Sign Out</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
