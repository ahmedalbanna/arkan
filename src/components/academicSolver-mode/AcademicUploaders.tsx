
'use client';

import { ExternalContext } from '@/ai/schemas';
import { AnimatedContainer } from '@/components/ui/animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/LocalizationContext';
import { useToast } from '@/hooks';
import { Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { FileUploadZone } from './FileUploadZone';

interface AcademicUploadersProps {
    title: string;
    onContentAdded: (fileName: string, content: string) => void;
    onContentRemoved: (index: number) => void;
    isProcessing: boolean;
    uploadedContent: ExternalContext[];
}

export const AcademicUploaders = ({ title, onContentAdded, onContentRemoved, isProcessing, uploadedContent }: AcademicUploadersProps) => {
    const { toast } = useToast();
    const { t } = useLocalization();
    const [pastedText, setPastedText] = useState('');
    const [pastedTitle, setPastedTitle] = useState('');

    const handleAddPastedText = () => {
        if (!pastedTitle.trim() || !pastedText.trim()) {
            toast({ title: t('builder.academicSolver.toasts.missingInfoToastTitle'), description: t('builder.academicSolver.toasts.missingInfoToastDesc'), variant: 'destructive' });
            return;
        }
        onContentAdded(`${pastedTitle}.md`, pastedText);
        setPastedText('');
        setPastedTitle('');
        toast({ title: t('builder.academicSolver.toasts.contextAddedToastTitle'), description: t('builder.academicSolver.toasts.contextAddedToastDesc').replace('{fileName}', `${pastedTitle}.md`) });
    };

    return (
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <Card className="bg-gradient-to-r from-muted/30 to-primary/5 backdrop-blur-sm shadow-soft hover:shadow-glow transition-all duration-200">
                <CardHeader className="p-4 bg-gradient-to-r from-primary/5 to-blue-500/5">
                    <CardTitle className="text-base font-headline">{title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <Tabs defaultValue="upload">
                        <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-background/50 to-primary/5">
                            <TabsTrigger
                                value="upload"
                                className="hover:shadow-soft transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-600 data-[state=active]:text-white"
                            >
                                {t('builder.academicSolver.uploaders.uploadFile')}
                            </TabsTrigger>
                            <TabsTrigger
                                value="paste"
                                className="hover:shadow-soft transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-600 data-[state=active]:text-white"
                            >
                                {t('builder.academicSolver.uploaders.pasteText')}
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="upload" className="mt-4">
                            <AnimatedContainer animation="fade-in-up" delay={300}>
                                <FileUploadZone onFileAdded={onContentAdded} />
                            </AnimatedContainer>
                        </TabsContent>
                        <TabsContent value="paste" className="mt-4 space-y-2">
                            <AnimatedContainer animation="fade-in-up" delay={300}>
                                <div className="space-y-3">
                                    <Label htmlFor="paste-title" className="font-headline">{t('builder.academicSolver.uploaders.pasteTitle')}</Label>
                                    <Input
                                        id="paste-title"
                                        placeholder={t('builder.academicSolver.uploaders.titlePlaceholder')}
                                        value={pastedTitle}
                                        onChange={e => setPastedTitle(e.target.value)}
                                        className="hover:shadow-soft transition-all duration-200"
                                    />
                                    <Label htmlFor="paste-content" className="font-headline">{t('builder.academicSolver.uploaders.pasteContent')}</Label>
                                    <Textarea
                                        id="paste-content"
                                        placeholder={t('builder.academicSolver.uploaders.contentPlaceholder')}
                                        value={pastedText}
                                        onChange={e => setPastedText(e.target.value)}
                                        rows={5}
                                        className="hover:shadow-soft transition-all duration-200"
                                    />
                                    <Button
                                        onClick={handleAddPastedText}
                                        size="sm"
                                        variant="gradient"
                                        className="hover:shadow-glow transition-all duration-200"
                                    >
                                        {t('builder.academicSolver.uploaders.addButton')}
                                    </Button>
                                </div>
                            </AnimatedContainer>
                        </TabsContent>
                    </Tabs>

                    {isProcessing && (
                        <AnimatedContainer animation="fade-in-up" delay={400}>
                            <div className="flex justify-center mt-2">
                                <div className="p-2 rounded-full bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                                </div>
                            </div>
                        </AnimatedContainer>
                    )}

                    {uploadedContent.length > 0 && (
                        <AnimatedContainer animation="fade-in-up" delay={500}>
                            <div className="mt-4 space-y-2">
                                <h4 className="text-sm font-semibold font-headline">{t('builder.academicSolver.toasts.uploadedContext')}</h4>
                                <ScrollArea className="h-24 w-full rounded-md border bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm shadow-soft p-2">
                                    <div className="space-y-1">
                                        {uploadedContent.map((item, index) => (
                                            <AnimatedContainer key={index} animation="fade-in-up" delay={index * 100}>
                                                <div className="flex items-center justify-between text-sm p-1 rounded-md bg-gradient-to-r from-background/80 to-primary/5 backdrop-blur-sm hover:shadow-soft transition-all duration-200">
                                                    <span className="truncate">{item.fileName}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 hover:shadow-soft transition-all duration-200"
                                                        onClick={() => onContentRemoved(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </AnimatedContainer>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </AnimatedContainer>
                    )}
                </CardContent>
            </Card>
        </AnimatedContainer>
    );
};
