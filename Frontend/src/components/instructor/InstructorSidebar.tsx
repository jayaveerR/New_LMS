import { useLocation } from 'react-router-dom';
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
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import {
  LayoutDashboard,
  BookOpen,
  Video,
  Users,
  Calendar,
  FileText,
  BarChart3,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  GraduationCap,
  Upload,
  ClipboardList,
  MessageCircle,
} from 'lucide-react';
import logo from '@/assets/logo.png';
import { useAuth } from '@/hooks/useAuth';

const mainNavItems = [
  { title: 'Dashboard', url: '/instructor', icon: LayoutDashboard },
  { title: 'My Courses', url: '/instructor/courses', icon: BookOpen },
  { title: 'Live Classes', url: '/instructor/live-classes', icon: Video },
  { title: 'Students', url: '/instructor/students', icon: Users },
  { title: 'Doubts & Q&A', url: '/instructor/doubts', icon: MessageCircle },
];

const contentNavItems = [
  { title: 'Videos', url: '/instructor/videos', icon: Video },
  { title: 'Resources', url: '/instructor/resources', icon: FileText },
  { title: 'Assignments', url: '/instructor/assignments', icon: ClipboardList },
  { title: 'Exams', url: '/instructor/exams', icon: GraduationCap },
];

const analyticsNavItems = [
  { title: 'Performance', url: '/instructor/performance', icon: BarChart3 },
  { title: 'Announcements', url: '/instructor/announcements', icon: Bell },
  { title: 'Schedule', url: '/instructor/schedule', icon: Calendar },
];

export function InstructorSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { user, signOut } = useAuth();

  // ── HIDDEN from public: only render sidebar for authenticated instructor users
  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <a href="/" className="flex items-center gap-3">
          <img src={logo} alt="AOTMS Logo" className="h-8" />
          {!collapsed && (
            <span className="font-heading text-lg text-foreground">AOTMS</span>
          )}
        </a>
      </SidebarHeader>

      <SidebarContent>
        {/* ── Main Navigation — always visible to instructor */}
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3"
                      activeClassName="bg-primary/10 text-primary"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Content Management — hidden on public, visible only when logged in */}
        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3"
                      activeClassName="bg-primary/10 text-primary"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Analytics — hidden on public */}
        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3"
                      activeClassName="bg-primary/10 text-primary"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/instructor/settings" className="flex items-center gap-3">
                <Settings className="h-4 w-4" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/instructor/help" className="flex items-center gap-3">
                <HelpCircle className="h-4 w-4" />
                {!collapsed && <span>Help</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} className="text-destructive hover:text-destructive">
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}