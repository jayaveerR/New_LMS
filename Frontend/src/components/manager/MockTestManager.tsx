import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMockTestConfigs, useCreateMockTestConfig, useDeleteMockTestConfig, useUpdateMockTestConfig } from '@/hooks/useManagerData';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Trash2, Clock, ListChecks, Shuffle, Layers, ArrowRight, Settings, Target } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export function MockTestManager() {
  const { user } = useAuth();
  const { data: configs = [], isLoading } = useMockTestConfigs();
  const createConfig = useCreateMockTestConfig();
  const deleteConfig = useDeleteMockTestConfig();
  const updateConfig = useUpdateMockTestConfig();

  const handleToggleActive = (id: string, current: boolean) => {
    updateConfig.mutate({ id, is_active: !current });
  };

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newConfig, setNewConfig] = useState({
    title: '',
    description: '',
    topics: '',
    question_count: 30,
    duration_minutes: 60,
    easy_percent: 30,
    medium_percent: 50,
    hard_percent: 20,
    is_active: true,
  });

  const handleCreate = async () => {
    if (!newConfig.title.trim() || !user?.id) return;
    try {
      await createConfig.mutateAsync({
        title: newConfig.title,
        description: newConfig.description || null,
        course_id: null,
        topics: newConfig.topics.split(',').map(t => t.trim()).filter(Boolean),
        question_count: newConfig.question_count,
        duration_minutes: newConfig.duration_minutes,
        difficulty_mix: {
          easy: newConfig.easy_percent,
          medium: newConfig.medium_percent,
          hard: newConfig.hard_percent,
        },
        is_active: newConfig.is_active,
        created_by: user.id,
      });
      setNewConfig({
        title: '',
        description: '',
        topics: '',
        question_count: 30,
        duration_minutes: 60,
        easy_percent: 30,
        medium_percent: 50,
        hard_percent: 20,
        is_active: true,
      });
      setIsAddOpen(false);
    } catch (err) {
      console.error('Failed to create mock test:', err);
    }
  };

  const activeConfigs = configs.filter(c => c.is_active);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-4" />
        <p className="text-xs font-medium text-muted-foreground animate-pulse">Loading configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Mock Test Manager</h2>
          <p className="text-sm text-muted-foreground">Configure and manage practice assessment environments</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-lg shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Mock Test
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg rounded-xl shadow-lg border">
            <div className="p-1 space-y-6 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Mock Test Configuration</DialogTitle>
                <DialogDescription>Set the parameters for this practice assessment</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="e.g. Full Stack Interview Prep"
                    value={newConfig.title}
                    onChange={(e) => setNewConfig({ ...newConfig, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Instructions for students..."
                    className="min-h-[80px] resize-none"
                    value={newConfig.description}
                    onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Topics (comma separated)</Label>
                  <Input
                    placeholder="React, Node.js, TypeScript"
                    value={newConfig.topics}
                    onChange={(e) => setNewConfig({ ...newConfig, topics: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Question Count</Label>
                    <Input
                      type="number"
                      value={newConfig.question_count}
                      onChange={(e) => setNewConfig({ ...newConfig, question_count: parseInt(e.target.value) || 30 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (mins)</Label>
                    <Input
                      type="number"
                      value={newConfig.duration_minutes}
                      onChange={(e) => setNewConfig({ ...newConfig, duration_minutes: parseInt(e.target.value) || 60 })}
                    />
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-muted/20 space-y-4">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                    <Shuffle className="h-3 w-3" /> Difficulty Balance
                  </h4>

                  {[
                    { label: 'Easy', key: 'easy_percent' },
                    { label: 'Medium', key: 'medium_percent' },
                    { label: 'Hard', key: 'hard_percent' },
                  ].map((item) => (
                    <div key={item.key} className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-medium">
                        <span>{item.label}</span>
                        <span>{newConfig[item.key as keyof typeof newConfig]}%</span>
                      </div>
                      <Slider
                        value={[newConfig[item.key as keyof typeof newConfig] as number]}
                        max={100}
                        step={5}
                        onValueChange={([v]) => setNewConfig({ ...newConfig, [item.key]: v })}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Active Status</Label>
                    <p className="text-[11px] text-muted-foreground">Make available immediately</p>
                  </div>
                  <Switch
                    checked={newConfig.is_active}
                    onCheckedChange={(checked) => setNewConfig({ ...newConfig, is_active: checked })}
                  />
                </div>
              </div>

              <DialogFooter className="pt-4 border-t gap-2">
                <Button variant="outline" className="rounded-lg" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button className="rounded-lg px-6" onClick={handleCreate} disabled={createConfig.isPending}>
                  {createConfig.isPending ? 'Saving...' : 'Save Mock Test'}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Configs', value: configs.length, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Tests', value: activeConfigs.length, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg Questions', value: configs.length > 0 ? Math.round(configs.reduce((acc, c) => acc + c.question_count, 0) / configs.length) : 0, icon: ListChecks, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Performance', value: '88%', icon: Settings, color: 'text-slate-600', bg: 'bg-slate-50' },
        ].map((stat, i) => (
          <Card key={i} className="rounded-xl border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">{stat.label}</p>
                  <h3 className="text-xl font-bold">{stat.value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Standard List View */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">Configured Tests</h3>
          <span className="text-xs text-muted-foreground font-medium">{configs.length} items</span>
        </div>

        {configs.length === 0 ? (
          <div className="py-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center space-y-3 bg-muted/5">
            <Shuffle className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No mock tests configured yet.</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {configs.map((config) => (
              <Card key={config.id} className="relative group border shadow-sm hover:shadow-md transition-all bg-card rounded-xl flex items-center overflow-hidden">
                <div className={cn(
                  "w-1.5 self-stretch shrink-0",
                  config.is_active ? "bg-emerald-500" : "bg-muted"
                )} />

                <div className="flex-1 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={config.is_active ? "default" : "secondary"} 
                        className={cn(
                            "text-[10px] font-medium h-5 px-1.5 uppercase cursor-pointer hover:opacity-80 transition-opacity",
                            config.is_active ? "bg-emerald-500 hover:bg-emerald-600" : ""
                        )}
                        onClick={() => handleToggleActive(config.id, config.is_active)}
                      >
                        {config.is_active ? 'Active' : 'Draft'}
                      </Badge>
                      {config.topics.length > 0 && (
                        <span className="text-[11px] text-muted-foreground font-medium">• {config.topics.slice(0, 2).join(', ')}</span>
                      )}
                    </div>
                    <h4 className="text-base font-semibold text-foreground">
                      {config.title}
                    </h4>
                    <div className="flex items-center gap-4 text-muted-foreground text-xs">
                      <span className="flex items-center gap-1.5"><ListChecks className="h-3.5 w-3.5" /> {config.question_count} Questions</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {config.duration_minutes}m</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/5" onClick={() => deleteConfig.mutate(config.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="rounded-lg px-4 gap-2">
                      Launch Test <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
