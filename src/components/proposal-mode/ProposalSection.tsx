
'use client';

import React from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { formatKeyToTitle, hasContent } from '@/lib/proposal-utils';
import { MarkdownViewer } from '../shared/MarkdownViewer';

// --- Start of new ValueRenderer logic ---

const ValueRenderer = ({ data }: { data: any }) => {
    if (!hasContent(data)) {
        return null;
    }

    // If it's a string, render it as Markdown
    if (typeof data === 'string') {
        return <MarkdownViewer content={data} />;
    }

    // If it's an array, render it as a list
    if (Array.isArray(data)) {
        return (
            <ul className="list-disc space-y-2 pl-5">
                {data.map((item, index) => (
                    <li key={index}>
                        <ValueRenderer data={item} />
                    </li>
                ))}
            </ul>
        );
    }

    // If it's an object, render its key-value pairs
    if (typeof data === 'object' && data !== null) {
        return (
            <div className="space-y-4">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key}>
                        <h4 className="font-semibold">{formatKeyToTitle(key)}</h4>
                        <div className="pl-4 text-muted-foreground">
                            <ValueRenderer data={value} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Fallback for other data types (numbers, booleans)
    return <span>{String(data)}</span>;
};

// --- End of new ValueRenderer logic ---

interface ProposalSectionProps {
    sectionKey: string;
    title: string;
    content: any; // Accept any type of content
    onUpdate: (key: string, value: any) => void;
}

export const ProposalSection = ({ sectionKey, title, content }: ProposalSectionProps) => {
    const { t } = useLocalization();

    const wordCount = typeof content === 'string' ? content.split(/\s+/).filter(Boolean).length : 0;
    const charCount = typeof content === 'string' ? content.length : 0;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg md:text-xl text-primary/90 font-headline">
                    {title}
                </h2>
                {/* The toolbar is now part of the RichTextEditor's bubble menu */}
            </div>
             {typeof content === 'string' && (
                <div className="space-y-1 text-xs text-muted-foreground">
                    <span>{wordCount} {t('builder.Section.words')}</span>
                    <span className="mx-2">|</span>
                    <span>{charCount} {t('builder.Section.characters')}</span>
                </div>
            )}

            <div className="group relative space-y-4 mt-4">
                {/* Use the new ValueRenderer to display the content */}
                <ValueRenderer data={content} />
            </div>
        </div>
    );
};
