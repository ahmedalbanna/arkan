'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { markdownComponents } from '@/lib/utils/markdown-styles';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { PdfPreview } from './PdfPreview';

interface FileContentViewerProps {
  fileName: string;
  content: string;
}

export function FileContentViewer({ fileName, content }: FileContentViewerProps) {
  const isDataUri = content.startsWith('data:');
  const isImage = isDataUri && content.startsWith('data:image');
  const isPdf = isDataUri && content.startsWith('data:application/pdf');

  if (isImage) {
    return <Image src={content} alt={fileName} width={500} height={700} className="mx-auto object-contain" />;
  }

  if (isPdf) {
    return <PdfPreview fileUri={content} />;
  }

  if (!isDataUri) {
    return (
      <ScrollArea className="h-full rounded-md border p-4">
        <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
        </div>
      </ScrollArea>
    );
  }

  return (
    <div className="p-8 text-center text-muted-foreground h-full flex flex-col justify-center items-center">
      <p>Preview for this file type is not available.</p>
    </div>
  );
}
