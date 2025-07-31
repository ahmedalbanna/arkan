
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadCloud, FileText, Image as ImageIcon, ExternalLink, Bot, Edit, Eye, X, Wand2, Loader2, BrainCircuit, PlusCircle } from 'lucide-react';
import { FileUploader } from './FileUploader';
import { PasteTextUploader } from './PasteTextUploader';
import { ImageUploader } from './ImageUploader';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import { useReportStore } from '@/hooks/useReportStore';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ContextFileType } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { toast, useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { processPdfToMarkdown, processImageToText } from '@/services/document-processing-service';
import { analyzeContextApi } from '@/services/context-service';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { Separator } from './ui/separator';

const ReactJson = dynamic(() => import('@microlink/react-json-view'), { ssr: false });

const GoogleDriveIcon = () => (
    <svg className="h-4 w-4 mr-2" viewBox="0 0 48 48">
        <path fill="#4CAF50" d="M32.2,27.9l-7.4,12.8l-7.4-12.8L24.8,4.1z"></path>
        <path fill="#1E88E5" d="M9.8,28.9l-5.7,9.9c-0.6,1-0.2,2.3,0.8,2.8L9.2,44c1,0.6,2.3,0.2,2.8-0.8l5.7-9.9L9.8,28.9z"></path>
        <path fill="#FFC107" d="M43.9,41.7c1-0.6,1.4-1.8,0.8-2.8l-5.7-9.9l-7.9,4.4l5.7,9.9C37.4,43.8,38.7,44.2,39.6,43.7L43.9,41.7z"></path>
    </svg>
)

const DropboxIcon = () => (
    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4.305L7.05 7.695 12 11.085l-4.95 3.39 4.95 3.39-4.95 3.39L2.1 17.865l4.95-3.39L2.1 11.085 12 4.305zm0 0L16.95 7.695 12 11.085l4.95 3.39-4.95 3.39 4.95 3.39L21.9 17.865l-4.95-3.39L21.9 11.085 12 4.305z"/>
    </svg>
)

const CloudStorageConnector = ({ provider, icon: Icon, onConnect }: { provider: string, icon: React.ElementType, onConnect: () => void }) => (
    <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <Icon />
            <p className="mt-4 font-semibold">Connect to {provider}</p>
            <p className="mt-2 text-sm text-muted-foreground">
                Import files directly from your {provider} account to use as context.
            </p>
            <Button className="mt-4" onClick={onConnect}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Connect to {provider}
            </Button>
        </CardContent>
    </Card>
);

function ViewContextDialog({ item }: { item: { fileName: string, content: string }}) {
    const isDataUri = item.content.startsWith('data:');
    const isImage = isDataUri && item.content.startsWith('data:image');
    
    return (
        <Dialog>
            <DialogTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6" title="View Content"><Eye className="h-4 w-4" /></Button></DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader><DialogTitle>{item.fileName}</DialogTitle></DialogHeader>
                <ScrollArea className="h-[60vh] rounded-md border p-4">
                    {isImage ? (
                        <Image src={item.content} alt={item.fileName} width={500} height={700} className="mx-auto" />
                    ) : isDataUri ? (
                        <p className="text-muted-foreground">PDF preview is not yet available. Please process the file to view its content or download it.</p>
                    ) : (
                        <ReactMarkdown components={markdownComponents}>{item.content}</ReactMarkdown>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

function EditContextDialog({ item, onSave }: { item: { fileName: string, content: string }, onSave: (newContent: string) => void }) {
    const [content, setContent] = useState(item.content);
    const [isOpen, setIsOpen] = useState(false);
    
    // Disable editing for data URIs
    const isEditable = !item.content.startsWith('data:');

    const handleSave = () => {
        onSave(content);
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" title="Edit Content" disabled={!isEditable}>
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader><DialogTitle>Edit: {item.fileName}</DialogTitle></DialogHeader>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={20} className="my-4" />
                <div className="flex justify-end">
                    <Button onClick={handleSave}>Save Changes</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function dataURLtoFile(dataurl: string, filename: string): File {
    var arr = dataurl.split(','),
        mimeMatch = arr[0].match(/:(.*?);/),
        mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream',
        bstr = atob(arr[1]), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
        
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, {type:mime});
}

function AnalystAgent() {
    const { externalContext, addExternalContext } = useReportStore();
    const { firebaseUser, refetchUser } = useAuth();
    const { toast } = useToast();
    const [prompt, setPrompt] = useState('');
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const { resolvedTheme } = useTheme();

    const mutation = useMutation({
        mutationFn: analyzeContextApi,
        onSuccess: (data) => {
            setAnalysisResult(data);
            refetchUser(); // To update credits
            toast({ title: 'Analysis Complete', description: 'The AI has analyzed the context and generated structured data.' });
        },
        onError: (error: Error) => {
            toast({ title: 'Analysis Failed', description: error.message, variant: 'destructive' });
        }
    });
    
    const handleSaveAnalysis = () => {
        if (!analysisResult || !prompt) return;

        // Create a descriptive filename from the prompt
        const fileName = prompt.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 50) + '.json';

        // Convert the data object to a formatted JSON string
        const fileContent = JSON.stringify(analysisResult.data, null, 2);

        // Add it to the context store
        addExternalContext(fileName, fileContent, 'context');

        toast({
            title: "Analysis Saved",
            description: `"${fileName}" has been added to your context files.`,
        });
    };

    const handleRunAnalysis = async () => {
        if (!prompt.trim()) {
            toast({ title: 'Prompt Required', description: 'Please enter a prompt for the analyst agent.', variant: 'destructive' });
            return;
        }
        if (externalContext.length === 0) {
            toast({ title: 'Context Required', description: 'Please upload at least one context file to analyze.', variant: 'destructive' });
            return;
        }
        if (!firebaseUser) return;
        const token = await firebaseUser.getIdToken();
        mutation.mutate({ prompt, contextFiles: externalContext, token });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-primary" /> Analyst Agent</CardTitle>
                <CardDescription>Ask a question or give an instruction based on the managed context files. The AI will generate a structured JSON response.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea 
                    placeholder="e.g., 'List all project stakeholders and their main interests.'"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    disabled={mutation.isPending}
                />
                <Button onClick={handleRunAnalysis} disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Run Analysis
                </Button>
                {analysisResult && (
                    <div className="space-y-4 pt-4 border-t">
                        <div className="space-y-2">
                             <h4 className="font-semibold text-sm">Generated Schema (Zod)</h4>
                             <pre className="p-2 border rounded-md bg-muted text-xs overflow-x-auto"><code>{analysisResult.schema}</code></pre>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Generated Data (JSON)</h4>
                             <div className="p-2 border rounded-md bg-muted text-xs">
                                <ReactJson 
                                    src={analysisResult.data} 
                                    theme={resolvedTheme === 'dark' ? 'monokai' : 'rjv-default'} 
                                    collapsed={false}
                                    displayDataTypes={false}
                                    name={false}
                                />
                             </div>
                        </div>
                         <div className="mt-4">
                            <Button
                                variant="secondary"
                                onClick={handleSaveAnalysis}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Save Result as Context File
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function UploadManager() {
    const { externalContext, removeExternalContext, updateExternalContext, updateExternalContextType } = useReportStore();
    const { firebaseUser, refetchUser } = useAuth();
    const [processingFileIndex, setProcessingFileIndex] = useState<number | null>(null);
    const { toast } = useToast();

    const fileTypes: ContextFileType[] = ['context', 'example', 'question', 'textbook', 'guidelines'];

    const handleProcessFile = async (index: number) => {
        const fileToProcess = externalContext[index];
        if (!fileToProcess || !fileToProcess.content.startsWith('data:') || !firebaseUser) return;

        setProcessingFileIndex(index);
        
        try {
            const token = await firebaseUser.getIdToken();
            const file = dataURLtoFile(fileToProcess.content, fileToProcess.fileName);
            const formData = new FormData();
            formData.append('file', file);

            let result;
            if (file.type.startsWith('image/')) {
                result = await processImageToText(formData, token);
                updateExternalContext(index, result.text);
            } else if (file.type === 'application/pdf') {
                result = await processPdfToMarkdown(formData, token);
                updateExternalContext(index, result.markdown);
            } else {
                throw new Error("Unsupported file type for processing.");
            }
            refetchUser(); // To update credits
            toast({ title: "File Processed", description: `Content from ${fileToProcess.fileName} has been extracted.` });
        } catch (error: any) {
             toast({ title: "Processing Failed", description: error.message, variant: "destructive" });
        } finally {
            setProcessingFileIndex(null);
        }
    };


    return (
        <div className="space-y-4">
            <Tabs defaultValue="file" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="file"><UploadCloud className="mr-2 h-4 w-4"/> Upload PDF</TabsTrigger>
                    <TabsTrigger value="text"><FileText className="mr-2 h-4 w-4"/> Paste Text</TabsTrigger>
                    <TabsTrigger value="image"><ImageIcon className="mr-2 h-4 w-4"/> Upload Image</TabsTrigger>
                    <TabsTrigger value="drive"><GoogleDriveIcon /> Google Drive</TabsTrigger>
                    <TabsTrigger value="dropbox" disabled><DropboxIcon /> Dropbox</TabsTrigger>
                </TabsList>
                <TabsContent value="file" className="mt-4">
                    <FileUploader type="context" />
                </TabsContent>
                <TabsContent value="text" className="mt-4">
                    <PasteTextUploader />
                </TabsContent>
                <TabsContent value="image" className="mt-4">
                    <ImageUploader type={'context'} />
                </TabsContent>
                <TabsContent value="drive" className="mt-4">
                    <CloudStorageConnector provider="Google Drive" icon={GoogleDriveIcon} onConnect={() => alert('Connect to Google Drive clicked!')} />
                </TabsContent>
                <TabsContent value="dropbox" className="mt-4">
                    <CloudStorageConnector provider="Dropbox" icon={DropboxIcon} onConnect={() => alert('Connect to Dropbox clicked!')} />
                </TabsContent>
            </Tabs>
            
            {externalContext && externalContext.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">MANAGED CONTEXT</h3>
                    <Card>
                        <CardContent className="p-2">
                            <ul className="space-y-1 list-none p-0">
                                {externalContext.map((item, index) => (
                                    <li key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                        <div className="flex items-center gap-2 truncate">
                                            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            <span className="truncate font-medium text-sm">{item.fileName}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Select value={item.type} onValueChange={(value: ContextFileType) => updateExternalContextType(index, value)}>
                                                <SelectTrigger className={cn("text-xs h-7 w-[120px]", {
                                                    'bg-blue-100 text-blue-800 border-blue-200': item.type === 'context',
                                                    'bg-green-100 text-green-800 border-green-200': item.type === 'example',
                                                    'bg-yellow-100 text-yellow-800 border-yellow-200': item.type === 'question',
                                                    'bg-purple-100 text-purple-800 border-purple-200': item.type === 'textbook',
                                                    'bg-gray-100 text-gray-800 border-gray-200': item.type === 'guidelines',
                                                })}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {fileTypes.map(type => (
                                                        <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {item.content.startsWith('data:') && (
                                                <Button size="sm" variant="outline" className="h-7 ml-2" onClick={() => handleProcessFile(index)} disabled={processingFileIndex === index}>
                                                    {processingFileIndex === index ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                                    Process with AI
                                                </Button>
                                            )}
                                            <ViewContextDialog item={item} />
                                            <EditContextDialog item={item} onSave={(newContent) => updateExternalContext(index, newContent)} />
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeExternalContext(index)}><X className="h-4 w-4 text-destructive" /></Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            )}
            <Separator />
            <AnalystAgent />
        </div>
    );
}
