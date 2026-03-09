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

import {
  LayoutDashboard,
  Calendar,
  FileQuestion,
  Trophy,
  UserPlus,
  Settings,
  HelpCircle,
  LogOut,
  ClipboardList,
  Shield,
  BarChart3,
  Activity,
  BookOpen,
  Gavel,
  MonitorPlay,
  Video,
  KeyRound,
} from 'lucide-react';
import logo from '@/assets/logo.png';
import { useAuth } from '@/hooks/useAuth';

interface ManagerSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const examManagementItems = [
  { id: 'overview', title: 'Dashboard', icon: LayoutDashboard },
  { id: 'exams', title: 'Exam Scheduling', icon: Calendar },
  { id: 'questions', title: 'Question Bank', icon: FileQuestion },
  { id: 'student-access', title: 'Student Access', icon: KeyRound },
  { id: 'mock-tests', title: 'Mock Tests', icon: ClipboardList },
  { id: 'exam-rules', title: 'Exam Rules', icon: Gavel },
];

const managementItems = [
  { id: 'leaderboard', title: 'Leaderboard', icon: Trophy },
  { id: 'guests', title: 'Guest Accounts', icon: UserPlus },
  { id: 'access-control', title: 'Access Control', icon: Shield },
];

const monitoringItems = [
  { id: 'monitoring', title: 'Live Monitoring', icon: MonitorPlay },
  { id: 'course-monitoring', title: 'Course Progress', icon: BarChart3 },
  { id: 'video-library', title: 'Video Library', icon: Video },
];

export function ManagerSidebar({ activeSection, onSectionChange }: ManagerSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { signOut } = useAuth();

  const renderNavSection = (items: typeof examManagementItems) =>
    items.map((item) => (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          isActive={activeSection === item.id}
          onClick={() => onSectionChange(item.id)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <item.icon className="h-4 w-4" />
          {!collapsed && <span>{item.title}</span>}
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <button
          onClick={() => onSectionChange('overview')}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img src={logo} alt="AOTMS Logo" className="h-8" />

        </button>
      </SidebarHeader>

      <SidebarContent>
        {/* Exam Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Exam Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavSection(examManagementItems)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavSection(managementItems)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Monitoring */}
        <SidebarGroup>
          <SidebarGroupLabel>Monitoring</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavSection(monitoringItems)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="flex items-center gap-3 cursor-pointer">
              <Settings className="h-4 w-4" />
              {!collapsed && <span>Settings</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="flex items-center gap-3 cursor-pointer">
              <HelpCircle className="h-4 w-4" />
              {!collapsed && <span>Help</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} className="text-destructive hover:text-destructive cursor-pointer">
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}