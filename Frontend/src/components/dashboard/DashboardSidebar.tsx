import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  User,
  BookOpen,
  Video,
  Calendar,
  FileText,
  ClipboardCheck,
  History,
  Trophy,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

const menuItems = [
  { title: 'Dashboard', url: '/student-dashboard', icon: LayoutDashboard },
  { title: 'My Profile', url: '/student-dashboard/profile', icon: User },
  { title: 'My Courses', url: '/student-dashboard/courses', icon: BookOpen },
  { title: 'Recorded Videos', url: '/student-dashboard/videos', icon: Video },
  { title: 'Live Classes', url: '/student-dashboard/live-classes', icon: Calendar },
  { title: 'Mock Papers', url: '/student-dashboard/mock-papers', icon: FileText },
  { title: 'Live Exams', url: '/student-dashboard/exams', icon: ClipboardCheck },
  { title: 'Exam History', url: '/student-dashboard/history', icon: History },
  { title: 'Leaderboard', url: '/student-dashboard/leaderboard', icon: Trophy },
  { title: 'Notifications', url: '/student-dashboard/notifications', icon: Bell },
  { title: 'Settings', url: '/student-dashboard/settings', icon: Settings },
];

export function DashboardSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="AOTMS" className="h-10" />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Student Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}