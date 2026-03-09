import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useQuestions,
  useCreateQuestion,
  useDeleteQuestion,
  useMockTestConfigs,
  useCreateMockTestConfig
} from '@/hooks/useManagerData';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  FileQuestion,
  Trash2,
  Search,
  Sparkles,
  Brain,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Layers,
  ClipboardList,
  ArrowRight,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// ... (Constants)

// ... (parseAiText function)
// I will not include the full parseAiText function here to avoid complexity in this tool call if I can avoid it.
// But I need to remove console.log inside it.
// Accessing it via searching for the console.log line might be better in a separate call?
// No, I'll do it all here since I'm touching imports and the main component.

// Actually, `replace_file_content` requires me to match `TargetContent`.
// If I try to do too much, I might miss.
// I'll do imports first.


// ─── Constants ───────────────────────────────────────────────────────────────

const N8N_WEBHOOK = 'https://aotms.app.n8n.cloud/webhook/Aotms';

const DIFFICULTY_COLOR = {
  easy: 'text-emerald-500',
  medium: 'text-amber-500',
  hard: 'text-rose-500',
} as const;

const DIFFICULTY_BADGE_VARIANT = {
  easy: 'default',
  medium: 'secondary',
  hard: 'destructive',
} as const;

const QUESTION_TYPES = [
  { value: 'mcq', label: 'Multiple Choice (MCQ)' },
  { value: 'true_false', label: 'True / False' },
  { value: 'short', label: 'Short Answer' },
  { value: 'long', label: 'Long Answer / Essay' },
  { value: 'fill_blank', label: 'Fill in the Blank' },
  { value: 'match', label: 'Match the Following' },
  { value: 'coding', label: 'Coding / Practical' },
];

const EMPTY_QUESTION = {
  topic: '',
  question_text: '',
  question_type: 'mcq',
  difficulty: 'medium',
  options: ['', '', '', ''],
  correct_answer: '',
  explanation: '',
  marks: 1,
};

// ─── AI Panel Types ───────────────────────────────────────────────────────────

export interface AiQuestion {
  topic?: string;
  question_text: string;
  question_type?: string;
  difficulty?: string;
  options?: string[];
  correct_answer?: string;
  explanation?: string;
  marks?: number;
  [key: string]: unknown;
}

interface AiAnalysisResult {
  questions?: AiQuestion[];
  rawText: string;        // always keep original AI text
  parseError?: string;   // if parsing failed
}

/**
 * Parse the plain-text / markdown output from n8n.
 * Supports:
 * 1. JSON structure `[{ "output": "..." }]`
 * 2. Numbered lists `1. Question`
 * 3. Markdown bold headers `**Question**` (without numbers)
 */
function parseAiText(
  text: string,
  fallbackTopic: string,
  fallbackType: string,
  fallbackDifficulty: string,
): AiAnalysisResult {
  let rawText = text.trim();

  // ── 0. Pre-clean: Remove markdown code blocks if present ──
  const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (jsonMatch) {
    rawText = jsonMatch[1].trim();
  }

  // ── 1. Try to extract inner text from JSON wrapper or parse direct JSON ──
  try {
    let json = JSON.parse(rawText);

    // Normalize: If it's an n8n wrapper like [{ output: "..." }] or { output: "..." }
    if (Array.isArray(json) && json.length > 0 && json[0].output && typeof json[0].output === 'string') {
      const innerText = json[0].output;
      try {
        const innerMatch = innerText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        json = JSON.parse(innerMatch ? innerMatch[1] : innerText);
      } catch (e) {
        rawText = innerText;
      }
    } else if (typeof json === 'object' && json !== null && json.output && typeof json.output === 'string') {
      const innerText = json.output;
      try {
        const innerMatch = innerText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        json = JSON.parse(innerMatch ? innerMatch[1] : innerText);
      } catch (e) {
        rawText = innerText;
      }
    }

    // Normalize: If json is { questions: [...] } or { data: [...] }
    if (!Array.isArray(json) && typeof json === 'object' && json !== null) {
      if (Array.isArray(json.questions)) json = json.questions;
      else if (Array.isArray(json.data)) json = json.data;
      else if (Array.isArray(json.items)) json = json.items;
    }

    // Case C: Array of Questions (User's Schema)
    if (Array.isArray(json) && json.length > 0) {
      const mappedQuestions: AiQuestion[] = [];

      for (const item of json) {
        // loose check for question-like object
        const qText = item.question || item.question_text || item.Question || item.questionText || '';

        if (!qText) continue;

        // Options: handle 'options' array OR 'optionA'...'optionD' fields
        let opts: string[] = [];
        if (Array.isArray(item.options)) {
          opts = item.options.map(String);
        } else if (item.optionA || item.optionA || item.OptionA) {
          // Strict Schema Support (checking variants optionA/OptionA)
          opts = [
            item.optionA || item.optionA || item.OptionA,
            item.optionB || item.optionB || item.OptionB,
            item.optionC || item.optionC || item.OptionC,
            item.optionD || item.optionD || item.OptionD,
            item.optionE || item.optionE || item.OptionE
          ].filter(Boolean).map(String);
        } else if (typeof item.options === 'object' && item.options !== null) {
          opts = Object.values(item.options).map(String);
        } else {
          // Try fetching "Options", "choices"
          const rawOpts = item.Options || item.choices || [];
          if (Array.isArray(rawOpts)) opts = rawOpts.map(String);
        }

        // Correct Answer
        let ans = item.answer || item.correct_answer || item.Answer || item.correctAnswer || '';

        // Resolve "A", "B", etc. to full option text if possible
        if (opts.length > 0 && /^[A-E]$/i.test(ans)) {
          const idx = ans.toUpperCase().charCodeAt(0) - 65;
          if (opts[idx]) {
            ans = opts[idx];
          }
        }

        mappedQuestions.push({
          topic: item.topic || fallbackTopic,
          question_text: qText,
          question_type: item.type || item.question_type || fallbackType,
          difficulty: item.difficulty || fallbackDifficulty,
          options: opts.length >= 2 ? opts : undefined,
          correct_answer: ans,
          explanation: item.explanation || item.Explanation || '',
          marks: item.marks || 1,
        });
      }

      if (mappedQuestions.length > 0) {
        return { rawText, questions: mappedQuestions };
      }
    }
  } catch (e) {
    // Not valid JSON, treat as raw markdown
  }

  // ── 1.5. Try to Parse Markdown Tables ──
  // Tables typically look like: | # | Question | Options | Correct Answer |
  if (rawText.includes('|') && rawText.includes('\n|')) {
    const tableLines = rawText.split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));
    if (tableLines.length >= 3) {
      // Skip header and separator rows
      const dataRows = tableLines.slice(2);
      const tableQuestions: AiQuestion[] = [];

      for (const row of dataRows) {
        const cols = row.split('|').map(c => c.trim()).filter((col, i, arr) => i > 0 && i < arr.length - 1);
        if (cols.length >= 3) {
          // Typically: [index, question, options, answer]
          const qTextCol = cols.length === 3 ? cols[0] : cols[1];
          const optsCol = cols.length === 3 ? cols[1] : cols[2];
          const ansCol = cols.length === 3 ? cols[2] : cols[3];

          const qText = qTextCol.replace(/\*\*/g, '').trim();

          // Split options by <br>, \n, or letter markers
          let opts = optsCol.split(/<br\s*\/?>|\n/gi)
            .map(o => o.trim())
            .filter(Boolean)
            .map(o => o.replace(/^\s*[A-E][.)]\s*/i, '').replace(/\*\*/g, '').trim());

          // If splitting by <br> didn't work well, try finding letter patterns
          if (opts.length < 2) {
            const manualSplit = optsCol.split(/\s*\b[A-E][.)]\s+/i).map(o => o.trim()).filter(Boolean);
            if (manualSplit.length >= 2) opts = manualSplit;
          }

          let ansLetter = ansCol.replace(/\*\*/g, '').trim().toUpperCase();
          // Extract just the letter if it's like "B) " or similar
          const letterMatch = ansLetter.match(/^([A-E])\b/i);
          if (letterMatch) ansLetter = letterMatch[1].toUpperCase();

          let finalAns = ansLetter;
          if (/^[A-E]$/.test(ansLetter)) {
            const idx = ansLetter.charCodeAt(0) - 65;
            if (opts[idx]) finalAns = opts[idx];
          }

          tableQuestions.push({
            topic: fallbackTopic,
            question_text: qText,
            question_type: fallbackType,
            difficulty: fallbackDifficulty,
            options: opts.length >= 2 ? opts : undefined,
            correct_answer: finalAns,
            marks: 1
          });
        }
      }

      if (tableQuestions.length > 0) {
        return { rawText, questions: tableQuestions };
      }
    }
  }

  // ── 2. Split into Blocks ──
  // Clean up: Ensure newlines before markers to make splitting easier
  const activeText = rawText
    .replace(/\*\*\s*Question/gi, '\n**Question')
    .replace(/^Question/gm, '\nQuestion');

  // Split by digit+dot OR **Question
  const splitRegex = /\n(?=(?:\d+[.)])|(?:\*\*Question)|(?:Question\s))/i;
  let blocks = activeText.split(splitRegex).map(b => b.trim()).filter(Boolean);

  // If split didn't result in multiple blocks, but we have text, treat entire text as one block
  if (blocks.length === 0 && rawText.length > 10) {
    blocks = [rawText];
  }

  const questions: AiQuestion[] = [];

  for (const block of blocks) {
    // If block doesn't look like a question (must have "Question" or "?" or options), skip
    if (!block.match(/Question|\?|Option/i)) continue;

    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    // ── Extract Question Text ──
    let questionLine = lines[0]
      .replace(/^\d+[.)\s]+/, '') // Remove "1. "
      .replace(/^\**Question\s*(\(.*\))?\**[:\s-]*/i, '') // Remove "**Question (type)**"
      .replace(/^Q[:\s]*/i, '')
      .replace(/\*\*/g, '')
      .trim();

    // If the first line was just "Question", take the second line as text
    if (!questionLine && lines.length > 1) {
      questionLine = lines[1].replace(/\*\*/g, '').trim();
    }

    const options: string[] = [];
    let correctAnswer = '';
    let explanation = '';

    // ── Extract Details ──
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Options: A) ... B. ...
      const optMatch = line.match(/^[-*\u2022]?\s*(\*{0,2}[A-E]\*{0,2})[.)\s]+(.+)/);
      if (optMatch) {
        const optText = optMatch[2].replace(/\*\*/g, '').trim();
        options.push(optText);
        continue;
      }

      // Answer
      const ansMatch = line.match(/^\*{0,2}(?:Correct\s*)?Answer\*{0,2}[:\s]+(.+)/i);
      if (ansMatch) {
        let ansText = ansMatch[1].replace(/\*\*/g, '').trim();
        // Resolve "A" to full text if possible
        const letterMatch = ansText.match(/^([A-E])\b/i);
        if (letterMatch && options.length > 0) {
          const idx = letterMatch[1].toUpperCase().charCodeAt(0) - 65;
          if (options[idx]) {
            ansText = options[idx];
          }
        }
        correctAnswer = ansText;
        continue;
      }

      // Explanation
      const expMatch = line.match(/^\*{0,2}Explanation\*{0,2}[:\s]+(.+)/i);
      if (expMatch) {
        explanation = expMatch[1].replace(/\*\*/g, '').trim();
        continue;
      }

      // Append to explanation
      if (explanation && !optMatch && !ansMatch && !line.startsWith('**Question')) {
        explanation += ' ' + line.replace(/\*\*/g, '').trim();
      }
    }

    // Fallbacks
    if (!questionLine) continue;

    questions.push({
      topic: fallbackTopic,
      question_text: questionLine,
      question_type: fallbackType,
      difficulty: fallbackDifficulty,
      options: options.length >= 2 ? options : undefined,
      correct_answer: correctAnswer,
      explanation: explanation || undefined,
      marks: 1,
    });
  }

  if (questions.length > 0) {
    return { rawText, questions };
  }

  return { rawText, parseError: 'Could not parse questions. Try ensuring the format is "Question: ... \n A) ... \n Answer: ..."' };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function DifficultyBar({ easy, medium, hard, total }: { easy: number; medium: number; hard: number; total: number }) {
  if (total === 0) return null;
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="bg-emerald-500 transition-all"
        style={{ width: `${(easy / total) * 100}%` }}
      />
      <div
        className="bg-amber-400 transition-all"
        style={{ width: `${(medium / total) * 100}%` }}
      />
      <div
        className="bg-rose-500 transition-all"
        style={{ width: `${(hard / total) * 100}%` }}
      />
    </div>
  );
}

function QuestionTypeIcon({ type }: { type: string }) {
  const map: Record<string, string> = {
    mcq: '◉',
    true_false: '⊘',
    short: '✎',
    long: '≡',
    fill_blank: '▭',
    match: '↔',
    coding: '</>',
  };
  return (
    <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
      {map[type] ?? type}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function QuestionBankManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: questions = [], isLoading } = useQuestions();
  const { data: quizzes = [] } = useMockTestConfigs();
  const createQuestion = useCreateQuestion();
  const deleteQuestion = useDeleteQuestion();
  const createQuiz = useCreateMockTestConfig();

  // ─── Global Controls for Bulk Editor ───
  // These control the "next batch" of questions to be added
  const [globalTopic, setGlobalTopic] = useState('');
  const [globalType, setGlobalType] = useState('mcq');
  const [globalDifficulty, setGlobalDifficulty] = useState('medium');
  const [globalCount, setGlobalCount] = useState(1);
  const [globalMarks, setGlobalMarks] = useState(1);
  const [globalPrompt, setGlobalPrompt] = useState(''); // for AI context

  // ─── Batch Editor State ───
  // Questions currently being edited before saving
  const [batchQuestions, setBatchQuestions] = useState<typeof EMPTY_QUESTION[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // ─── Save Wizard State ───
  const [isSaveWizardOpen, setIsSaveWizardOpen] = useState(false);
  const [saveWizardStep, setSaveWizardStep] = useState(1);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');

  // ─── AI State ───
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [rawInput, setRawInput] = useState(''); // Stores raw text (from AI or User Paste)
  const [showRaw, setShowRaw] = useState(true); // Default to true so user sees the input area

  // ─── Existing Questions Filter State ───
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTopic, setFilterTopic] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ─── Derived Data ───
  const topics = [...new Set(questions.map(q => q.topic))];

  const topicStats = topics.map(topic => {
    const tq = questions.filter(q => q.topic === topic);
    return {
      topic,
      total: tq.length,
      easy: tq.filter(q => q.difficulty === 'easy').length,
      medium: tq.filter(q => q.difficulty === 'medium').length,
      hard: tq.filter(q => q.difficulty === 'hard').length,
    };
  });

  const filteredQuestions = questions.filter(q => {
    const matchesSearch =
      q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = filterTopic === 'all' || q.topic === filterTopic;
    const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
    const matchesType = filterType === 'all' || q.question_type === filterType;
    return matchesSearch && matchesTopic && matchesDifficulty && matchesType;
  });

  const stats = {
    total: questions.length,
    easy: questions.filter(q => q.difficulty === 'easy').length,
    medium: questions.filter(q => q.difficulty === 'medium').length,
    hard: questions.filter(q => q.difficulty === 'hard').length,
    typeBreakdown: QUESTION_TYPES.map(t => ({
      ...t,
      count: questions.filter(q => q.question_type === t.value).length,
    })),
  };

  // ─── Actions ───

  const handleAddBlanks = () => {
    if (!globalTopic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic first.",
        variant: "destructive"
      });
      return;
    }
    const blanks = Array.from({ length: Math.max(1, globalCount) }).map(() => ({
      ...EMPTY_QUESTION,
      topic: globalTopic,
      question_type: globalType,
      difficulty: globalDifficulty,
      marks: globalMarks,
    }));
    setBatchQuestions(prev => [...prev, ...blanks]);
  };

  const handleUpdateQuestion = (index: number, field: string, value: string | number | boolean) => {
    setBatchQuestions(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleUpdateOption = (qIndex: number, optIndex: number, value: string) => {
    setBatchQuestions(prev => {
      const next = [...prev];
      const opts = [...(next[qIndex].options || ['', '', '', ''])];
      opts[optIndex] = value;
      next[qIndex] = { ...next[qIndex], options: opts };
      return next;
    });
  };

  const handleRemoveQuestion = (index: number) => {
    setBatchQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleAiAnalyze = async () => {
    if (!globalTopic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic first to generate questions.",
        variant: "destructive"
      });
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setRawInput('');

    const payload = {
      topic: globalTopic,
      prompt: globalPrompt,
      count: globalCount,
      difficulty: globalDifficulty,
      question_type: globalType,
      existing_count: questions.length,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const rawText = await res.text();

      // Attempt Automatic Parsing & Distribution
      const parsed = parseAiText(rawText, globalTopic, globalType, globalDifficulty);

      if (parsed.questions && parsed.questions.length > 0) {
        // Success! Auto-fill
        const newForms = parsed.questions.map(q => ({
          ...EMPTY_QUESTION,
          topic: globalTopic, // Strictly follow global topic
          question_type: globalType, // Strictly follow global type
          difficulty: globalDifficulty, // Strictly follow global difficulty
          question_text: q.question_text,
          options: (q.options && q.options.length >= 2) ? q.options : ['', '', '', ''],
          correct_answer: q.correct_answer || '',
          explanation: q.explanation || '',
          marks: globalMarks, // Strictly follow global marks
        }));

        setBatchQuestions(prev => [...prev, ...newForms]);

        // Show raw input collapsed initially since it worked
        // But store it in case user wants to see
        setRawInput(rawText);
        setShowRaw(false);

        toast({
          title: "AI Generation Successful",
          description: `Generated and added ${parsed.questions.length} questions.`,
        });

      } else {
        // Fallback: Parsing failed, show raw input for manual check
        setRawInput(rawText);
        setShowRaw(true);
        if (parsed.parseError) {
          setAiError("Could not auto-parse JSON. Please review raw output below.");
        }
        toast({
          title: "Check AI Output",
          description: "Questions were generated but couldn't be automatically mapped. Please check the 'AI Output' section.",
          variant: "default" // Not destructive, just a warning
        });
      }

    } catch (err) {
      setAiError(err instanceof Error ? err.message : String(err));
      toast({
        title: "AI Generation Error",
        description: "Failed to connect to AI service.",
        variant: "destructive"
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleDistribute = () => {
    if (!rawInput.trim()) return;

    const parsed = parseAiText(rawInput, globalTopic, globalType, globalDifficulty);

    if (parsed.questions && parsed.questions.length > 0) {
      const newForms = parsed.questions.map(q => ({
        ...EMPTY_QUESTION,
        topic: globalTopic, // Strictly use global topic
        question_text: q.question_text,
        question_type: globalType, // Strictly use global type
        difficulty: globalDifficulty, // Strictly use global difficulty
        options: (q.options && q.options.length >= 2) ? q.options : ['', '', '', ''],
        correct_answer: q.correct_answer || '',
        explanation: q.explanation || '',
        marks: globalMarks, // Strictly use global marks
      }));
      setBatchQuestions(prev => [...prev, ...newForms]);
      setShowRaw(false);
      toast({
        title: "Questions Distributed",
        description: `Successfully added ${parsed.questions.length} questions to the batch.`
      });
    } else {
      toast({
        title: "Parsing Failed",
        description: "Could not parse questions. Please check the raw text format.",
        variant: "destructive"
      });
    }
  };

  const handleOpenSaveWizard = () => {
    if (batchQuestions.length === 0) return;
    setQuizTitle(globalTopic);
    setQuizDescription('');
    setSaveWizardStep(1);
    setIsSaveWizardOpen(true);
  };

  const handleFinalSave = async () => {
    if (!user?.id || batchQuestions.length === 0) return;
    setIsSaving(true);

    try {
      // 1. Save Questions
      const questionsToSave = batchQuestions
        .filter(q => q.question_text.trim())
        .map(q => {
          // Map UI types to DB constraints if needed
          let type = globalType;
          if (type === 'short') type = 'short_answer';
          if (type === 'long') type = 'long_answer';

          return {
            topic: quizTitle || globalTopic,
            question_text: q.question_text,
            question_type: type,
            difficulty: globalDifficulty,
            options: globalType === 'mcq' ? (Array.isArray(q.options) ? q.options.filter(o => o?.trim()) : q.options) : null,
            correct_answer: q.correct_answer || '',
            explanation: q.explanation || null,
            marks: Number(globalMarks) || 1,
            created_by: user.id,
            approval_status: 'pending',
            is_active: false
          };
        });

      if (questionsToSave.length === 0) throw new Error("No valid questions to save");

      await createQuestion.mutateAsync(questionsToSave);

      // 2. Save Quiz Metadata (as a Mock Test Config)
      await createQuiz.mutateAsync({
        title: quizTitle || globalTopic,
        description: quizDescription || `Batch of ${questionsToSave.length} questions`,
        course_id: null,
        topics: [quizTitle || globalTopic],
        question_count: questionsToSave.length,
        duration_minutes: 30,
        difficulty_mix: { easy: 33, medium: 33, hard: 34 },
        is_active: false, // Wait for admin activation
        created_by: user.id,
      });

      setBatchQuestions([]);
      setGlobalPrompt('');
      setIsSaveWizardOpen(false);
      toast({
        title: "Quiz Batch Submitted",
        description: "Sent to admin for approval and activation."
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save. Check console.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Loading question bank...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-1 py-2 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Question Bank Manager</h2>
          <p className="text-muted-foreground">
            {stats.total} questions · {topics.length} topics
          </p>
        </div>
      </div>

      {/* ─── Bulk Creator Section ─── */}
      <div className="grid gap-6 border rounded-xl p-6 bg-card shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-500" />
              New Question Batch
            </h3>
          </div>

          {/* Global Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Topic <span className="text-destructive">*</span></Label>
              <Input
                placeholder="e.g. React Hooks"
                value={globalTopic}
                onChange={(e) => setGlobalTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={globalType} onValueChange={setGlobalType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={globalDifficulty} onValueChange={setGlobalDifficulty}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">🟢 Easy</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="hard">🔴 Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Each Mark</Label>
              <Input
                type="number"
                min={1}
                value={globalMarks}
                onChange={(e) => setGlobalMarks(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label>Count</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={globalCount}
                onChange={(e) => setGlobalCount(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          {/* AI Prompt */}
          <div className="space-y-2">
            <Label>AI Instructions <span className="text-muted-foreground text-xs">(Optional, for generation)</span></Label>
            <Textarea
              placeholder="e.g. Focus on edge cases and performance optimization..."
              rows={2}
              className="resize-none"
              value={globalPrompt}
              onChange={(e) => setGlobalPrompt(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={handleAddBlanks}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add {globalCount} Blank {globalCount > 1 ? 'Questions' : 'Question'}
            </Button>

            <Button
              onClick={handleAiAnalyze}
              disabled={aiLoading}
              className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
            >
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              Generate with AI
            </Button>
          </div>

          {/* AI Error / Raw Output Display */}
          {/* Show error if any */}
          {aiError && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mt-3 animate-in fade-in">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Generation Error</p>
                <p>{aiError}</p>
              </div>
            </div>
          )}

          {/* Raw Input / AI Output Area */}
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="text-sm font-medium flex items-center gap-1 mb-2 hover:underline"
            >
              {showRaw ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              AI Output / Paste Raw Text
            </button>

            {showRaw && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <Textarea
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  placeholder="Paste AI output or JSON here..."
                  className="font-mono text-xs min-h-[150px]"
                />

                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground w-3/4">
                    Review the text above. Click 'Distribute' to parse and convert it into editable question forms below.
                  </p>
                  <Button onClick={handleDistribute} disabled={!rawInput.trim()} size="sm" className="gap-2">
                    <FileQuestion className="h-4 w-4" />
                    Distribute
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Batch Editor List ─── */}
      {batchQuestions.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">New Batch ({batchQuestions.length})</h3>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setBatchQuestions([])} className="text-destructive hover:text-destructive">
                Discard All
              </Button>
              <Button onClick={handleOpenSaveWizard} disabled={isSaving} className="gap-2 shadow-lg shadow-primary/20">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Finalize Batch
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            {batchQuestions.map((q, idx) => (
              <Card key={idx} className="relative group border-l-4 border-l-primary/50">
                <button
                  onClick={() => handleRemoveQuestion(idx)}
                  className="absolute top-2 right-2 p-2 rounded-full text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                  title="Remove Question"
                >
                  <XCircle className="h-5 w-5" />
                </button>

                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="h-6 text-[10px] px-2">{idx + 1}</Badge>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                        Question Model
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Question */}
                  <div className="space-y-1.5">
                    <Label>Question Text</Label>
                    <Textarea
                      value={q.question_text}
                      onChange={(e) => handleUpdateQuestion(idx, 'question_text', e.target.value)}
                      className="resize-none"
                      placeholder="What is..."
                    />
                  </div>

                  {/* Row 3: Options (if MCQ) & Answer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {q.question_type === 'mcq' && (
                      <div className="space-y-2">
                        <Label>Options</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <span className="text-xs font-mono w-4 text-muted-foreground">{String.fromCharCode(65 + optIdx)}</span>
                              <Input
                                value={opt}
                                onChange={(e) => handleUpdateOption(idx, optIdx, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                className="h-9"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label>Correct Answer</Label>
                        {q.question_type === 'true_false' ? (
                          <Select
                            value={q.correct_answer}
                            onValueChange={(v) => handleUpdateQuestion(idx, 'correct_answer', v)}
                          >
                            <SelectTrigger><SelectValue placeholder="Select True/False" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">True</SelectItem>
                              <SelectItem value="false">False</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={q.correct_answer}
                            onChange={(e) => handleUpdateQuestion(idx, 'correct_answer', e.target.value)}
                            placeholder={q.question_type === 'mcq' ? "Enter option (e.g. MongoDB)" : "Enter answer"}
                          />
                        )}
                        <p className="text-[10px] text-muted-foreground">
                          {q.question_type === 'mcq' ? 'Paste the text of the correct option.' : ''}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <Label>Explanation</Label>
                        <Textarea
                          value={q.explanation}
                          onChange={(e) => handleUpdateQuestion(idx, 'explanation', e.target.value)}
                          rows={2}
                          className="resize-none text-xs"
                          placeholder="Why is this correct?"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6">
            <Button
              variant="outline"
              onClick={handleAddBlanks}
              className="w-full sm:w-auto gap-2 border-dashed border-2 hover:border-primary hover:text-primary transition-all px-6"
            >
              <Plus className="h-4 w-4" />
              Add More Questions
            </Button>

            <Button
              onClick={handleOpenSaveWizard}
              disabled={isSaving}
              size="lg"
              className="w-full sm:w-auto gap-2 text-lg px-10 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-xl shadow-emerald-500/20 border-0"
            >
              <ArrowRight className="h-5 w-5" />
              Finalize & Save Batch
            </Button>
          </div>
          <Separator className="my-8" />
        </div>
      )
      }

      {/* ─── Topic Summary & Filters ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-500" />
              Quiz Portfolio
            </h3>
            <p className="text-sm text-muted-foreground">Select a batch to explore questions and solutions</p>
          </div>
        </div>

        {/* ── Topic Breakdown ── */}
        {topicStats.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topicStats.map((s) => {
              const quizInfo = quizzes.find(q => q.title === s.topic);
              return (
                <Card
                  key={s.topic}
                  className={cn(
                    "hover:shadow-lg transition-all cursor-pointer border-2 relative overflow-hidden group",
                    filterTopic === s.topic ? "border-primary bg-primary/[0.03]" : "border-muted"
                  )}
                  onClick={() => setFilterTopic(filterTopic === s.topic ? 'all' : s.topic)}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{s.topic}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {quizInfo?.description || "Curated batch of questions for practice and assessment."}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-background shadow-sm shrink-0">{s.total}</Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <DifficultyBar {...s} />
                    </div>
                  </CardContent>
                  {filterTopic === s.topic && (
                    <div className="absolute top-0 right-0 p-1">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Questions Table ── */}
      <Card className="shadow-sm">
        <CardHeader className="px-6 pt-5 pb-4 border-b">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-3 text-2xl font-black italic tracking-tighter">
                <Brain className="h-7 w-7 text-primary" />
                EXPLORER
                <Badge variant="secondary" className="ml-1 text-sm font-mono">{filteredQuestions.length}</Badge>
              </CardTitle>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search context..."
                    className="pl-9 h-10 w-full sm:w-64 bg-muted/50 border-transparent focus:bg-background transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="h-10 w-[140px] bg-muted/50 border-transparent capitalize">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {QUESTION_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label.split('(')[0]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                  <SelectTrigger className="h-10 w-[130px] bg-muted/50 border-transparent capitalize">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filterTopic !== 'all' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-lg animate-in fade-in slide-in-from-left-2">
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Filtering by Topic:</span>
                <Badge className="bg-primary hover:bg-primary transition-all px-3 py-1 text-xs">
                  {filterTopic}
                </Badge>
                <div className="flex items-center gap-1.5 ml-2 border-l pl-3">
                  <span className="text-xs text-muted-foreground">{filteredQuestions.length} Items</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterTopic('all')}
                  className="ml-auto h-8 px-3 text-xs font-semibold hover:bg-destructive/10 hover:text-destructive gap-1.5 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  View All
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          {filteredQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                <FileQuestion className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-medium">No questions found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or use the creator above.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredQuestions.map((q, idx) => {
                const isExpanded = expandedId === q.id;
                const opts = Array.isArray(q.options)
                  ? q.options
                  : q.options && typeof q.options === 'object'
                    ? Object.values(q.options as Record<string, string>)
                    : [];

                return (
                  <div
                    key={q.id}
                    className="rounded-xl border bg-card hover:bg-accent/30 transition-colors"
                  >
                    {/* Row */}
                    <div
                      className="flex items-start gap-4 p-4 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    >
                      {/* Index */}
                      <span className="text-xs text-muted-foreground font-mono mt-0.5 w-6 text-right shrink-0">
                        {idx + 1}
                      </span>

                      {/* Content */}
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center gap-2">
                          <QuestionTypeIcon type={q.question_type} />
                          <Badge
                            variant={DIFFICULTY_BADGE_VARIANT[q.difficulty as keyof typeof DIFFICULTY_BADGE_VARIANT] ?? 'secondary'}
                            className="text-[9px] uppercase tracking-tighter h-4 px-1"
                          >
                            {q.difficulty}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 rounded">
                            {q.marks ?? 1} Marks
                          </span>
                        </div>
                        <p className={cn('text-lg font-semibold leading-relaxed tracking-tight text-foreground/90 transition-all', !isExpanded && 'line-clamp-1')}>
                          {q.question_text}
                        </p>
                        {!isExpanded && (
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Category: {q.topic}</span>
                            <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                            <span className="text-[10px] text-primary/70 font-semibold uppercase tracking-tighter">Expand to Preview</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div
                        className="flex items-center gap-1 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setExpandedId(isExpanded ? null : q.id)}
                        >
                          {isExpanded
                            ? <ChevronUp className="h-4 w-4" />
                            : <ChevronDown className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive/10"
                          onClick={() => deleteQuestion.mutate(q.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <div className="px-6 pb-5 pt-0 border-t mt-0 space-y-3">
                        {/* MCQ Options - Student Interface Look */}
                        {opts.length > 0 && (
                          <div className="space-y-2 mt-4">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest pl-1">Options Preview</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {opts.map((opt, i) => {
                                const isCorrect = String(opt).trim() === String(q.correct_answer).trim();
                                return (
                                  <div
                                    key={i}
                                    className={cn(
                                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm border-2 transition-all",
                                      isCorrect
                                        ? "bg-emerald-50 border-emerald-500/30 text-emerald-900 shadow-sm shadow-emerald-500/10"
                                        : "bg-background border-muted hover:border-muted-foreground/20"
                                    )}
                                  >
                                    <div className={cn(
                                      "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border",
                                      isCorrect ? "bg-emerald-500 text-white border-emerald-500" : "bg-muted border-muted-foreground/20"
                                    )}>
                                      {String.fromCharCode(65 + i)}
                                    </div>
                                    <span className="flex-1 font-medium">{opt}</span>
                                    {isCorrect && (
                                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                                        <span>CORRECT</span>
                                        <CheckCircle className="h-4 w-4" />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Explanation & Details */}
                        {(q.explanation || q.correct_answer) && (
                          <div className="mt-4 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/50 space-y-2">
                            <div className="flex items-center gap-2 text-indigo-700">
                              <Sparkles className="h-4 w-4" />
                              <span className="text-xs font-bold uppercase tracking-wider">Solution Insights</span>
                            </div>
                            {opts.length === 0 && q.correct_answer && (
                              <p className="text-sm font-semibold">
                                Correct Answer: <span className="text-emerald-600">{String(q.correct_answer)}</span>
                              </p>
                            )}
                            {q.explanation && (
                              <p className="text-sm text-indigo-900/80 leading-relaxed italic">
                                &ldquo;{q.explanation}&rdquo;
                              </p>
                            )}
                          </div>
                        )}

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="flex items-start gap-2 mt-1 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                              💡 Explanation:
                            </span>
                            <p className="text-xs text-blue-700 dark:text-blue-300">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredQuestions.length > 10 && (
                <p className="text-center text-sm text-muted-foreground pt-2">
                  Showing all {filteredQuestions.length} questions
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Save Wizard Dialog ─── */}
      <Dialog open={isSaveWizardOpen} onOpenChange={setIsSaveWizardOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-hidden p-0 border-0 rounded-[2.5rem] shadow-2xl flex flex-col">
          <div className="flex h-full w-full overflow-hidden min-h-[500px]">
            {/* Steps Left Panel */}
            <div className="w-[28%] bg-muted/30 p-10 border-r space-y-10 relative overflow-hidden flex flex-col">
              {/* Decorative Circle for Left Panel */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-16 -mt-16 blur-2xl" />

              <div className="space-y-8 relative z-10">
                {[
                  { step: 1, label: 'Quiz Info', icon: ClipboardList },
                  { step: 2, label: 'Preview', icon: Brain },
                  { step: 3, label: 'Finalize', icon: CheckCircle },
                ].map((s) => (
                  <div key={s.step} className={cn("flex items-center gap-5 transition-all", saveWizardStep >= s.step ? "text-primary scale-105" : "text-muted-foreground/30")}>
                    <div className={cn("h-11 w-11 rounded-[1.1rem] flex items-center justify-center text-sm font-black border-2 transition-all shadow-sm",
                      saveWizardStep === s.step ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20" :
                        saveWizardStep > s.step ? "border-primary text-primary bg-primary/5" : "border-muted-foreground/10")}>
                      {saveWizardStep > s.step ? <CheckCircle className="h-5 w-5" /> : s.step}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto relative z-10">
                <div className="p-6 rounded-[1.8rem] bg-background/50 backdrop-blur-md border border-white/20 shadow-xl">
                  <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest mb-2 opacity-60">Items in Batch</p>
                  <div className="flex items-end gap-2">
                    <p className="text-4xl font-black leading-none tracking-tighter">{batchQuestions.length}</p>
                    <p className="text-[11px] font-bold text-muted-foreground pb-1">questions</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Right Panel */}
            <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
              <div className="flex-1 p-12 pt-10 overflow-y-auto custom-scrollbar">
                {/* Background Decorative Gradients */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/5 rounded-full -ml-20 -mb-20 blur-[60px] pointer-events-none" />

                <DialogHeader className="mb-8 relative z-10 text-left">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 rotate-6 shadow-lg shadow-primary/5 border border-primary/20 transition-transform hover:rotate-0 duration-500">
                    <ClipboardList className="h-7 w-7 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <DialogTitle className="text-3xl font-black tracking-tight italic leading-none">
                      {saveWizardStep === 1 && "QUIZ INTEL"}
                      {saveWizardStep === 2 && "PREVIEW MODE"}
                      {saveWizardStep === 3 && "EXPORT READY"}
                    </DialogTitle>
                    <DialogDescription className="text-sm font-semibold text-muted-foreground">
                      {saveWizardStep === 1 && "Define the metadata for this learning module."}
                      {saveWizardStep === 2 && "Inspect the batch before committing to deep storage."}
                      {saveWizardStep === 3 && "Verification complete. Proceed to finalize."}
                    </DialogDescription>
                  </div>
                </DialogHeader>

                <div className="flex-1 relative z-10 flex flex-col justify-start pt-2">
                  {saveWizardStep === 1 && (
                    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                      <div className="space-y-3 relative group">
                        <div className="flex items-center justify-between px-1">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary transition-all">Title of Batch</Label>
                          <Badge variant="outline" className="text-[8px] font-black uppercase opacity-40 group-focus-within:opacity-100 transition-opacity rounded-full px-2 py-0">REQUIRED</Badge>
                        </div>
                        <Input
                          placeholder="e.g. Backend Architecture Mastery"
                          className="h-14 rounded-2xl text-lg font-bold border-2 bg-muted/10 focus:bg-background focus:ring-8 focus:ring-primary/5 transition-all px-6 border-muted/50 focus:border-primary shadow-sm"
                          value={quizTitle}
                          onChange={(e) => setQuizTitle(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="space-y-3 relative group">
                        <div className="flex items-center justify-between px-1">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-focus-within:text-primary transition-all">Short Description</Label>
                          <Badge variant="outline" className="text-[8px] font-black uppercase opacity-20 rounded-full px-2 py-0">OPTIONAL</Badge>
                        </div>
                        <Textarea
                          placeholder="Provide context or learning objectives..."
                          rows={5}
                          className="resize-none rounded-2xl border-2 bg-muted/10 focus:bg-background focus:ring-8 focus:ring-primary/5 transition-all text-sm font-medium p-5 border-muted/50 focus:border-primary shadow-sm leading-relaxed"
                          value={quizDescription}
                          onChange={(e) => setQuizDescription(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {saveWizardStep === 2 && (
                    <div className="animate-in slide-in-from-right-8 duration-500 py-4">
                      <Card className="border-2 border-primary/20 shadow-2xl shadow-primary/5 rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-background via-muted/5 to-muted/20">
                        <CardContent className="p-8 space-y-8">
                          <div className="flex items-start justify-between gap-6">
                            <div className="space-y-3">
                              <h4 className="text-2xl font-black tracking-tighter leading-tight text-foreground">{quizTitle || 'Untitled Batch'}</h4>
                              <p className="text-sm text-muted-foreground font-medium leading-relaxed italic pr-4 max-h-[80px] overflow-hidden line-clamp-3">
                                {quizDescription || 'No description provided.'}
                              </p>
                            </div>
                            <Badge className="bg-primary hover:bg-primary h-10 px-5 rounded-[1.2rem] font-black shadow-lg shadow-primary/20 text-[10px] tracking-widest shrink-0">
                              {batchQuestions.length} ITEMS
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-8 border-t border-primary/10 font-black uppercase text-[9px] tracking-[0.25em] text-muted-foreground">
                            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 text-primary">
                              <Brain className="h-5 w-5" />
                              {globalType.toUpperCase()}
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 text-primary">
                              <Layers className="h-5 w-5" />
                              {globalTopic}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {saveWizardStep === 3 && (
                    <div className="flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-700 py-6">
                      <div className="h-32 w-32 rounded-[3rem] bg-emerald-500 flex items-center justify-center shadow-[0_25px_60px_rgba(16,185,129,0.35)] rotate-12 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <CheckCircle className="h-16 w-16 text-white -rotate-12 relative z-10" />
                      </div>
                      <div className="space-y-3 text-center">
                        <h4 className="text-2xl font-black tracking-tighter italic text-foreground uppercase">Storage Ready</h4>
                        <p className="text-sm text-muted-foreground font-medium max-w-[280px] leading-relaxed mx-auto">
                          Your questions will be indexed as <span className="text-foreground font-bold underline decoration-primary decoration-4 underline-offset-4">{quizTitle}</span>.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="mt-auto pt-8 border-t border-muted/50 gap-4 relative z-10 bg-background/80 backdrop-blur-sm -mx-12 px-12 pb-2">
                {saveWizardStep > 1 && (
                  <Button variant="ghost" className="rounded-2xl h-14 font-bold px-8 hover:bg-muted transition-all" onClick={() => setSaveWizardStep(prev => prev - 1)}>Back</Button>
                )}
                {saveWizardStep < 3 ? (
                  <Button
                    className="flex-1 h-14 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] gap-3 bg-foreground hover:bg-foreground/90 text-background shadow-2xl shadow-foreground/20 transition-all hover:scale-[1.02] active:scale-95"
                    onClick={() => {
                      if (saveWizardStep === 1 && !quizTitle.trim()) {
                        toast({ title: "Title Required", description: "Please enter a name for this quiz.", variant: "destructive" });
                        return;
                      }
                      setSaveWizardStep(prev => prev + 1);
                    }}
                  >
                    Continue <ArrowRight className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    className="flex-1 h-14 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] gap-3 bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-95 border-b-4 border-emerald-800"
                    onClick={handleFinalSave}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Layers className="h-5 w-5" />}
                    Confirm & Export
                  </Button>
                )}
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
