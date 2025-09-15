
'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-styles';
import { cn } from '@/lib/utils';
import remarkGfm from 'remark-gfm';
import { Textarea } from '@/components/ui/textarea';

interface MarkdownProposalViewProps {
    content: string;
}

const A4Page = ({ children }: { children: React.ReactNode }) => (
    <div className={cn(
        "bg-background shadow-lg p-6 md:p-12 mx-auto my-4 w-full md:w-[210mm]",
    )}>
        <Textarea 
            readOnly 
            value={children as string} 
            className="prose dark:prose-invert max-w-none text-sm md:text-base min-h-[297mm] w-full border-none focus-visible:ring-0 p-0 font-mono"
        />
    </div>
);

export default function MarkdownProposalView({ content }: MarkdownProposalViewProps) {
    return (
        <A4Page>
            {content}
        </A4Page>
    );
}
