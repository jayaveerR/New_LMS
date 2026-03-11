import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const weeklyActivity = [
    { day: "Mon", active: 42, newEnroll: 5 },
    { day: "Tue", active: 58, newEnroll: 8 },
    { day: "Wed", active: 75, newEnroll: 12 },
    { day: "Thu", active: 63, newEnroll: 7 },
    { day: "Fri", active: 89, newEnroll: 15 },
    { day: "Sat", active: 45, newEnroll: 3 },
    { day: "Sun", active: 32, newEnroll: 2 },
];

const engagementData = [
    { name: "Completed", value: 45, color: "#10b981" },
    { name: "In Progress", value: 30, color: "#3b82f6" },
    { name: "Not Started", value: 25, color: "#e2e8f0" },
];

const coursePerformance = [
    { name: "Course 1", completion: 82, satisfaction: 88 },
    { name: "Course 2", completion: 65, satisfaction: 74 },
    { name: "Course 3", completion: 91, satisfaction: 95 },
    { name: "Course 4", completion: 48, satisfaction: 62 },
    { name: "Course 5", completion: 73, satisfaction: 79 },
];

const HEATMAP_HOURS = ["9am", "12pm", "3pm", "6pm", "9pm"];
const HEATMAP_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const heatmapData = HEATMAP_DAYS.map((day) => ({
    day,
    values: HEATMAP_HOURS.map(() => Math.floor(Math.random() * 100)),
}));

function HeatCell({ value }: { value: number }) {
    const opacity = value / 100;
    const style = {
        backgroundColor: `rgba(59, 130, 246, ${0.1 + opacity * 0.9})`,
    };
    return (
        <div
            style={style}
            className="w-full h-8 rounded-sm flex items-center justify-center text-xs font-medium text-blue-900 dark:text-blue-100 hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer"
            title={`${value}% engagement`}
        >
            {value > 40 ? value : ""}
        </div>
    );
}

interface PerformanceChartsProps {
    loading?: boolean;
}

export function PerformanceCharts({ loading }: PerformanceChartsProps) {
    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="border-border/50">
                        <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
                        <CardContent><Skeleton className="h-48 w-full" /></CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <Tabs defaultValue="activity" className="w-full">
            <TabsList className="mb-4 md:mb-6 bg-muted/50 flex-wrap h-auto p-1 justify-start">
                <TabsTrigger value="activity" className="flex-grow sm:flex-grow-0">Activity</TabsTrigger>
                <TabsTrigger value="performance" className="flex-grow sm:flex-grow-0">Performance</TabsTrigger>
                <TabsTrigger value="engagement" className="flex-grow sm:flex-grow-0">Engagement</TabsTrigger>
                <TabsTrigger value="heatmap" className="flex-grow sm:flex-grow-0">Heatmap</TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm sm:text-base font-semibold">Weekly Student Activity</CardTitle>
                        <p className="text-xs text-muted-foreground">Active students and new enrollments per day</p>
                    </CardHeader>
                    <CardContent className="overflow-hidden px-1 sm:px-6 pb-2 sm:pb-6">
                        <ResponsiveContainer width="99%" height={220}>
                            <AreaChart data={weeklyActivity} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                                <defs>
                                    <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} />
                                <YAxis tick={{ fontSize: 10 }} width={28} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: '10px' }} />
                                <Area type="monotone" dataKey="active" name="Active Students" stroke="#3b82f6" fill="url(#activeGrad)" strokeWidth={2} />
                                <Area type="monotone" dataKey="newEnroll" name="New Enrollments" stroke="#10b981" fill="url(#enrollGrad)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="performance">
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm sm:text-base font-semibold">Course-Wise Performance</CardTitle>
                        <p className="text-xs text-muted-foreground">Completion rate vs student satisfaction</p>
                    </CardHeader>
                    <CardContent className="overflow-hidden px-1 sm:px-6 pb-2 sm:pb-6">
                        <ResponsiveContainer width="99%" height={200}>
                            <BarChart data={coursePerformance} barGap={2} barCategoryGap="20%" margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} tickLine={false} />
                                <YAxis tick={{ fontSize: 9 }} unit="%" domain={[0, 100]} width={28} />
                                <Tooltip formatter={(v: number) => `${v}%`} />
                                <Legend wrapperStyle={{ fontSize: '10px' }} />
                                <Bar dataKey="completion" name="Completion %" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={18} />
                                <Bar dataKey="satisfaction" name="Satisfaction %" fill="#f97316" radius={[3, 3, 0, 0]} maxBarSize={18} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="engagement">
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm sm:text-base font-semibold">Overall Engagement</CardTitle>
                        <p className="text-xs text-muted-foreground">Pass vs Fail & completion distribution</p>
                    </CardHeader>
                    <CardContent className="overflow-hidden flex items-center justify-center px-1 sm:px-6">
                        <ResponsiveContainer width="99%" height={220}>
                            <PieChart>
                                <Pie
                                    data={engagementData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={64}
                                    outerRadius={100}
                                    paddingAngle={4}
                                    dataKey="value"
                                    nameKey="name"
                                >
                                    {engagementData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v: number) => `${v}%`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="heatmap">
                <Card className="border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Student Engagement Timeline</CardTitle>
                        <p className="text-xs text-muted-foreground">When are students most active throughout the week?</p>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 mb-2">
                            <div className="w-10" /> {/* spacer */}
                            {HEATMAP_HOURS.map((h) => (
                                <div key={h} className="flex-1 text-center text-xs text-muted-foreground">{h}</div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            {heatmapData.map((row) => (
                                <div key={row.day} className="flex gap-2 items-center">
                                    <div className="w-10 text-xs text-muted-foreground text-right pr-1">{row.day}</div>
                                    {row.values.map((val, i) => (
                                        <div key={i} className="flex-1">
                                            <HeatCell value={val} />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 mt-4 justify-end">
                            <span className="text-xs text-muted-foreground">Low</span>
                            {[10, 30, 50, 70, 90].map((v) => (
                                <div key={v} className="w-6 h-3 rounded-sm" style={{ backgroundColor: `rgba(59,130,246,${0.1 + v / 100 * 0.9})` }} />
                            ))}
                            <span className="text-xs text-muted-foreground">High</span>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
