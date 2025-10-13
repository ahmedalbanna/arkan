
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { useLocalization } from '@/context/LocalizationContext';
import { type ProjectProposal } from '@/lib/models/proposal';
import { formatKeyToTitle, hasContent } from '@/lib/proposal-utils';
import { cn } from '@/lib/utils';
import React, { useMemo } from 'react';
import { ProposalSection } from './ProposalSection'; // Import the new component

/**
 * This file contains a set of components designed to render a structured
 * ProjectProposal object into a paginated, A4-style view.
 *
 * - FormattedProposalView: The main component that handles pagination.
 */

interface FormattedProposalViewProps {
    proposal: ProjectProposal;
    currentPage: number;
    onUpdate: (key: string, value: any) => void;
}

// A styled container for each "page"
const A4Page = ({ children, title }: { children: React.ReactNode, title?: string }) => (
    <AnimatedContainer animation="fade-in-up" delay={200}>
        <div className={cn(
            "bg-gradient-to-br from-background via-background to-primary/5 backdrop-blur-sm shadow-soft hover:shadow-glow border rounded-lg p-6 md:p-12 mx-auto my-4 w-full md:w-[210mm] transition-all duration-200",
            title ? "min-h-[297mm]" : "" // Only apply min-height if it's a content page
        )}>
            {title && (
                <AnimatedContainer animation="fade-in-up" delay={300}>
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gradient-to-r from-primary/20 to-blue-500/20">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                            <div className="w-4 h-4 bg-white rounded-sm"></div>
                        </div>
                        <h2 className="text-2xl font-bold font-headline text-primary">{title}</h2>
                    </div>
                </AnimatedContainer>
            )}
            <AnimatedContainer animation="fade-in-up" delay={400}>
                <div className="prose dark:prose-invert max-w-none text-sm">{children}</div>
            </AnimatedContainer>
        </div>
    </AnimatedContainer>
);

export default function FormattedProposalView({ proposal, currentPage, onUpdate }: FormattedProposalViewProps) {
    const { locale } = useLocalization();

    const orderedKeys = useMemo(() =>
        Object.keys(proposal).filter(key => key !== 'title' && key !== 'category' && hasContent(proposal[key as keyof typeof proposal])),
        [proposal]
    );

    if (currentPage === 0) {
        return (
            <A4Page>
                <div className="flex flex-col items-center justify-center h-full text-center min-h-[297mm]">
                    <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary mb-4">{proposal.title}</h1>
                    <p className="text-lg md:text-xl text-muted-foreground">{proposal.category}</p>
                </div>
            </A4Page>
        )
    }

    const currentPageKey = orderedKeys[currentPage - 1];
    if (!currentPageKey) return null;

    const currentPageValue = proposal[currentPageKey as keyof typeof proposal];

    return (
        <div className="relative" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <A4Page key={currentPageKey}>
                <ProposalSection
                    sectionKey={currentPageKey}
                    title={formatKeyToTitle(currentPageKey)}
                    content={currentPageValue} // Pass the raw value, not a string
                    onUpdate={onUpdate}
                />
            </A4Page>
        </div>
    );
}
