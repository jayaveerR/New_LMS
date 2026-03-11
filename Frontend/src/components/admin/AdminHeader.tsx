import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

export function AdminHeader() {
  const { user, signOut } = useAuth();
  const initials =
    user?.user_metadata?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "AD";

  return (
    <header className="sticky top-0 z-50 flex h-16 sm:h-20 items-center justify-between bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-4 md:px-6 lg:px-10 transition-all duration-300">
      <div className="flex items-center gap-4 lg:gap-6">
        <SidebarTrigger className="h-10 w-10 text-slate-600 hover:text-slate-700 hover:bg-slate-100/80 rounded-xl transition-all" />

        {/* Search */}
        <div className="relative hidden md:block group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors duration-300" />
          <Input
            placeholder="Search dashboard..."
            className="pl-12 w-[320px] lg:w-[400px] h-11 bg-slate-100/50 border-slate-200/60 focus-visible:ring-primary/20 focus-visible:bg-white focus-visible:border-primary/30 text-sm font-medium transition-all rounded-xl"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        {/* Notifications */}
        <div className="relative group">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-full bg-slate-100/50 border border-slate-200/60 hover:bg-slate-100 hover:border-slate-300 transition-all active:scale-95 group overflow-hidden text-slate-600 hover:text-slate-700"
          >
            <Bell className="h-5 w-5 transition-transform group-hover:rotate-12" />
          </Button>
          <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary border-2 border-white text-[9px] font-bold text-white flex items-center justify-center shadow-sm">
            3
          </span>
        </div>

        <div className="hidden md:block h-8 w-px bg-slate-200 mx-1" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto flex items-center gap-3 px-2 py-1.5 hover:bg-slate-100/80 rounded-xl group transition-all"
            >
              <Avatar className="h-9 w-9 border border-slate-200 shadow-sm transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-md">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                  {user?.user_metadata?.full_name || "Administrator"}
                </p>
                <p className="text-xs text-slate-600 font-medium truncate max-w-[150px]">
                  {user?.email}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500 group-hover:text-slate-700 transition-transform group-hover:translate-y-0.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-white/95 backdrop-blur-xl border border-slate-200/60 p-2 mt-2 shadow-lg rounded-xl"
          >
            <DropdownMenuLabel className="px-2 py-2">
              <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                Account
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 mx-2" />
            <DropdownMenuItem className="h-10 rounded-lg px-2 text-sm font-medium gap-3 hover:bg-slate-100 transition-colors cursor-pointer text-slate-700 focus:bg-slate-100 focus:text-slate-900 mx-1">
              <User className="h-4 w-4 text-slate-600" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="h-10 rounded-lg px-2 text-sm font-medium gap-3 hover:bg-slate-100 transition-colors cursor-pointer text-slate-700 focus:bg-slate-100 focus:text-slate-900 mx-1">
              <Settings className="h-4 w-4 text-slate-600" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100 mx-2" />
            <DropdownMenuItem
              onClick={signOut}
              className="h-10 rounded-lg px-2 text-sm font-medium gap-3 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer focus:bg-rose-50 focus:text-rose-700 mx-1"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
