import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useExams, useCreateExam, useUpdateExam, useDeleteExam } from '@/hooks/useManagerData';
import { useAuth } from '@/hooks/useAuth';
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Trash2,
  Play,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { format, isToday, isFuture } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ─── 1. Validation Schema ────────────────────────────────────────────────────

const examSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  exam_type: z.enum(['live', 'mock', 'practice', 'question_bank']),
  assigned_image: z.string().optional(),
  scheduled_date: z.string().refine((val) => new Date(val) > new Date(), {
    message: 'Scheduled date must be in the future',
  }),
  duration_minutes: z.coerce.number().min(10, 'Duration must be at least 10 minutes'),
  total_marks: z.coerce.number().min(1, 'Total marks must be at least 1'),
  passing_marks: z.coerce.number().min(1),
  negative_marking: z.coerce.number().min(0),
  shuffle_questions: z.boolean().default(true),
  proctoring_enabled: z.boolean().default(false),
}).refine((data) => data.passing_marks <= data.total_marks, {
  message: 'Passing marks cannot exceed total marks',
  path: ['passing_marks'],
});

type ExamFormValues = z.infer<typeof examSchema>;

// ─── 2. Image Upload Component ──────────────────────────────────────────────

function FileUploadZone({ value, onChange }: { value?: string; onChange: (val: string) => void }) {
  const [dragActive, setDragActive] = useState(false);
  const [tab, setTab] = useState<'upload' | 'url'>('upload');

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) onChange(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  if (value) {
    return (
      <div className="relative rounded-lg overflow-hidden border border-border group h-40">
        <img src={value} alt="Preview" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button variant="destructive" size="sm" onClick={() => onChange('')} className="rounded-lg">
            <Trash2 className="h-4 w-4 mr-2" /> Remove
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as 'upload' | 'url')} className="w-full">
      <TabsList className="grid w-full grid-cols-2 h-9 mb-2">
        <TabsTrigger value="upload" className="text-xs">Upload</TabsTrigger>
        <TabsTrigger value="url" className="text-xs">URL</TabsTrigger>
      </TabsList>
      <TabsContent value="upload">
        <div
          className={cn(
            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:bg-muted/50"
          )}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
            <ImageIcon className="h-6 w-6 text-muted-foreground/40 mb-2" />
            <p className="text-xs font-medium text-muted-foreground">Click or drag image</p>
            <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </label>
        </div>
      </TabsContent>
      <TabsContent value="url">
        <Input
          placeholder="https://example.com/image.png"
          className="h-9 text-xs"
          onChange={(e) => onChange(e.target.value)}
        />
      </TabsContent>
    </Tabs>
  );
}

// ─── 3. Main Component ──────────────────────────────────────────────────────

export function ExamScheduler() {
  const { user } = useAuth();
  const { data: exams = [], isLoading } = useExams();
  const createExam = useCreateExam();
  const updateExam = useUpdateExam();
  const deleteExam = useDeleteExam();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: '',
      description: '',
      exam_type: 'live',
      duration_minutes: 60,
      total_marks: 100,
      passing_marks: 40,
      negative_marking: 0,
      shuffle_questions: true,
      proctoring_enabled: false,
      scheduled_date: '',
    },
  });

  const onSubmit = async (data: ExamFormValues) => {
    if (!user?.id) return;
    try {
      await createExam.mutateAsync({
        title: data.title as string,
        exam_type: data.exam_type as string,
        duration_minutes: data.duration_minutes as number,
        total_marks: data.total_marks as number,
        passing_marks: data.passing_marks as number,
        negative_marking: data.negative_marking as number,
        shuffle_questions: data.shuffle_questions as boolean,
        proctoring_enabled: data.proctoring_enabled as boolean,
        description: data.description ?? null,
        assigned_image: data.assigned_image ?? null,
        scheduled_date: new Date(data.scheduled_date).toISOString(),
        course_id: null,
        max_attempts: 1,
        show_results: true,
        status: 'scheduled',
        created_by: user.id,
      });
      setIsAddOpen(false);
      form.reset();
    } catch (error) {
      console.error('Failed to create exam', error);
    }
  };

  const todayExams = exams.filter(e => isToday(new Date(e.scheduled_date)));
  const upcomingExams = exams.filter(e => isFuture(new Date(e.scheduled_date)) && !isToday(new Date(e.scheduled_date)));

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px] text-xs font-medium text-muted-foreground animate-pulse">Synchronizing exam registry...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Search and Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Exam Management</h2>
          <p className="text-sm text-muted-foreground">Schedule and manage your assessment sessions</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-lg shadow-sm">
              <Plus className="h-4 w-4 mr-2" /> Schedule Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl rounded-xl border shadow-lg overflow-hidden">
            <div className="p-1 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule New Assessment</DialogTitle>
                <DialogDescription>Configure the rules and timing for this exam.</DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-5">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-tight">Exam Title</FormLabel>
                            <FormControl><Input placeholder="Internal Assessment" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="exam_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-tight">Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="live">Live Proctored</SelectItem>
                                <SelectItem value="mock">Mock Test</SelectItem>
                                <SelectItem value="practice">Practice Set</SelectItem>
                                <SelectItem value="question_bank">Question Bank Manager</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="assigned_image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-tight">Cover Image</FormLabel>
                          <FormControl><FileUploadZone value={field.value} onChange={field.onChange} /></FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-tight">Instructions</FormLabel>
                        <FormControl><Textarea placeholder="Instructions for candidates..." className="min-h-[80px]" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border">
                    <FormField
                      control={form.control}
                      name="scheduled_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase">Date & Time</FormLabel>
                          <FormControl><Input type="datetime-local" {...field} className="h-9 text-xs" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="duration_minutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase">Duration (mins)</FormLabel>
                          <FormControl><Input type="number" {...field} className="h-9 text-xs" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="total_marks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase">Total Marks</FormLabel>
                          <FormControl><Input type="number" {...field} className="h-9 text-xs" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/20 border rounded-lg gap-6">
                    <FormField
                      control={form.control}
                      name="shuffle_questions"
                      render={({ field }) => (
                        <div className="flex items-center gap-3">
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                          <div className="space-y-0.5">
                            <Label className="text-xs font-bold">Shuffle</Label>
                            <p className="text-[10px] text-muted-foreground">Randomize order</p>
                          </div>
                        </div>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="proctoring_enabled"
                      render={({ field }) => (
                        <div className="flex items-center gap-3">
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                          <div className="space-y-0.5">
                            <Label className="text-xs font-bold">Proctoring</Label>
                            <p className="text-[10px] text-muted-foreground">AI Monitoring</p>
                          </div>
                        </div>
                      )}
                    />
                  </div>

                  <DialogFooter className="pt-4 border-t gap-2">
                    <Button type="button" variant="outline" className="rounded-lg" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createExam.isPending} className="rounded-lg px-8">
                      {createExam.isPending ? 'Scheduling...' : 'Confirm Schedule'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Active Today */}
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-lg border border-emerald-100">
            <h3 className="text-xs font-bold uppercase tracking-tight text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" /> Sessions Today
            </h3>
            <Badge className="bg-emerald-600 h-5 px-1.5 text-[10px]">{todayExams.length}</Badge>
          </div>

          <div className="space-y-2">
            {todayExams.length === 0 ? (
              <p className="text-center py-8 text-xs font-medium text-muted-foreground border rounded-lg bg-muted/5">No active sessions for today.</p>
            ) : (
              todayExams.map(exam => (
                <Card key={exam.id} className="rounded-xl border shadow-sm p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border">
                      {exam.assigned_image ? (
                        <img src={exam.assigned_image} className="h-full w-full object-cover" alt={exam.title} />
                      ) : (
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm truncate">{exam.title}</h4>
                      <p className="text-[11px] text-muted-foreground font-medium uppercase">{format(new Date(exam.scheduled_date), 'h:mm a')} • {exam.duration_minutes}m</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className={cn(
                        "flex-1 h-8 text-[11px] font-bold rounded-lg",
                        exam.status === 'active' ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      )}
                      onClick={() => updateExam.mutate({ id: exam.id, status: exam.status === 'active' ? 'completed' : 'active' })}
                    >
                      {exam.status === 'active' ? 'STOP SESSION' : 'START NOW'}
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground/40 hover:text-destructive" onClick={() => deleteExam.mutate(exam.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
            <h3 className="text-xs font-bold uppercase tracking-tight text-slate-700 flex items-center gap-2">
              <CalendarIcon className="h-3.5 w-3.5" /> Upcoming Schedule
            </h3>
            <span className="text-xs font-medium text-muted-foreground">{upcomingExams.length} assessments scheduled</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-1 xl:grid-cols-2">
            {upcomingExams.length === 0 ? (
              <div className="col-span-full py-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center space-y-2 bg-muted/5">
                <AlertCircle className="h-8 w-8 text-muted-foreground/20" />
                <p className="text-sm font-medium text-muted-foreground">No upcoming exams found.</p>
              </div>
            ) : (
              upcomingExams.map(exam => (
                <Card key={exam.id} className="group rounded-xl border-none shadow-sm hover:shadow-md transition-all border bg-card flex flex-col overflow-hidden">
                  <div className="h-20 sm:h-24 relative bg-muted/20">
                    {exam.assigned_image ? (
                      <img src={exam.assigned_image} className="w-full h-full object-cover" alt={exam.title} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-6 w-6 text-muted-foreground/20" /></div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-background/90 text-[10px] h-5 rounded-md border border-border">{exam.exam_type}</Badge>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm leading-tight line-clamp-1">{exam.title}</h4>
                      <div className="flex items-center gap-3 text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                        <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {exam.duration_minutes}m</span>
                        <span className="flex items-center gap-1"><CalendarIcon className="h-2.5 w-2.5" /> {format(new Date(exam.scheduled_date), 'MMM dd')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex-1 h-8 rounded-lg text-[10px] font-bold" onClick={() => setIsAddOpen(true)}>Edit</Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground/40 hover:text-destructive" onClick={() => deleteExam.mutate(exam.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
