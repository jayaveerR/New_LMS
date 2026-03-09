import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, SortDesc, Calendar, Users,
  CheckCircle2, Clock, BarChart3, MoreVertical,
  FileText, Edit2, Trash2, Copy, GraduationCap, ChevronRight,
  AlertCircle, Loader2, X, Download, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  useInstructorCourses,
  useAssignments,
  useCreateAssignment,
  useUpdateAssignment,
  useDeleteAssignment,
  Assignment
} from '@/hooks/useInstructorData';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

const AssignmentsDashboard = () => {
  const { user } = useAuth();
  const { data: courses, isLoading: coursesLoading } = useInstructorCourses();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: assignments, isLoading: assignmentsLoading, refetch } = useAssignments(selectedCourseId);
  const createAssignment = useCreateAssignment();
  const updateAssignment = useUpdateAssignment();
  const deleteAssignment = useDeleteAssignment();

  // New Assignment Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    max_marks: 100,
    status: 'draft' as Assignment['status'],
    submission_types: ['file'] as string[],
  });

  const handleCreateAssignment = async () => {
    if (!selectedCourseId || !user) {
      toast({ title: 'Error', description: 'Please select a course first.', variant: 'destructive' });
      return;
    }

    try {
      await createAssignment.mutateAsync({
        course_id: selectedCourseId,
        instructor_id: user.id,
        title: formData.title,
        description: formData.description,
        deadline: new Date(formData.deadline).toISOString(),
        max_marks: formData.max_marks,
        status: formData.status,
        submission_types: formData.submission_types,
        allow_late_submissions: true,
        late_penalty_percentage: 10,
        module_id: null,
        reference_files: [],
      });

      setIsCreateDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        deadline: '',
        max_marks: 100,
        status: 'draft',
        submission_types: ['file'],
      });
      refetch();
    } catch (error: unknown) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'An unknown error occurred', variant: 'destructive' });
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!selectedCourseId || !window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      await deleteAssignment.mutateAsync({ id, courseId: selectedCourseId });
      refetch();
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete assignment',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateStatus = async (id: string, status: Assignment['status']) => {
    try {
      await updateAssignment.mutateAsync({ id, status });
      refetch();
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Active</Badge>;
      case 'draft': return <Badge className="bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 border-slate-500/20">Draft</Badge>;
      case 'closed': return <Badge className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20">Closed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = [
    { label: 'Total', value: assignments?.length || 0, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active', value: assignments?.filter(a => a.status === 'active').length || 0, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Pending', value: 12, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Avg Score', value: '82%', icon: BarChart3, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  const filteredAssignments = assignments?.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Assignments Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Design, distribute, and grade assignments across your courses.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] h-11 px-6">
              <Plus className="w-5 h-5 mr-2" />
              New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] overflow-hidden border-none shadow-2xl">
            <DialogHeader className="bg-primary/5 p-6 -m-6 mb-6 border-b">
              <DialogTitle className="text-xl">Create New Assignment</DialogTitle>
              <DialogDescription>
                Fill in the details for your new course assignment.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 px-1">
              <div className="grid gap-2">
                <Label htmlFor="course">Course Context</Label>
                <Select
                  value={selectedCourseId || ''}
                  onValueChange={setSelectedCourseId}
                >
                  <SelectTrigger className="h-11 bg-muted/30 border-none shadow-inner">
                    <SelectValue placeholder="Select course..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map((course) => (
                      <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Final Research Project"
                  className="h-11 bg-muted/30 border-none shadow-inner"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Brief Description</Label>
                <Textarea
                  id="description"
                  placeholder="What should students achieve?"
                  className="min-h-[100px] bg-muted/30 border-none shadow-inner resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="deadline">Due Date</Label>
                  <Input
                    id="deadline"
                    type="date"
                    className="h-11 bg-muted/30 border-none shadow-inner"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="marks">Max Points</Label>
                  <Input
                    id="marks"
                    type="number"
                    className="h-11 bg-muted/30 border-none shadow-inner"
                    value={formData.max_marks}
                    onChange={(e) => setFormData({ ...formData, max_marks: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-8">
              <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)} className="h-11 px-6">Cancel</Button>
              <Button
                onClick={handleCreateAssignment}
                disabled={createAssignment.isPending || !formData.title || !selectedCourseId}
                className="h-11 px-8 shadow-lg shadow-primary/20"
              >
                {createAssignment.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Create & Publish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm group overflow-hidden">
              <CardContent className="p-6 flex items-center justify-between relative">
                <div className="relative z-10">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-3xl font-extrabold">{assignmentsLoading ? '...' : stat.value}</p>
                    <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 rounded-full">+4%</span>
                  </div>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                {/* Background decorative element */}
                <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${stat.bg} opacity-20 blur-2xl group-hover:scale-150 transition-transform duration-700`} />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters & Content Area */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 bg-muted/30 p-2 rounded-2xl border border-border/50">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by assignment title..."
                className="pl-11 h-12 bg-background/50 border-none shadow-inner rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-[200px]">
              <Select value={selectedCourseId || ''} onValueChange={setSelectedCourseId}>
                <SelectTrigger className="h-12 bg-background/50 border-none shadow-inner rounded-xl">
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses?.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-[160px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 bg-background/50 border-none shadow-inner rounded-xl">
                  <Filter className="w-4 h-4 mr-2 opacity-50" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Every status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignments List */}
          <div className="grid gap-4">
            {assignmentsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                <p className="text-muted-foreground animate-pulse font-medium">Syncing assignments...</p>
              </div>
            ) : !selectedCourseId ? (
              <Card className="border-dashed border-2 py-20 flex flex-col items-center text-center bg-muted/5 rounded-3xl">
                <div className="bg-muted p-6 rounded-full mb-6">
                  <GraduationCap className="h-12 w-12 text-muted-foreground opacity-30" />
                </div>
                <h3 className="text-xl font-bold">Select Course Context</h3>
                <p className="text-muted-foreground max-w-sm mt-2 px-8">
                  Choose a course from the dropdown above to view and manage specific assignments.
                </p>
              </Card>
            ) : filteredAssignments?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-muted/5 rounded-3xl border border-dashed text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-bold">No assignments found</h3>
                <p className="text-muted-foreground text-sm max-w-[280px] mt-2">
                  Try adjusting your search query or filters to find what you're looking for.
                </p>
                <Button variant="link" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} className="mt-2">
                  Clear all filters
                </Button>
              </div>
            ) : (
              <motion.div
                layout
                className="grid gap-4 sm:grid-cols-1"
              >
                <AnimatePresence>
                  {filteredAssignments?.map((assignment, idx) => (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="group hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 bg-card/60 backdrop-blur-sm overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            <div className="flex-1 p-6">
                              <div className="flex items-center gap-3 mb-3">
                                {getStatusBadge(assignment.status)}
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter flex items-center gap-1">
                                  <Users className="w-3 h-3" /> {courses?.find(c => c.id === assignment.course_id)?.title}
                                </span>
                              </div>
                              <h3 className="text-xl font-bold group-hover:text-primary transition-colors mb-2">
                                {assignment.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2 max-w-2xl">
                                {assignment.description || 'No description provided for this assignment.'}
                              </p>

                              <div className="flex flex-wrap items-center gap-6 mt-6">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-rose-500/10 rounded-lg">
                                    <Calendar className="w-4 h-4 text-rose-500" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight leading-none">Due Date</p>
                                    <p className="text-xs font-bold mt-1">{format(new Date(assignment.deadline), 'MMM dd, yyyy')}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                                    <Award className="w-4 h-4 text-indigo-500" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight leading-none">Max Score</p>
                                    <p className="text-xs font-bold mt-1">{assignment.max_marks} Points</p>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-[120px] max-w-[200px]">
                                  <div className="flex justify-between items-end mb-1">
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Submissions</p>
                                    <p className="text-xs font-bold">18/24</p>
                                  </div>
                                  <Progress value={75} className="h-1.5" />
                                </div>
                              </div>
                            </div>

                            <div className="flex md:flex-col items-center justify-between p-4 bg-muted/20 border-t md:border-t-0 md:border-l border-border/50 gap-2">
                              <Button className="w-full md:w-11 md:h-11 rounded-xl shadow-lg" size="icon">
                                <GraduationCap className="w-5 h-5" />
                              </Button>
                              <div className="flex md:flex-col gap-2">
                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-xl">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-xl">
                                    <DropdownMenuItem className="rounded-lg h-10" onClick={() => handleUpdateStatus(assignment.id, 'active')}><Edit2 className="w-4 h-4 mr-2" /> Make Active</DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-lg h-10" onClick={() => handleUpdateStatus(assignment.id, 'draft')}><Copy className="w-4 h-4 mr-2" /> Mark as Draft</DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-lg h-10"><Share2 className="w-4 h-4 mr-2" /> Share with Course</DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-lg h-10"><Download className="w-4 h-4 mr-2" /> Export Grades</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="rounded-lg h-10 text-rose-500 focus:text-rose-500 focus:bg-rose-500/10"
                                      onClick={() => handleDeleteAssignment(assignment.id)}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="border-none bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-500/20 overflow-hidden relative">
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg">Pro Teaching Tip</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-sm opacity-90 leading-relaxed">
                Setting a "Draft" status allows you to refine your assignment before it becomes visible to students on their timeline.
              </p>
              <Button variant="secondary" className="w-full mt-6 bg-white/20 hover:bg-white/30 border-none text-white font-bold h-11">
                Learn Best Practices
              </Button>
            </CardContent>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-24 h-24" />
            </div>
          </Card>

          <Card className="border-border/50 shadow-sm border-none bg-card/60">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {[
                  { title: 'UX Research Phase 1', date: 'Tomorrow', color: 'bg-rose-500' },
                  { title: 'Python Loop Basics', date: 'Mar 12, 2024', color: 'bg-blue-500' },
                  { title: 'AWS Cloud Quiz', date: 'Mar 15, 2024', color: 'bg-emerald-500' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 hover:bg-muted/30 transition-colors group cursor-pointer">
                    <div className={`mt-1.5 h-2 w-2 rounded-full cursor-help ${item.color} group-hover:scale-150 transition-transform`} />
                    <div>
                      <p className="text-xs font-bold leading-none mb-1 group-hover:text-primary transition-colors">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 text-center">
            <h4 className="font-bold text-sm mb-2">Need help?</h4>
            <p className="text-xs text-muted-foreground mb-4">Our documentation covers everything from grading logic to file management.</p>
            <Button variant="outline" size="sm" className="w-full rounded-xl h-10 border-primary/20 hover:bg-primary/5">
              Documentation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal components
function Award({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
      <circle cx="12" cy="8" r="6" />
    </svg>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

export default AssignmentsDashboard;
