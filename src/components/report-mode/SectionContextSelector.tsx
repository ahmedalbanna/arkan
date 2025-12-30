
'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContextSelector } from '@/hooks/core/use-context-selector';
import { type SectionContext, type ExternalContextType } from '@/lib/models';
import type { Section, ExternalContext } from '@/lib/models';

interface ContextSelectorProps {
    availableSections: Section[];
    availableFiles: ExternalContext[];
    selectedContext: SectionContext;
    onContextChange: (newContext: SectionContext) => void;
}

const contextTypes: ExternalContextType[] = ['context', 'example', 'question', 'textbook', 'guidelines'];

export function SectionContextSelector({
    availableSections,
    availableFiles,
    selectedContext,
    onContextChange
}: ContextSelectorProps) {
    const { t } = useContextSelector(''); // Pass dummy key, only t is used

    const handleToggle = (type: 'sections' | 'externalContext', id: string) => {
        const newContext = JSON.parse(JSON.stringify(selectedContext)); // Deep copy
        const target = newContext[type];

        if (target[id]) {
            delete target[id];
        } else {
            target[id] = 'context'; // Default to 'context' when toggled on
        }
        onContextChange(newContext);
    };

    const handleTypeChange = (type: 'sections' | 'externalContext', id: string, newType: ExternalContextType) => {
        const newContext = JSON.parse(JSON.stringify(selectedContext));
        newContext[type][id] = newType;
        onContextChange(newContext);
    }

    return (
        <ScrollArea className="h-96">
            <div className="space-y-4">
                {availableSections.length > 0 && (
                    <div className="space-y-2">
                        <Label className="font-semibold">{t('builder.reportGenerator.ContextualSections')}</Label>
                        {availableSections.map(section => (
                            <div key={section.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`ctx-sec-${section.id}`}
                                    checked={!!selectedContext.sections?.[section.id]}
                                    onCheckedChange={() => handleToggle('sections', section.id)}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <label
                                        htmlFor={`ctx-sec-${section.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {section.title}
                                    </label>
                                </div>
                                {selectedContext.sections?.[section.id] && (
                                     <Select
                                        value={selectedContext.sections?.[section.id] || 'context'}
                                        onValueChange={(value: ExternalContextType) => handleTypeChange('sections', section.id, value)}
                                    >
                                        <SelectTrigger className="h-7 text-xs w-auto">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {contextTypes.map(ctxType => (
                                                <SelectItem key={ctxType} value={ctxType} className="capitalize">{ctxType}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                 {availableFiles.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                        <Label className="font-semibold">{t('builder.reportGenerator.externalContext')}</Label>
                        {availableFiles.map(file => (
                             <div key={file.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`ctx-file-${file.id}`}
                                    checked={!!selectedContext.externalContext?.[file.id]}
                                    onCheckedChange={() => handleToggle('externalContext', file.id)}
                                />
                                <div className="grid gap-1.5 leading-none">
                                     <label htmlFor={`ctx-file-${file.id}`} className="text-sm font-medium leading-none">{file.fileName}</label>
                                </div>
                                {selectedContext.externalContext?.[file.id] && (
                                     <Select
                                        value={selectedContext.externalContext?.[file.id] || 'context'}
                                        onValueChange={(value: ExternalContextType) => handleTypeChange('externalContext', file.id, value)}
                                    >
                                        <SelectTrigger className="h-7 text-xs w-auto">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {contextTypes.map(ctxType => (
                                                <SelectItem key={ctxType} value={ctxType} className="capitalize">{ctxType}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}
