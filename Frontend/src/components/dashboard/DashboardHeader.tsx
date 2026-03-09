import { SidebarTrigger } from '@/components/ui/sidebar';
import { Bell, Search, Settings, LogOut, User, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function DashboardHeader() {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'ST';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <SidebarTrigger className="-ml-1" />

      <div className="flex-1 flex items-center gap-4">
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses, exams..."
            className="pl-10 bg-muted/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => navigate('/student-dashboard/notifications')}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-[10px] font-medium text-accent-foreground flex items-center justify-center">
            3
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-muted/80 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 group">
              <div className="relative">
                <Avatar className="h-9 w-9 border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                {userRole && (
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background shadow-sm ring-1 ring-black/5" title={userRole} />
                )}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl z-[100] rounded-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-3 py-3 mb-2 rounded-xl bg-muted/30 border border-border/20">
              <p className="text-sm font-bold text-foreground line-clamp-1">{user?.user_metadata?.full_name || "Student"}</p>
              <p className="text-xs text-muted-foreground truncate mb-2">{user?.email}</p>
              {userRole && (
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="px-2 py-0 h-5 text-[10px] uppercase font-black bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                    {userRole}
                  </Badge>
                </div>
              )}
            </div>

            {(userRole === 'instructor' || userRole === 'admin') && (
              <>
                <DropdownMenuItem
                  onClick={() => navigate(`/${userRole}`)}
                  className="cursor-pointer rounded-lg px-3 py-2.5 mb-1 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center font-semibold">
                    <LayoutDashboard className="h-4 w-4 mr-2 text-primary/70" />
                    <span>{userRole.charAt(0).toUpperCase() + userRole.slice(1)} Hub</span>
                  </div>
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px]">→</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="mx-2 my-2 opacity-50" />
              </>
            )}

            <DropdownMenuItem onClick={() => navigate('/student-dashboard/profile')} className="cursor-pointer rounded-lg px-3 py-2 text-sm text-foreground/80 hover:text-foreground">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/student-dashboard/settings')} className="cursor-pointer rounded-lg px-3 py-2 text-sm text-foreground/80 hover:text-foreground">
              <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="mx-2 my-2 opacity-50" />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}