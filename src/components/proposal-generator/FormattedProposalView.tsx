

'use client';

import React from 'react';
import { type AnyProjectProposal, ProjectProposalSchema } from '@/ai/schemas';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import remarkGfm from 'remark-gfm';
import { useLocalization } from '@/context/LocalizationContext';

interface FormattedProposalViewProps {
    proposal: AnyProjectProposal;
    onUpdate: (path: string, value: any) => void;
    readOnly?: boolean;
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
const A4Page = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-background shadow-lg p-12 md:p-16 mx-auto my-8" style={{ width: '210mm', minHeight: '297mm' }}>
        {children}
    </div>
);

// A component to render individual sections
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-2 mb-6">
        <h2 className="font-semibold text-xl text-primary/90 border-b-2 border-primary/20 pb-2 mb-4 font-headline">{title}</h2>
        <div className="prose dark:prose-invert max-w-none text-sm">{children}</div>
    </div>
);

// Helper to format keys into readable titles
const formatKeyToTitle = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

export default function FormattedProposalView({ proposal }: FormattedProposalViewProps) {
    if (!proposal) return null;

    const renderValue = (value: any, key: string) => {
        if (!hasContent(value)) return null;

        if (typeof value === 'string') {
            if (key === 'startDate' || key === 'endDate') {
                try {
                    return <p><strong>{formatKeyToTitle(key)}:</strong> {format(new Date(value), 'PPP')}</p>;
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
            return <p>{proposal.budget?.currency ? new Intl.NumberFormat('en-US', { style: 'currency', currency: proposal.budget.currency }).format(value) : value.toLocaleString()}</p>;
        }
        return <p>{String(value)}</p>;
    }

    const orderedKeys = Object.keys(ProjectProposalSchema.shape);

    return (
        <div className="space-y-4">
             {/* Main Title Page */}
            <A4Page>
                 <div className="flex flex-col items-center justify-center h-full text-center">
                    <h1 className="text-4xl font-bold font-headline">{proposal.title}</h1>
                    {proposal.category && <p className="text-lg text-muted-foreground mt-4">{proposal.category}</p>}
                </div>
            </A4Page>
            
            {/* Subsequent pages for each section */}
            {orderedKeys.map((key) => {
                const value = proposal[key as keyof typeof proposal];
                if (key === 'title' || key === 'category' || !hasContent(value)) return null;

                return (
                    <A4Page key={key}>
                        <Section title={formatKeyToTitle(key)}>
                           {renderValue(value, key)}
                        </Section>
                    </A4Page>
                )
            })}
        </div>
    );
}

