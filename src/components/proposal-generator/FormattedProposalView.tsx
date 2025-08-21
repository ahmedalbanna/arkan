

'use client';

import React from 'react';
import { type AnyProjectProposal, type ProjectProposal, ProjectProposalSchema } from '@/ai/schemas';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { useLocalization } from '@/context/LocalizationContext';
import { cn } from '@/lib/utils';
import remarkGfm from 'remark-gfm';

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

export default function FormattedProposalView({ proposal, currentPage }: FormattedProposalViewProps) {
    const { locale } = useLocalization();
    if (!proposal) return null;

    const renderValue = (value: any, key: string) => {
        if (!hasContent(value)) return null;

        if (typeof value === 'string') {
            if (key === 'startDate' || key === 'endDate') {
                try {
                    return <p><strong>{formatKeyToTitle(key)}:</strong> {format(new Date(value), 'PPP', { locale: locale === 'ar' ? require('date-fns/locale/ar') : require('date-fns/locale/en-US') })}</p>;
                } catch {
                    return <p><strong>{formatKeyToTitle(key)}:</strong> {value}</p>;
                }
            }
            return <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>;
        }
        if (Array.isArray(value)) {
            if (value.every(item => typeof item === 'string')) {
                if (key === 'tags') {
                    return <div className="flex flex-wrap gap-2">{value.map((tag: string) => <Badge key={tag} variant="outline">{tag}</Badge>)}</div>
                }
                return <ul className="list-disc pl-5 space-y-1">{value.map((item, index) => <li key={index}>{item}</li>)}</ul>
            }
            return <div className="space-y-4">{value.map((item, index) => <div key={index} className="p-2 border-l-2 ml-2">{Object.entries(item).map(([k, v]) => <p key={k}><strong>{formatKeyToTitle(k)}:</strong> {String(v)}</p>)}</div>)}</div>;
        }
        if (typeof value === 'object' && value !== null) {
            const content = Object.entries(value).map(([k, v]) => <div key={k} className="mb-2"><strong>{formatKeyToTitle(k)}:</strong> {renderValue(v, k)}</div>);
            // Filter out empty children before wrapping
            return content.some(child => child !== null) ? <div>{content}</div> : null;
        }
        if (typeof value === 'number') {
            const currency = proposal.budget?.currency;
            if (currency) {
                return <p>{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)}</p>;
            }
            return <p>{value.toLocaleString()}</p>;
        }
        return <p>{String(value)}</p>;
    }

    const orderedKeys = Object.keys(ProjectProposalSchema.shape).filter(key => key !== 'title' && key !== 'category');

    // For the title page (currentPage === 0)
    if (currentPage === 0) {
        return (
            <A4Page>
                <div className="flex flex-col items-center justify-center h-full text-center min-h-[297mm]">
                    <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary mb-4">{String(proposal.title)}</h1>
                    <p className="text-lg md:text-xl text-muted-foreground">{String(proposal.category)}</p>
                </div>
            </A4Page>
        )
    }

    const currentPageKey = orderedKeys[currentPage - 1]; // -1 to account for title page

    // If the key is not found (e.g., out of bounds), don't render anything
    if (!currentPageKey) return null;

    const currentPageValue = proposal[currentPageKey as keyof typeof proposal];

    // Exclude title and category from regular pages
    if (currentPageKey === 'title' || currentPageKey === 'category') {
        return null;
    }

    return (
        <div className="relative" dir={locale === 'ar' ? 'rtl' : 'ltr'}>

            <A4Page key={currentPageKey} title={formatKeyToTitle(currentPageKey)}>
                {renderValue(currentPageValue, currentPageKey)}
            </A4Page>
        </div>
    );
}
