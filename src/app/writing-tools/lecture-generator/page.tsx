'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type CreateLectureUnitOutput, type CreateLectureUnitInput } from '@/ai/schemas/lecture-generator';
import { useToast } from '@/hooks';
import { useAuth } from '@/context/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SessionPlanDisplay } from '@/components/writing-tools/SessionPlanDisplay';
import { markdownComponents } from '@/lib/utils/markdown-styles';
import { apiService } from '@/infrastructure/api/ApiService';

const MarkdownPreview = ({ content }: { content: string }) => <div className="prose dark:prose-invert prose-sm max-w-none p-4 bg-muted rounded-md"><ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{content}</ReactMarkdown></div>;

export default function LectureGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CreateLectureUnitOutput | null>(null);
  const [formData, setFormData] = useState<Omit<CreateLectureUnitInput, 'subTopics'>>({ lectureTopic: '', professorNotes: '', sessionDuration: 90, numActivities: 3, targetAudience: 'University-level students' });
  const [subTopicsStr, setSubTopicsStr] = useState('');
  const { toast } = useToast();
  const { firebaseUser: user } = useAuth();

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
      const data = await apiService<CreateLectureUnitInput, CreateLectureUnitOutput>({ endpoint: '/api/actions/create-lecture-unit', method: 'POST', firebaseUser: user, data: input });
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
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2">Lecture Generator</h1>
      <p className="text-muted-foreground mb-6">Design a complete lecture unit, from theory to practice.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card><CardHeader><CardTitle>Lecture Details</CardTitle><CardDescription>Provide the core information for your lecture.</CardDescription></CardHeader><CardContent><form onSubmit={handleSubmit} className="space-y-6"><div className="space-y-2"><Label htmlFor="lectureTopic">Lecture Topic</Label><Input id="lectureTopic" name="lectureTopic" placeholder="e.g., Introduction to Quantum Computing" value={formData.lectureTopic} onChange={handleInputChange} required /></div><div className="space-y-2"><Label htmlFor="subTopics">Table of Contents (one per line)</Label><Textarea id="subTopics" name="subTopics" placeholder="e.g., What is a Qubit?\nSuperposition\nEntanglement" value={subTopicsStr} onChange={(e) => setSubTopicsStr(e.target.value)} required rows={5} /></div><div className="space-y-2"><Label htmlFor="professorNotes">Professor's Notes (Optional)</Label><Textarea id="professorNotes" name="professorNotes" placeholder="Paste your raw notes, key points, or existing materials here. The AI will structure and expand on them." value={formData.professorNotes || ''} onChange={handleInputChange} rows={8} /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="sessionDuration">Practical Session Duration (minutes)</Label><Input id="sessionDuration" name="sessionDuration" type="number" value={formData.sessionDuration} onChange={handleInputChange} required /></div><div className="space-y-2"><Label htmlFor="numActivities">Number of Practical Activities</Label><Input id="numActivities" name="numActivities" type="number" value={formData.numActivities} onChange={handleInputChange} required /></div></div><Button type="submit" disabled={isLoading} className="w-full">{isLoading ? 'Generating...' : 'Generate Lecture Unit (5 Credits)'}</Button></form></CardContent></Card>
        <div className="space-y-8">{isLoading && <Card><CardContent className="p-6 flex flex-col items-center justify-center h-64"><p>Generating your lecture... please wait.</p></CardContent></Card>}{result && <><Card><CardHeader><CardTitle>Generated Theoretical Lecture</CardTitle></CardHeader><CardContent><MarkdownPreview content={result.theoreticalLecture.lectureContent} /></CardContent></Card><SessionPlanDisplay data={result.practicalSession} /></>}</div>
      </div>
    </div>
  );
}
