
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import React from 'react';

interface MarkdownProposalViewProps {
    content: string;
}

const A4Page = ({ children }: { children: React.ReactNode }) => (
    <AnimatedContainer animation="fade-in-up" delay={200}>
        <div className={cn(
            "bg-gradient-to-br from-background via-background to-primary/5 backdrop-blur-sm shadow-soft hover:shadow-glow border rounded-lg p-6 md:p-12 mx-auto my-4 w-full md:w-[210mm] transition-all duration-200",
        )}>
            <AnimatedContainer animation="fade-in-up" delay={300}>
                <Textarea
                    readOnly
                    value={children as string}
                    className="prose dark:prose-invert max-w-none text-sm md:text-base min-h-[297mm] w-full border-none focus-visible:ring-0 p-0 font-mono bg-transparent resize-none"
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
