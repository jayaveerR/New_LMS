import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ClipboardCheck, Clock, Award, ArrowRight } from "lucide-react";
import { useStudentExams, useStudentMockPapers } from "@/hooks/useStudentData";
import { Skeleton } from "@/components/ui/skeleton";

interface ExamModuleProps {
    type: 'mock' | 'live';
}

interface Exam {
    id: string;
    title: string;
    description: string;
    duration_minutes: number;
    total_marks: number;
}

export function ExamModule({ type }: ExamModuleProps) {
    const { data: liveExams, isLoading: loadingExams } = useStudentExams();
    const { data: mockPapers, isLoading: loadingMocks } = useStudentMockPapers();

    const data = type === 'live' ? liveExams : mockPapers;
    const isLoading = type === 'live' ? loadingExams : loadingMocks;
    const icon = type === 'live' ? <ClipboardCheck className="h-5 w-5" /> : <FileText className="h-5 w-5" />;

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    {type === 'live' ? <ClipboardCheck className="h-10 w-10 mb-2 opacity-50" /> : <FileText className="h-10 w-10 mb-2 opacity-50" />}
                    <p>No {type === 'live' ? 'live exams' : 'mock papers'} available at the moment.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4">
            {data.map((item: Exam) => (
                <Card key={item.id} className="hover:border-primary/50 transition-colors bg-card/50">
                    <CardHeader className="p-5 flex flex-row items-center justify-between space-y-0">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="p-2 rounded-lg bg-primary/10 text-primary">
                                    {icon}
                                </span>
                                <CardTitle className="text-base">{item.title}</CardTitle>
                            </div>
                            <CardDescription>{item.description}</CardDescription>
                        </div>
                        <div className="hidden md:block">
                            {type === 'live' ? (
                                <Badge variant="outline" className="text-orange-500 border-orange-200 bg-orange-50 font-semibold">
                                    LIVE SOON
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50">
                                    PRACTICE
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span>{item.duration_minutes} mins</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Award className="h-4 w-4" />
                                <span>{item.total_marks} Marks</span>
                            </div>
                        </div>
                        <Button size="sm" className="gap-2 group">
                            {type === 'live' ? 'Enter Exam' : 'Start Mock'}
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
