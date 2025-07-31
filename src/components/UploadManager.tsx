
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadCloud, FileText, Image as ImageIcon, ExternalLink, Bot, Edit, Eye, X } from 'lucide-react';
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
                        <p className="text-muted-foreground">PDF preview is not yet available. Please download the file to view.</p>
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

export function UploadManager() {
    const { externalContext, removeExternalContext, updateExternalContext, updateExternalContextType } = useReportStore();

    const fileTypes: ContextFileType[] = ['context', 'example', 'question', 'textbook', 'guidelines'];

    return (
        <div className="space-y-4">
            <Tabs defaultValue="file" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="file"><UploadCloud className="mr-2 h-4 w-4" /> Upload PDF</TabsTrigger>
                    <TabsTrigger value="text"><FileText className="mr-2 h-4 w-4" /> Paste Text</TabsTrigger>
                    <TabsTrigger value="image"><ImageIcon className="mr-2 h-4 w-4" /> Upload Image</TabsTrigger>
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
        </div>
    );
}
