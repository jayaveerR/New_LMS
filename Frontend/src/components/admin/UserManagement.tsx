import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Search,
  Plus,
  Edit,
  Lock,
  Unlock,
  UserCog,
  Clock,
  AlertCircle,
  Send,
  CheckCircle
} from 'lucide-react';
import type { Profile } from '@/hooks/useAdminData';

interface UserManagementProps {
  users: Profile[];
  loading: boolean;
  roleCounts: Record<string, number>;
  onUpdateStatus: (userId: string, status: 'approved' | 'rejected' | 'suspended' | 'active') => Promise<boolean>;
  onUpdateRole: (userId: string, role: 'admin' | 'manager' | 'instructor' | 'student') => Promise<boolean>;
  onSendEmail: (userId: string) => Promise<boolean>;
}

export function UserManagement({
  users,
  loading,
  roleCounts,
  onUpdateStatus,
  onUpdateRole,
  onSendEmail
}: UserManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [newRole, setNewRole] = useState<string>('');

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async () => {
    if (selectedUser && newRole) {
      await onUpdateRole(selectedUser.id, newRole as 'admin' | 'manager' | 'instructor' | 'student');
      setShowRoleDialog(false);
      setSelectedUser(null);
      setNewRole('');
    }
  };

  const formatLastActive = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  const getRoleBadgeVariant = (role: string | undefined) => {
    switch (role) {
      case 'admin': return 'default';
      case 'manager': return 'secondary';
      case 'instructor': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                User Management
              </CardTitle>
              <CardDescription>Manage all platform users ({users.length} total)</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-10 w-48"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-4" />
              <p>No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{user.full_name || 'Unknown'}</h4>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role || 'student'}
                    </Badge>
                    {user.status === 'suspended' || user.approval_status === 'suspended' ? (
                      <Badge variant="destructive">suspended</Badge>
                    ) : user.approval_status === 'pending' ? (
                      <Badge variant="secondary" className="animate-pulse bg-yellow-100 text-yellow-800 border-yellow-200">
                        Pending Approval
                      </Badge>
                    ) : user.approval_status === 'rejected' ? (
                      <Badge variant="destructive">Rejected</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        Approved
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {formatLastActive(user.last_active_at)}
                </div>
                <div className="flex gap-1">
                  {user.approval_status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowApprovalDialog(true);
                      }}
                    >
                      Review & Approve
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Change Role"
                    onClick={() => {
                      setSelectedUser(user);
                      setNewRole(user.role || 'student');
                      setShowRoleDialog(true);
                    }}
                  >
                    <UserCog className="h-4 w-4" />
                  </Button>

                  {user.approval_status === 'suspended' || user.status === 'suspended' ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Activate"
                      onClick={() => onUpdateStatus(user.id, 'approved')}
                    >
                      <Unlock className="h-4 w-4 text-green-600" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Suspend"
                      onClick={() => onUpdateStatus(user.id, 'suspended')}
                    >
                      <Lock className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Role Management Sidebar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-accent" />
            Role Management
          </CardTitle>
          <CardDescription>User role distribution</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between items-center">
              <span className="font-medium">Students</span>
              <Badge>{roleCounts.student || 0}</Badge>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between items-center">
              <span className="font-medium">Instructors</span>
              <Badge>{roleCounts.instructor || 0}</Badge>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex justify-between items-center">
              <span className="font-medium">Managers</span>
              <Badge>{roleCounts.manager || 0}</Badge>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-primary/10">
            <div className="flex justify-between items-center">
              <span className="font-medium text-primary">Admins</span>
              <Badge variant="default">{roleCounts.admin || 0}</Badge>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            Manage Permissions
          </Button>
        </CardContent>
      </Card>

      {/* Role Change Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Change role for {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Confirmation Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              User Details & Approval
            </DialogTitle>
            <DialogDescription>
              Review the user profile before confirming access.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-4 my-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Full Name</p>
                <p className="text-sm font-medium">{selectedUser?.full_name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Role</p>
                <Badge variant="outline">{selectedUser?.role || 'student'}</Badge>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Email Address</p>
              <p className="text-sm font-medium">{selectedUser?.email}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Join Date</p>
              <p className="text-sm">{selectedUser?.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>

            <div className="pt-2 border-t border-border flex items-center gap-2 text-yellow-700 text-xs font-medium">
              <AlertCircle className="h-4 w-4" />
              <span>Confirming will trigger an automated email via N8N.</span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2 flex-col sm:flex-row">
            <Button variant="ghost" className="sm:mr-auto" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={() => {
                if (selectedUser) onUpdateStatus(selectedUser.id, 'rejected');
                setShowApprovalDialog(false);
              }}
            >
              Reject
            </Button>

            <Button
              className="bg-green-600 hover:bg-green-700 gap-2"
              onClick={async () => {
                if (selectedUser) {
                  await onUpdateStatus(selectedUser.id, 'approved');
                  // Keep dialog open to allow sending email next? 
                  // Let's keep it open or just show one at a time.
                }
              }}
            >
              <CheckCircle className="h-4 w-4" />
              Confirm Approval
            </Button>

            <Button
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 gap-2"
              onClick={async () => {
                if (selectedUser) {
                  await onSendEmail(selectedUser.id);
                  setShowApprovalDialog(false);
                }
              }}
            >
              <Send className="h-4 w-4" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
