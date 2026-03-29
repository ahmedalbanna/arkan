'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type CreateLectureUnitOutput, type CreateLectureUnitInput } from '@/modules/ai/domain/schemas/lecture-generator';
import { useToast } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SessionPlanDisplay } from '@/modules/ai/adapters/components/writing-tools/SessionPlanDisplay';
import { markdownComponents } from '@/modules/ai-content/adapters/components/report-mode/markdown-styles';
import { apiService } from '@/infrastructure/api/ApiService';

const MarkdownPreview = ({ content }: { content: string }) => <div className="prose dark:prose-invert prose-sm max-w-none p-4 bg-muted rounded-md"><ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{content}</ReactMarkdown></div>;

import { Badge } from '@/components/ui/badge';
import { BookOpen, Presentation, GraduationCap, Clock, ListChecks, Wand2, Download, History, ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export default function LectureGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CreateLectureUnitOutput | null>(null);
  const [formData, setFormData] = useState<Omit<CreateLectureUnitInput, 'subTopics'>>({ lectureTopic: '', professorNotes: '', sessionDuration: 90, numActivities: 3, targetAudience: 'University-level students' });
  const [subTopicsStr, setSubTopicsStr] = useState('');
  const { toast } = useToast();
  const { user: user } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'sessionDuration' || name === 'numActivities' ? parseInt(value, 10) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to generate a lecture.' });
      setIsLoading(false);
      return;
    }

    const subTopics = subTopicsStr.split('\n').filter((topic) => topic.trim() !== '');
    if (!formData.lectureTopic || subTopics.length === 0) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide a lecture topic and at least one sub-topic.' });
      setIsLoading(false);
      return;
    }

    const input: CreateLectureUnitInput = { ...formData, subTopics };

    try {
      const result = await apiService<CreateLectureUnitInput, any>({ endpoint: '/api/writing-tools/lecture-generator', method: 'POST', data: input });
      if (result.isFailure) throw result.error;
      const data = result.getValue();
      setResult(data);
      toast({ title: 'Generation Successful', description: 'Your lecture and practical session have been created.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Generation Failed', description: error instanceof Error ? error.message : 'An unknown error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
              background: 'radial-gradient(circle at 50% -20%, hsl(var(--primary) / 0.08), transparent 50%)'
          }}
      />
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="container relative z-10 mx-auto max-w-[1600px] px-6 py-20 md:py-32">
        <div className="flex flex-col items-center text-center mb-24 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-background">Pedagogy Engine</Badge>
              <div className="h-3 w-px bg-primary/20" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Instructional Synthesis</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter text-foreground leading-[0.9] flex items-center gap-6">
            <Presentation className="w-12 h-12 md:w-16 md:h-16 text-primary animate-pulse" />
            Lecture Generator
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl italic font-serif leading-relaxed opacity-80">
            Design a complete lecture unit, from theoretical foundation to practical evaluation, in a unified academic manifest.
          </p>
        </div>

        <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <header className="px-8 py-10 border-b bg-muted/5 text-center space-y-2">
            <h2 className="text-2xl font-bold font-headline tracking-tight">Lecture Production Manifest</h2>
            <p className="text-xs text-muted-foreground italic max-w-md mx-auto leading-relaxed">Provide the core parameters to architect a cohesive learning experience.</p>
          </header>

          <CardContent className="p-0 flex flex-col lg:flex-row min-h-[850px]">
            {/* Setup Zone (Left) */}
            <div className="lg:w-[450px] border-r border-border/40 bg-muted/5 flex flex-col min-h-0">
                <ScrollArea className="flex-1">
                    <div className="p-8 space-y-10">
                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                        <GraduationCap className="h-3 w-3 text-primary" />
                                        Academic Identity
                                    </Label>
                                    <div className="space-y-2">
                                        <Input
                                            id="lectureTopic"
                                            name="lectureTopic"
                                            value={formData.lectureTopic}
                                            onChange={handleInputChange}
                                            placeholder="Core Subject / Topic"
                                            className="h-10 text-xs bg-background shadow-sm border-none ring-1 ring-border/40 focus-visible:ring-primary/40 rounded-xl"
                                            required
                                        />
                                    </div>
                                </div>

                                <Separator className="bg-border/40" />

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                        <BookOpen className="h-3 w-3 text-primary" />
                                        Structural Blueprint
                                    </Label>
                                    <Textarea
                                        id="subTopics"
                                        name="subTopics"
                                        value={subTopicsStr}
                                        onChange={(e) => setSubTopicsStr(e.target.value)}
                                        rows={5}
                                        placeholder="Table of Contents (one per line)..."
                                        className="text-xs bg-background shadow-inner focus-visible:ring-1 resize-none p-4 leading-relaxed rounded-2xl border-dashed"
                                        required
                                    />
                                </div>

                                <Separator className="bg-border/40" />

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                        <History className="h-3 w-3 text-primary" />
                                        Faculty Context
                                    </Label>
                                    <Textarea
                                        id="professorNotes"
                                        name="professorNotes"
                                        value={formData.professorNotes}
                                        onChange={handleInputChange}
                                        rows={6}
                                        placeholder="Optional professor notes, raw materials, or specific focus areas..."
                                        className="text-xs bg-background shadow-inner focus-visible:ring-1 resize-none p-4 leading-relaxed rounded-2xl border-dashed"
                                    />
                                </div>

                                <Separator className="bg-border/40" />

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ml-1 flex items-center gap-2">
                                        <Clock className="h-3 w-3 text-primary" />
                                        Session Parameters
                                    </Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-bold uppercase text-muted-foreground/40 ml-1">Duration (Min)</Label>
                                            <Input id="sessionDuration" name="sessionDuration" type="number" value={formData.sessionDuration} onChange={handleInputChange} className="h-9 text-xs bg-background ring-1 ring-border/40 border-none rounded-lg" required />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-bold uppercase text-muted-foreground/40 ml-1">Activities</Label>
                                            <Input id="numActivities" name="numActivities" type="number" value={formData.numActivities} onChange={handleInputChange} className="h-9 text-xs bg-background ring-1 ring-border/40 border-none rounded-lg" required />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" disabled={isLoading} className="w-full h-12 font-bold shadow-xl shadow-primary/20 gap-3 rounded-xl active:scale-[0.98] transition-all">
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}
                                Initialize Pedagogy Build
                            </Button>
                        </form>
                    </div>
                </ScrollArea>
            </div>

            {/* Results Canvas (Right) */}
            <div className="flex-1 flex flex-col min-h-0 bg-background relative overflow-hidden">
                <div className="absolute inset-0 bg-[#f8fafc] dark:bg-black/20 pointer-events-none shadow-inner">
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                </div>

                <div className="relative flex-1 flex flex-col min-h-0 p-8 md:p-12">
                    {(isLoading || result) ? (
                        <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-700">
                            <div className="flex justify-between items-center px-1 sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Derived Instructional Manifest</h3>
                                </div>
                            </div>

                            <ScrollArea className="flex-1">
                                <div className="space-y-12 pb-20">
                                    {isLoading ? (
                                        <div className="flex flex-col items-center justify-center py-32 space-y-4 opacity-40">
                                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Executing Instructional Synthesis</p>
                                        </div>
                                    ) : result && (
                                        <>
                                            <div className="space-y-6">
                                                <Label className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60 ml-4">Theoretical Foundation</Label>
                                                <div className="rounded-[32px] border bg-card p-10 md:p-16 shadow-2xl relative group">
                                                    <div className="prose dark:prose-invert max-w-none text-[15px] leading-relaxed font-serif selection:bg-primary/10">
                                                        <ReactMarkdown components={markdownComponents}>{result.theoreticalLecture.lectureContent}</ReactMarkdown>
                                                    </div>
                                                    <div className="mt-16 pt-8 border-t border-border/40 flex justify-between items-center text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                                                        <span>Arkan Academic Manifest</span>
                                                        <span>THEORY NODE</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <Label className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/60 ml-4">Practical Application</Label>
                                                <SessionPlanDisplay data={result.practicalSession} />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-40 space-y-4">
                            <div className="h-20 w-20 rounded-[32px] border-2 border-dashed border-primary/40 flex items-center justify-center">
                                <BookOpen className="h-10 w-10 text-primary/60" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Instructional Canvas Ready</h3>
                                <p className="text-[11px] italic max-w-xs mx-auto leading-relaxed">Define the academic identity and session parameters on the left to begin synthesis.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
