'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-styles';
import { cn } from '@/lib/utils';
import remarkGfm from 'remark-gfm';

interface MarkdownProposalViewProps {
    content: string;
}

// A styled container for each "page"
const A4Page = ({ children }: { children: React.ReactNode }) => (
    <div className={cn(
        "bg-background shadow-lg p-6 md:p-12 mx-auto my-4 w-full md:w-[210mm]",
    )}>
        <div className="prose dark:prose-invert max-w-none text-sm md:text-base">{children}</div>
    </div>
);

export default function MarkdownProposalView({ content }: MarkdownProposalViewProps) {
    return (
        <A4Page>
            <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </A4Page>
    );
}
