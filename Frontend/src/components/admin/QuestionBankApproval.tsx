import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { fetchWithAuth } from '@/lib/api';
import { Loader2, CheckCircle, XCircle, FileText, AlertCircle } from 'lucide-react';

interface PendingQuestionBank {
    topic: string;
    count: number;
    created_by: string;
    created_at: string;
}

export function QuestionBankApproval() {
    const [pendingBanks, setPendingBanks] = useState<PendingQuestionBank[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchPendingBanks = async () => {
        try {
            setLoading(true);
            // We'll fetch topics with pending status
            // Note: This relies on the backend generic CRUD or specific endpoint
            const questions = await fetchWithAuth('/data/question_bank?approval_status=pending');

            // Group by topic
            const grouped = questions.reduce((acc: Record<string, PendingQuestionBank>, q: any) => {
                if (!acc[q.topic]) {
                    acc[q.topic] = {
                        topic: q.topic,
                        count: 0,
                        created_by: q.created_by,
                        created_at: q.created_at
                    };
                }
                acc[q.topic].count++;
                return acc;
            }, {});

            setPendingBanks(Object.values(grouped));
        } catch (err) {
            console.error('Failed to fetch pending question banks', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingBanks();
    }, []);

    const handleApproveReject = async (topic: string, status: 'approved' | 'rejected') => {
        try {
            setProcessing(topic);
            await fetchWithAuth('/admin/approve-question-bank', {
                method: 'PUT',
                body: JSON.stringify({ topic, status })
            });

            toast({
                title: `Question Bank ${status === 'approved' ? 'Approved' : 'Rejected'}`,
                description: `Topic: ${topic}`
            });

            setPendingBanks(prev => prev.filter(b => b.topic !== topic));
        } catch (err) {
            toast({
                title: 'Action Failed',
                description: err instanceof Error ? err.message : 'Failed to update status',
                variant: 'destructive'
            });
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Fetching pending approvals...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Question Bank Approvals</h2>
                    <p className="text-muted-foreground text-sm">Review and activate question banks created by Managers.</p>
                </div>
                <Badge variant="outline" className="h-6">
                    {pendingBanks.length} Pending
                </Badge>
            </div>

            {pendingBanks.length === 0 ? (
                <Card className="border-dashed bg-muted/20">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                        <CheckCircle className="h-10 w-10 text-muted-foreground/20" />
                        <p className="text-sm font-medium text-muted-foreground">All clear! No pending question banks to review.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {pendingBanks.map((bank) => (
                        <Card key={bank.topic} className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center">
                                    <div className="bg-primary/5 p-6 flex flex-col justify-center border-r">
                                        <FileText className="h-8 w-8 text-primary mb-2" />
                                        <Badge variant="secondary" className="w-fit">{bank.count} Questions</Badge>
                                    </div>

                                    <div className="flex-1 p-6 space-y-1">
                                        <h3 className="font-bold text-lg">{bank.topic}</h3>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span>Created: {new Date(bank.created_at).toLocaleDateString()}</span>
                                            <span>By: {bank.created_by.substring(0, 8)}...</span>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-muted/10 flex items-center gap-3 border-l">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleApproveReject(bank.topic, 'rejected')}
                                            disabled={!!processing}
                                            className="text-destructive hover:bg-destructive/10"
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleApproveReject(bank.topic, 'approved')}
                                            disabled={!!processing}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                        >
                                            {processing === bank.topic ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                            )}
                                            Approve & Activate
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
