
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadCloud, FileText, Image as ImageIcon } from 'lucide-react';
import { FileUploader } from './FileUploader';
import { PasteTextUploader } from './PasteTextUploader';
import { ImageUploader } from './ImageUploader';

export function UploadManager() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Context Manager</CardTitle>
                <CardDescription>
                    Add context from various sources. Uploaded context will be available in the "Context" tab of the generation tools.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="file" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="file"><UploadCloud className="mr-2 h-4 w-4" /> Upload PDF</TabsTrigger>
                        <TabsTrigger value="text"><FileText className="mr-2 h-4 w-4" /> Paste Text</TabsTrigger>
                        <TabsTrigger value="image"><ImageIcon className="mr-2 h-4 w-4" /> Upload Image</TabsTrigger>
                    </TabsList>
                    <TabsContent value="file" className="mt-4">
                       <FileUploader />
                    </TabsContent>
                     <TabsContent value="text" className="mt-4">
                        <PasteTextUploader />
                    </TabsContent>
                    <TabsContent value="image" className="mt-4">
                         <ImageUploader />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
