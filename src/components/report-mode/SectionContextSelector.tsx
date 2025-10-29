
'use client';

import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookCheck, GitGraph, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { useContextSelector } from '@/hooks';

interface ContextSelectorProps {
    itemKey: string;
}

export function ContextSelector({ itemKey }: ContextSelectorProps) {
    const {
        t,
        reportSections,
        toggleContextSelection,
        currentSelection,
        sections: generatedSectionsContent,
        externalContext,
    } = useContextSelector(itemKey);

    return (
        <ScrollArea className="h-60 w-full">
            <div className="space-y-4 pr-4">
                <div className="space-y-2">
                    <Label className="font-semibold">{t('builder.reportGenerator.ContextualSections')}</Label>

                    {/* Report Sections */}
                    {reportSections.map(section => (
                        <div key={`ctx-s-${itemKey}-${section.id}`} className="flex items-center space-x-2">
                            <Checkbox
                                id={`context-section-${itemKey}-${section.id}`}
                                checked={!!currentSelection.sections[section.id]}
                                onCheckedChange={(checked) => toggleContextSelection(itemKey, 'sections', section.id, !!checked)}
                                disabled={!generatedSectionsContent[section.id]}
                            />
                            <Label htmlFor={`context-section-${itemKey}-${section.id}`} className={cn("text-sm font-normal", !generatedSectionsContent[section.id] && "text-muted-foreground/50")}>
                                <div className="flex items-center gap-2">
                                    <BookCheck className="h-4 w-4" />
                                    {section.title}
                                </div>
                            </Label>
                        </div>
                    ))}
                    {reportSections.length === 0 && (
                        <p className="text-xs text-muted-foreground pl-4">{t('builder.reportGenerator.noOtherSections')}</p>
                    )}
                </div>

         

                {externalContext && externalContext.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                        <Label className="font-semibold">{t('builder.reportGenerator.externalContext')}</Label>
                        {externalContext.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`context-external-${itemKey}-${index}`}
                                    checked={!!currentSelection.externalContext?.[index]}
                                    onCheckedChange={(checked) => toggleContextSelection(itemKey, 'externalContext', index, !!checked)}
                                />
                                <Label htmlFor={`context-external-${itemKey}-${index}`} className="text-sm font-normal">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        <span className="truncate">{item.fileName}</span>
                                        <Badge variant="secondary" className={cn("text-xs capitalize", {
                                            'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800': item.type === 'context',
                                            'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800': item.type === 'example',
                                            'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800': item.type === 'question',
                                            'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800': item.type === 'textbook',
                                            'bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600': item.type === 'guidelines',
                                        })}>{item.type}</Badge>
                                    </div>
                                </Label>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}
