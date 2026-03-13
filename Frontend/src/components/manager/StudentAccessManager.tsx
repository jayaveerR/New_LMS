import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLookupStudent, useGrantExamAccess, useProfiles } from '@/hooks/useManagerData';
import {
    Search,
    UserPlus,
    CheckCircle2,
    XCircle,
    User,
    Mail,
    ShieldCheck,
    Key,
    Loader2,
    FileSearch
} from 'lucide-react';

interface StudentAccessManagerProps {
    selectedExamId?: string;
    selectedMockId?: string;
    onSuccess?: () => void;
}

export function StudentAccessManager({ selectedExamId, selectedMockId, onSuccess }: StudentAccessManagerProps) {
    const [uuidInput, setUuidInput] = useState('');
    const [lookupId, setLookupId] = useState<string | null>(null);
    const { toast } = useToast();

    const { data: student, isLoading: isLookingUp, error: lookupError } = useLookupStudent(lookupId);
    const { data: allStudents = [], isLoading: loadingStudents } = useProfiles();
    const grantAccess = useGrantExamAccess();

    const handleLookup = () => {
        if (!uuidInput.trim()) {
            toast({ title: "Enter UUID", description: "Please paste a student UUID first.", variant: "destructive" });
            return;
        }
        // Simple UUID format check
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(uuidInput.trim())) {
            toast({ title: "Invalid Format", description: "The provided string is not a valid UUID.", variant: "destructive" });
            return;
        }
        setLookupId(uuidInput.trim());
    };

    const handleConfirmAccess = async () => {
        if (!student || !student.user_id) return;

        try {
            await grantAccess.mutateAsync({
                studentId: student.user_id,
                examId: selectedExamId,
                mockPaperId: selectedMockId
            });

            setUuidInput('');
            setLookupId(null);
            if (onSuccess) onSuccess();
        } catch (err) {
            // Error handled by mutation
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-2 border-primary/10 shadow-sm bg-gradient-to-b from-primary/[0.02] to-transparent">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Key className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Student Access Control</CardTitle>
                            <CardDescription>Grant individual access using student UUID</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Student Search & List */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email or UUID..."
                                    className="pl-9"
                                    value={uuidInput}
                                    onChange={(e) => setUuidInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                                />
                            </div>

                            <Button 
                                variant="outline" 
                                className="w-full gap-2 border-dashed"
                                onClick={handleLookup}
                                disabled={isLookingUp}
                            >
                                {isLookingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                Manual UUID Lookup
                            </Button>

                            <div className="relative pt-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">Quick Select Students</span>
                                </div>
                            </div>

                            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                                {loadingStudents ? (
                                    [1, 2, 3, 4].map(i => <div key={i} className="h-12 w-full bg-muted animate-pulse rounded-md" />)
                                ) : (
                                    (allStudents as any[])
                                        .filter((s) => 
                                            !uuidInput || 
                                            s.full_name?.toLowerCase().includes(uuidInput.toLowerCase()) || 
                                            s.email?.toLowerCase().includes(uuidInput.toLowerCase()) ||
                                            s.user_id?.toLowerCase().includes(uuidInput.toLowerCase())
                                        )
                                        .map((s) => (
                                            <button
                                                key={s.user_id}
                                                onClick={() => setLookupId(s.user_id)}
                                                className={`w-full p-3 rounded-lg border text-left transition-all hover:bg-primary/5 group ${
                                                    lookupId === s.user_id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                        {s.full_name?.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold truncate">{s.full_name || 'Unnamed'}</p>
                                                        <p className="text-[10px] text-muted-foreground truncate">{s.email}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                )}
                                {allStudents.length === 0 && !loadingStudents && (
                                    <div className="text-center py-4 text-xs text-muted-foreground italic">
                                        No students found in record.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Selection & Action */}
                        <div className="lg:col-span-2">
                            {lookupError && (
                                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                    <XCircle className="h-4 w-4 mt-0.5" />
                                    <div>
                                        <p className="font-bold">Lookup Failed</p>
                                        <p>Could not find a student with that UUID. Please verify and try again.</p>
                                    </div>
                                </div>
                            )}

                            {student ? (
                                <div className="space-y-4 animate-in zoom-in-95 duration-300">
                                    <div className="p-6 rounded-xl border border-primary/20 bg-background shadow-sm">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                        <User className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-lg leading-none">{student.full_name || 'Unnamed Student'}</h4>
                                                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                                            <Mail className="h-3 w-3" /> {student.email}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border text-xs">
                                                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                                        <span className="font-medium">Status:</span>
                                                        <Badge variant="outline" className="h-5 px-1.5 capitalize">{student.approval_status}</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border text-[10px] truncate">
                                                        <Key className="h-3.5 w-3.5 text-blue-500" />
                                                        <span className="font-medium">ID:</span>
                                                        <code className="text-muted-foreground">{student.user_id}</code>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col justify-end gap-2 md:w-48">
                                                <Button
                                                    onClick={handleConfirmAccess}
                                                    disabled={grantAccess.isPending}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-600/20"
                                                >
                                                    {grantAccess.isPending ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <UserPlus className="h-4 w-4" />
                                                    )}
                                                    Grant Exam Access
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => { setLookupId(null); setUuidInput(''); }} className="text-muted-foreground">
                                                    Clear Selection
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Access Rule</p>
                                        <p className="text-sm">
                                            {selectedExamId 
                                                ? `The student will be granted access to the scheduled Live Exam.` 
                                                : selectedMockId 
                                                    ? `The student will be granted access to this Practice Mock Paper.` 
                                                    : "Select an exam from the dashboard to grant specific access."}
                                        </p>
                                    </div>
                                </div>
                            ) : !lookupId && (
                                <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 border-2 border-dashed rounded-xl opacity-60">
                                    <FileSearch className="h-16 w-16 text-muted-foreground" />
                                    <div className="max-w-xs transition-all">
                                        <p className="text-lg font-bold text-slate-700">Student Selector</p>
                                        <p className="text-sm text-muted-foreground">
                                            Search by UUID, Email, or Name to manage specific access permissions.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {(selectedExamId || selectedMockId) && (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                        <p className="font-bold">Target Resource</p>
                        <p className="text-xs">
                            Granting access to: {selectedExamId ? `Exam [${selectedExamId.substring(0, 8)}]` : `Mock Paper [${selectedMockId?.substring(0, 8)}]`}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
