import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    AlertTriangle, Clock, Calendar, TrendingDown, UserX,
    CheckCircle2, Bell, ExternalLink,
} from "lucide-react";

interface Alert {
    id: string;
    type: "inactive" | "performance" | "exam" | "liveClass";
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    action?: string;
}

const MOCK_ALERTS: Alert[] = [
    {
        id: "1",
        type: "inactive",
        title: "12 students inactive",
        description: "Students in 'React Advanced' haven't logged in for 7+ days",
        priority: "high",
        action: "Send Reminder",
    },
    {
        id: "2",
        type: "performance",
        title: "Low performance detected",
        description: "'State Management' topic has 68% failure rate",
        priority: "high",
        action: "Review Topic",
    },
    {
        id: "3",
        type: "liveClass",
        title: "Live class in 2 hours",
        description: "React Hooks Q&A session starts at 11:00 PM IST",
        priority: "medium",
        action: "Go Live",
    },
    {
        id: "4",
        type: "exam",
        title: "Exam reminder",
        description: "Mid-term exam for 'Node.js Basics' scheduled tomorrow",
        priority: "medium",
        action: "View Exam",
    },
    {
        id: "5",
        type: "inactive",
        title: "5 students at risk",
        description: "Below 40% progress in 'Python Fundamentals'",
        priority: "low",
        action: "View Students",
    },
];

interface Task {
    id: string;
    title: string;
    priority: "High" | "Medium" | "Low";
    deadline: string;
    count?: number;
}

const MOCK_TASKS: Task[] = [
    { id: "1", title: "Grade pending assignments", priority: "High", deadline: "Today", count: 8 },
    { id: "2", title: "Upload Module 4 videos", priority: "High", deadline: "Tomorrow" },
    { id: "3", title: "Answer student doubts", priority: "Medium", deadline: "Today", count: 3 },
    { id: "4", title: "Create next week's schedule", priority: "Low", deadline: "Sat, Mar 8" },
];

const alertIcon = {
    inactive: UserX,
    performance: TrendingDown,
    exam: AlertTriangle,
    liveClass: Calendar,
};

const priorityColor = {
    high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    medium: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    low: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const taskPriorityDot = {
    High: "bg-red-500",
    Medium: "bg-orange-400",
    Low: "bg-blue-400",
};

export function SmartAlerts() {
    return (
        <div className="space-y-6">
            {/* Alerts */}
            <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Bell className="h-4 w-4 text-orange-500" />
                            Smart Alerts
                        </CardTitle>
                        <Badge variant="outline" className="text-orange-500 border-orange-200 bg-orange-50 text-xs">
                            {MOCK_ALERTS.filter(a => a.priority === "high").length} High
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-72">
                        <div className="px-4 pb-4 space-y-3">
                            {MOCK_ALERTS.map((alert, i) => {
                                const Icon = alertIcon[alert.type];
                                return (
                                    <motion.div
                                        key={alert.id}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.07 }}
                                        className="flex gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors group"
                                    >
                                        <div className={`p-1.5 rounded-lg flex-shrink-0 h-fit ${priorityColor[alert.priority]}`}>
                                            <Icon className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                <p className="text-xs font-semibold text-foreground truncate">{alert.title}</p>
                                                <Badge className={`text-[10px] px-1.5 py-0 flex-shrink-0 ${priorityColor[alert.priority]} border-0`}>
                                                    {alert.priority}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{alert.description}</p>
                                            {alert.action && (
                                                <button className="text-[11px] text-primary font-medium mt-1.5 hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {alert.action}
                                                    <ExternalLink className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Task Manager */}
            <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-blue-500" />
                            Pending Tasks
                        </CardTitle>
                        <span className="text-xs text-muted-foreground">{MOCK_TASKS.length} items</span>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="px-4 pb-4 space-y-2">
                        {MOCK_TASKS.map((task, i) => (
                            <div key={task.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    className="flex items-center gap-3 py-2 group cursor-pointer hover:bg-muted/40 rounded-lg px-2 -mx-2"
                                >
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${taskPriorityDot[task.priority]}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-foreground truncate">{task.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Clock className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-[11px] text-muted-foreground">{task.deadline}</span>
                                            {task.count && (
                                                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                                                    {task.count}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <Badge
                                        className={`text-[10px] px-1.5 py-0 border-0 ${task.priority === "High" ? priorityColor.high :
                                                task.priority === "Medium" ? priorityColor.medium : priorityColor.low
                                            }`}
                                    >
                                        {task.priority}
                                    </Badge>
                                </motion.div>
                                {i < MOCK_TASKS.length - 1 && <Separator className="opacity-40" />}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                        { label: "Create Course", color: "bg-blue-600 hover:bg-blue-700" },
                        { label: "Start Live Class", color: "bg-emerald-600 hover:bg-emerald-700" },
                        { label: "Generate AI MCQs", color: "bg-purple-600 hover:bg-purple-700" },
                        { label: "Post Announcement", color: "bg-orange-500 hover:bg-orange-600" },
                    ].map(({ label, color }) => (
                        <Button
                            key={label}
                            size="sm"
                            className={`${color} text-white text-xs h-9 w-full shadow-sm`}
                        >
                            {label}
                        </Button>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
