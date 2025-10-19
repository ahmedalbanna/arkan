
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { cn } from '@/lib/utils';
import React from 'react';
import RichTextEditor from '../ui/RichTextEditor';

interface MarkdownProposalViewProps {
    content: string;
}

const A4Page = ({ children }: { children: React.ReactNode }) => (
    <AnimatedContainer animation="fade-in-up" delay={200}>
        <div className={cn(
            "bg-gradient-to-br from-background via-background to-primary/5 backdrop-blur-sm shadow-soft hover:shadow-glow border rounded-lg p-6 md:p-12 mx-auto my-4 w-full md:w-[210mm] transition-all duration-200",
        )}>
            <AnimatedContainer animation="fade-in-up" delay={300}>
                <RichTextEditor
                    content={children as string}
                    onChange={() => {}}
                    onAiAction={() => {}}
                    onReadAloud={() => {}}
                    isProcessingAi={false}
                    isReadingAloud={false}
                />
            </AnimatedContainer>
        </div>
    </AnimatedContainer>
);

export default function MarkdownProposalView({ content }: MarkdownProposalViewProps) {
    return (
        <A4Page>
            {content}
        </A4Page>
    );
}
