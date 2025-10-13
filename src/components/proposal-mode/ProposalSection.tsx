
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { useLocalization } from '@/context/LocalizationContext';
import {
    FlexibleContent,
    SafeUpdateFunction
} from '@/core/types/flexible-content-types';
import { formatKeyToTitle, hasContent } from '@/lib/proposal-utils';
import { FileText } from 'lucide-react';
import { MarkdownViewer } from '../shared/MarkdownViewer';

// --- Start of new ValueRenderer logic ---

const ValueRenderer = ({ data }: { data: FlexibleContent }) => {
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
    content: FlexibleContent; // Accept flexible content types
    onUpdate: SafeUpdateFunction;
}

export const ProposalSection = ({ sectionKey, title, content }: ProposalSectionProps) => {
    const { t } = useLocalization();

    const wordCount = typeof content === 'string' && content ? content.split(/\s+/).filter(Boolean).length : 0;
    const charCount = typeof content === 'string' && content ? content.length : 0;

    return (
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <div className="space-y-6">
                <AnimatedContainer animation="fade-in-up" delay={300}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                                <FileText className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="font-semibold text-lg md:text-xl text-primary/90 font-headline">
                                {title}
                            </h2>
                        </div>
                        {typeof content === 'string' && (
                            <Badge variant="secondary" className="shadow-soft">
                                {wordCount} {t('builder.Section.words')} • {charCount} {t('builder.Section.characters')}
                            </Badge>
                        )}
                    </div>
                </AnimatedContainer>

                <AnimatedContainer animation="fade-in-up" delay={400}>
                    <div className="group relative space-y-4">
                        <div className="rounded-lg border bg-gradient-to-r from-background/50 to-primary/5 backdrop-blur-sm shadow-soft hover:shadow-glow transition-all duration-200 p-4">
                            {/* Use the new ValueRenderer to display the content */}
                            <ValueRenderer data={content} />
                        </div>
                    </div>
                </AnimatedContainer>
            </div>
        </AnimatedContainer>
    );
};
