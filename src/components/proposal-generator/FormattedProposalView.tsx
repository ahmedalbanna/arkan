

'use client';

import React, { useMemo } from 'react';
import { type ProjectProposal, ProjectProposalSchema } from '@/ai/schemas';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-styles';
import { useLocalization } from '@/context/LocalizationContext';
import { cn } from '@/lib/utils';
import remarkGfm from 'remark-gfm';

/**
 * This file contains a set of components designed to render a structured
 * ProjectProposal object into a paginated, A4-style view.
 *
 * - FormattedProposalView: The main component that handles pagination.
 * - ValueRenderer: A recursive component that dispatches rendering to the appropriate sub-component based on data type.
 * - ObjectRenderer & ArrayRenderer: Specialized components for rendering complex data structures.
 */

interface FormattedProposalViewProps {
    proposal: ProjectProposal;
    currentPage: number;
}

// Helper to check if a value is considered to have content
const hasContent = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (typeof value === 'object' && Object.keys(value).length === 0) return false;
    return true;
};

// A styled container for each "page"
const A4Page = ({ children, title }: { children: React.ReactNode, title?: string }) => (
    <div className={cn(
        "bg-background shadow-lg p-6 md:p-12 mx-auto my-4 w-full md:w-[210mm]",
        title ? "min-h-[297mm]" : "" // Only apply min-height if it's a content page
    )}>
        {title && <h2 className="font-semibold text-lg md:text-xl text-primary/90 border-b-2 border-primary/20 pb-2 mb-4 font-headline">{title}</h2>}
        <div className="prose dark:prose-invert max-w-none text-sm md:text-base">{children}</div>
    </div>
);


// Helper to format keys into readable titles
const formatKeyToTitle = (key: string): string => {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
}

const ObjectRenderer = React.memo(({ data }: { data: Record<string, any> }) => {
    const content = Object.entries(data).map(([key, value]) => {
        if (!hasContent(value)) return null;

        return (
            <div key={key} className="mb-4">
                <strong className="block font-semibold text-foreground/80">{formatKeyToTitle(key)}:</strong>
                <div className="pl-2 mt-1">
                    <ValueRenderer value={value} />
                </div>
            </div>
        );
    }).filter(Boolean);

    return content.length > 0 ? <>{content}</> : null;
});
ObjectRenderer.displayName = 'ObjectRenderer';


const ArrayRenderer = React.memo(({ items }: { items: any[] }) => {
    if (items.every(item => typeof item === 'string')) {
        return (
            <ul className="list-disc pl-5 space-y-1">
                {items.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <div key={index} className="p-3 my-2 border-l-4 border-muted-foreground/20 rounded-r-md bg-muted/20">
                    <ValueRenderer value={item} />
                </div>
            ))}
        </div>
    );
});
ArrayRenderer.displayName = 'ArrayRenderer';


const ValueRenderer = React.memo(({ value }: { value: any }) => {
    if (!hasContent(value)) return null;
    if (Array.isArray(value)) return <ArrayRenderer items={value} />;
    if (typeof value === 'object' && value !== null) return <ObjectRenderer data={value} />;
    if (typeof value === 'string') return <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>;
    return <>{String(value)}</>;
});
ValueRenderer.displayName = 'ValueRenderer';

export default function FormattedProposalView({ proposal, currentPage }: FormattedProposalViewProps) {
    const { locale } = useLocalization();

    const orderedKeys = useMemo(() =>
        Object.keys(ProjectProposalSchema.shape).filter(key => key !== 'title' && key !== 'category'),
        []
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

            <A4Page key={currentPageKey} title={formatKeyToTitle(currentPageKey)}>
                <ValueRenderer value={currentPageValue} />
            </A4Page>
        </div>
    );
}
