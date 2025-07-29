
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadCloud, FileText, Image as ImageIcon, ExternalLink, Bot } from 'lucide-react';
import { FileUploader } from './FileUploader';
import { PasteTextUploader } from './PasteTextUploader';
import { ImageUploader } from './ImageUploader';
import { Button } from './ui/button';

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


export function UploadManager() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Context Manager</CardTitle>
                <CardDescription>
                    Add context from various sources. Uploaded context will be available in the generation tools when you return to the builder.
                </CardDescription>
            </CardHeader>
            <CardContent>
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
                         <ImageUploader type="context" />
                    </TabsContent>
                    <TabsContent value="drive" className="mt-4">
                        <CloudStorageConnector provider="Google Drive" icon={GoogleDriveIcon} onConnect={() => alert('Connect to Google Drive clicked!')} />
                    </TabsContent>
                    <TabsContent value="dropbox" className="mt-4">
                         <CloudStorageConnector provider="Dropbox" icon={DropboxIcon} onConnect={() => alert('Connect to Dropbox clicked!')} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
