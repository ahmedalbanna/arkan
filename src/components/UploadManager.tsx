
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadCloud, FileText, ImageIcon, ExternalLink, Bot, Edit, Eye, X, Wand2, Loader2, BrainCircuit, PlusCircle } from 'lucide-react';
import { PasteTextUploader } from './PasteTextUploader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import { useReportStore } from '@/hooks/useReportStore';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import React, { useState, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ContextFileType } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { processPdfToMarkdown, processImageToText } from '@/services/document-processing-service';
import { analyzeContextApi } from '@/services/context-service';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { Separator } from './ui/separator';
import { PdfPreview } from './PdfPreview';
import { useDropzone } from 'react-dropzone';


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
    const isPdf = isDataUri && item.content.startsWith('data:application/pdf');

    return (
        <Dialog>
            <DialogTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6" title="View Content"><Eye className="h-4 w-4" /></Button></DialogTrigger>
            <DialogContent className="max-w-3xl h-[90vh]">
                <DialogHeader><DialogTitle>{item.fileName}</DialogTitle></DialogHeader>
                <div className="h-full overflow-y-auto">
                    {isImage ? (
                        <Image src={item.content} alt={item.fileName} width={500} height={700} className="mx-auto" />
                    ) : isPdf ? (
                        <PdfPreview fileUri={item.content} />
                    ) : !isDataUri ? (
                        <ScrollArea className="h-full rounded-md border p-4">
                            <ReactMarkdown components={markdownComponents}>{item.content}</ReactMarkdown>
                        </ScrollArea>
                    ) : (
                         <p className="text-muted-foreground p-8 text-center">Preview for this file type is not available. Please process the file to view its content.</p>
                    )}
                </div>
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

function FileDropzone() {
    const { toast } = useToast();
    const { firebaseUser, refetchUser } = useAuth();
    const { addExternalContext } = useReportStore();
    const [isLoading, setIsLoading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!firebaseUser) {
            toast({ title: "Authentication Error", description: "You must be logged in to upload files.", variant: "destructive" });
            return;
        }
        setIsLoading(true);

        const token = await firebaseUser.getIdToken();

        for (const file of acceptedFiles) {
            try {
                let content: string;
                if (file.type.startsWith('image/')) {
                    content = await processImageToText(new FormData().append('file', file) as any, token).then(res => res.text);
                    addExternalContext(`${file.name}.txt`, content, 'context');
                } else if (file.type === 'application/pdf') {
                    content = await processPdfToMarkdown(new FormData().append('file', file) as any, token).then(res => res.markdown);
                    addExternalContext(`${file.name}.md`, content, 'context');
                } else { // Handle .txt, .md, .docx, etc. as plain text
                    content = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (event) => resolve(event.target?.result as string);
                        reader.onerror = reject;
                        reader.readAsText(file);
                    });
                    addExternalContext(file.name, content, 'context');
                }
                toast({ title: "File Processed", description: `Content from ${file.name} has been extracted and added.` });
                refetchUser(); // Update credits
            } catch (err: any) {
                toast({ title: "Processing Failed", description: `Could not process ${file.name}: ${err.message}`, variant: "destructive" });
            }
        }
        setIsLoading(false);
    }, [firebaseUser, toast, addExternalContext, refetchUser]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt'],
            'text/markdown': ['.md'],
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png'],
            'image/webp': ['.webp'],
        }
    });

    return (
        <Card
            {...getRootProps()}
            className={`border-2 border-dashed ${isDragActive ? 'border-primary bg-accent' : 'border-border'
                } hover:border-primary/80 transition-colors cursor-pointer`}
        >
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <input {...getInputProps()} />
                {isLoading ? (
                    <>
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="mt-2 text-sm text-muted-foreground">Processing files...</p>
                    </>
                ) : (
                    <>
                        <UploadCloud className="h-10 w-10 text-muted-foreground" />
                        <p className="mt-2 text-sm font-semibold">
                            {isDragActive ? 'Drop the files here...' : 'Drag & drop files here, or click to select'}
                        </p>
                        <p className="text-xs text-muted-foreground">PDF, DOCX, TXT, MD, Images (Max 5MB)</p>
                    </>
                )}
            </CardContent>
        </Card>
    );
}


export function UploadManager() {
    const { externalContext, removeExternalContext, updateExternalContext, updateExternalContextType } = useReportStore();
    const fileTypes: ContextFileType[] = ['context', 'example', 'question', 'textbook', 'guidelines'];
    
    return (
        <div className="space-y-4">
            <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="upload"><UploadCloud className="mr-2 h-4 w-4"/> Upload Files</TabsTrigger>
                    <TabsTrigger value="text"><FileText className="mr-2 h-4 w-4"/> Paste Text</TabsTrigger>
                    <TabsTrigger value="drive"><GoogleDriveIcon /> Google Drive</TabsTrigger>
                    <TabsTrigger value="dropbox" disabled><DropboxIcon /> Dropbox</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="mt-4">
                    <FileDropzone />
                </TabsContent>
                <TabsContent value="text" className="mt-4">
                    <PasteTextUploader />
                </TabsContent>
                <TabsContent value="drive" className="mt-4">
                    <CloudStorageConnector provider="Google Drive" icon={GoogleDriveIcon} onConnect={() => toast({title: "Coming Soon!", description:"Google Drive integration is not yet available."})} />
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