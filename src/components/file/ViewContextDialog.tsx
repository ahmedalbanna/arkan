
'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalContext } from '@/lib/types';
import { markdownComponents } from '@/lib/utils/markdown-styles';
import { Eye } from 'lucide-react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { PdfPreview } from './PdfPreview';


export function ViewContextDialog({ item }: { item: { fileName: string, content: string, type: ExternalContext['type'] } }) {
    const isDataUri = item.content.startsWith('data:');
    const isImage = isDataUri && item.content.startsWith('data:image');
    const isPdf = isDataUri && item.content.startsWith('data:application/pdf');

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" title="View Content">
                    <Eye className="h-4 w-4" />
                </Button>
            </DialogTrigger>
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
