
'use client';

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
    <div className={cn(
        "bg-background shadow-lg p-6 md:p-12 mx-auto my-4 w-full md:w-[210mm]",
        title ? "min-h-[297mm]" : "" // Only apply min-height if it's a content page
    )}>
        {children}
    </div>
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
