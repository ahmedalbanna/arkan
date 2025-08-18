

'use client';

import React from 'react';
import { type AnyProjectProposal, ProjectProposalSchema } from '@/ai/schemas';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import remarkGfm from 'remark-gfm';
import { useLocalization } from '@/context/LocalizationContext';
import { z } from 'zod';

interface FormattedProposalViewProps {
    proposal: AnyProjectProposal;
    onUpdate: (path: string, value: any) => void;
    readOnly?: boolean;
}

const Section = ({ title, children, hasContent }: { title: string; children: React.ReactNode, hasContent: boolean }) => {
    if (!hasContent) return null;
    
    return (
        <div className="space-y-2">
            <h3 className="font-semibold text-lg text-primary/90">{title}</h3>
            <div className="pl-2 border-l-2 border-primary/20 prose dark:prose-invert max-w-none text-sm">{children}</div>
        </div>
    );
};

// Helper to format keys into readable titles
const formatKeyToTitle = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1') // Add space before uppercase letters
    .replace(/_/g, ' ')       // Replace underscores with spaces
    .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
}


export default function FormattedProposalView({ proposal }: FormattedProposalViewProps) {
    const { t } = useLocalization();
    if (!proposal) return null;

    const renderValue = (value: any, key: string) => {
        if (typeof value === 'string') {
            if (key === 'startDate' || key === 'endDate') {
                try {
                    return <p>{format(new Date(value), 'PPP')}</p>;
                } catch {
                    return <p>{value}</p>;
                }
            }
            return <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>;
        }
        if (Array.isArray(value)) {
            // Handle array of strings (like expected_outcome, tags)
            if (value.every(item => typeof item === 'string')) {
                if (key === 'tags') {
                    return <div className="flex flex-wrap gap-2">{value.map((tag: string) => <Badge key={tag} variant="outline">{tag}</Badge>)}</div>
                }
                return <ul className="list-disc pl-5 space-y-1">{value.map((item, index) => <li key={index}>{item}</li>)}</ul>
            }
            // Handle array of objects (like phases, budget breakdown, stakeholders, risks)
            return <div className="space-y-4">{value.map((item, index) => <div key={index}>{Object.entries(item).map(([k, v]) => <p key={k}><strong>{formatKeyToTitle(k)}:</strong> {String(v)}</p>)}</div>)}</div>;
        }
        if (typeof value === 'object' && value !== null) {
            return <div className="space-y-2">{Object.entries(value).map(([k, v]) => <div key={k}>{renderValue(v, k)}</div>)}</div>;
        }
        if (typeof value === 'number') {
            return <p>{proposal.budget?.currency ? new Intl.NumberFormat('en-US', { style: 'currency', currency: proposal.budget.currency }).format(value) : value.toLocaleString()}</p>;
        }
        return <p>{String(value)}</p>;
    }

    const orderedKeys = Object.keys(ProjectProposalSchema.shape);

    return (
        <div className="space-y-6">
            {orderedKeys.map((key, index) => {
                const value = proposal[key];
                const hasContent = value !== null && value !== undefined && (typeof value !== 'string' || value.trim() !== '') && (!Array.isArray(value) || value.length > 0);
                
                // Skip rendering title and category in the main loop as they are in the header
                if (key === 'title' || key === 'category') return null;

                return (
                     <React.Fragment key={key}>
                        <Section title={formatKeyToTitle(key)} hasContent={hasContent}>
                           {renderValue(value, key)}
                        </Section>
                        {index < orderedKeys.length - 1 && <Separator />}
                     </React.Fragment>
                )
            })}
        </div>
    );
}

