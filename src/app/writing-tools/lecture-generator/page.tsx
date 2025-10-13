'use client';

import { type CreateLectureUnitInput, type CreateLectureUnitOutput } from '@/ai/schemas/flows';
import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SessionPlanDisplay } from '@/components/writing-tools/SessionPlanDisplay';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { markdownComponents } from '@/lib/markdown-styles';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// A simple component to render markdown content
const MarkdownPreview = ({ content }: { content: string }) => {
    return (
        <div className="prose dark:prose-invert prose-sm max-w-none p-4 bg-muted rounded-md">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default function LectureGeneratorPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<CreateLectureUnitOutput | null>(null);
    const [formData, setFormData] = useState<Omit<CreateLectureUnitInput, 'subTopics'>>({
        lectureTopic: '',
        professorNotes: '',
        sessionDuration: 90,
        numActivities: 3,
        targetAudience: 'University-level students',
    });
    const [subTopicsStr, setSubTopicsStr] = useState('');
    const { toast } = useToast(); // This was likely corrected in a previous step
    const { firebaseUser: user } = useAuth();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'sessionDuration' || name === 'numActivities' ? parseInt(value, 10) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);

        if (!user) {
            toast({
                variant: "destructive",
                title: "Authentication Error",
                description: "You must be logged in to generate a lecture.",
            });
            setIsLoading(false);
            return;
        }

        const subTopics = subTopicsStr.split('\n').filter(topic => topic.trim() !== '');

        if (!formData.lectureTopic || subTopics.length === 0) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please provide a lecture topic and at least one sub-topic.",
            });
            setIsLoading(false);
            return;
        }

        const input: CreateLectureUnitInput = {
            ...formData,
            subTopics,
        };

        try {
            const token = await user.getIdToken();
            const response = await fetch('/api/lecture-generator', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(input),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate lecture.');
            }

            const data: CreateLectureUnitOutput = await response.json();
            setResult(data);
            toast({
                title: "Generation Successful",
                description: "Your lecture and practical session have been created.",
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Generation Failed",
                description: error instanceof Error ? error.message : "An unknown error occurred.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 rounded-lg opacity-50 pointer-events-none"></div>
            <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-float pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-float pointer-events-none" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-purple-500/10 rounded-full blur-lg animate-float pointer-events-none" style={{ animationDelay: '4s' }}></div>

            <div className="relative z-10 container mx-auto p-4 md:p-8">
                <AnimatedContainer animation="fade-in-up" delay={200}>
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2 font-headline">Lecture Generator</h1>
                        <p className="text-muted-foreground">Design a complete lecture unit, from theory to practice.</p>
                    </div>
                </AnimatedContainer>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AnimatedContainer animation="fade-in-up" delay={300}>
                        <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
                            <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                                <CardTitle className="font-headline">Lecture Details</CardTitle>
                                <CardDescription>Provide the core information for your lecture.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="lectureTopic" className="font-headline">Lecture Topic</Label>
                                        <Input
                                            id="lectureTopic"
                                            name="lectureTopic"
                                            placeholder="e.g., Introduction to Quantum Computing"
                                            value={formData.lectureTopic}
                                            onChange={handleInputChange}
                                            required
                                            className="hover:shadow-soft transition-all duration-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subTopics" className="font-headline">Table of Contents (one per line)</Label>
                                        <Textarea
                                            id="subTopics"
                                            name="subTopics"
                                            placeholder="e.g., What is a Qubit?\nSuperposition\nEntanglement"
                                            value={subTopicsStr}
                                            onChange={(e) => setSubTopicsStr(e.target.value)}
                                            required
                                            rows={5}
                                            className="hover:shadow-soft transition-all duration-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="professorNotes" className="font-headline">Professor&apos;s Notes (Optional)</Label>
                                        <Textarea
                                            id="professorNotes"
                                            name="professorNotes"
                                            placeholder="Paste your raw notes, key points, or existing materials here. The AI will structure and expand on them."
                                            value={formData.professorNotes || ''}
                                            onChange={handleInputChange}
                                            rows={8}
                                            className="hover:shadow-soft transition-all duration-200"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="sessionDuration" className="font-headline">Practical Session Duration (minutes)</Label>
                                            <Input
                                                id="sessionDuration"
                                                name="sessionDuration"
                                                type="number"
                                                value={formData.sessionDuration}
                                                onChange={handleInputChange}
                                                required
                                                className="hover:shadow-soft transition-all duration-200"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="numActivities" className="font-headline">Number of Practical Activities</Label>
                                            <Input
                                                id="numActivities"
                                                name="numActivities"
                                                type="number"
                                                value={formData.numActivities}
                                                onChange={handleInputChange}
                                                required
                                                className="hover:shadow-soft transition-all duration-200"
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={isLoading} className="w-full hover:shadow-glow transition-all duration-200" variant="gradient">
                                        {isLoading ? 'Generating...' : 'Generate Lecture Unit (5 Credits)'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </AnimatedContainer>

                    <div className="space-y-8">
                        {isLoading && (
                            <AnimatedContainer animation="fade-in-up" delay={400}>
                                <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
                                    <CardContent className="p-6 flex flex-col items-center justify-center h-64">
                                        <p>Generating your lecture... please wait.</p>
                                    </CardContent>
                                </Card>
                            </AnimatedContainer>
                        )}
                        {result && (
                            <>
                                <AnimatedContainer animation="fade-in-up" delay={500}>
                                    <Card className="shadow-soft hover:shadow-glow transition-all duration-200">
                                        <CardHeader className="bg-gradient-to-r from-primary/5 to-blue-500/5">
                                            <CardTitle className="font-headline">Generated Theoretical Lecture</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <MarkdownPreview content={result.theoreticalLecture.lectureContent} />
                                        </CardContent>
                                    </Card>
                                </AnimatedContainer>
                                <AnimatedContainer animation="fade-in-up" delay={600}>
                                    <SessionPlanDisplay data={result.practicalSession} />
                                </AnimatedContainer>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
