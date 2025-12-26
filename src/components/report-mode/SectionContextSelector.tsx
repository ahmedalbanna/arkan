'use client';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks/core/useBuilderStore';
import { ExternalContextType } from '@/lib/models';
import { cn } from '@/lib/utils/cn';
import { BookCheck, FileText } from 'lucide-react';
import { useMemo, useCallback } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface ContextSelectorProps {
    itemKey: string;
}

export function ContextSelector({ itemKey }: ContextSelectorProps) {
    const { t } = useLocalization();
    const { project, updateProject } = useBuilderStore();

    const section = useMemo(() => project?.getSection(itemKey), [project, itemKey]);

    const currentSelection = useMemo(() => {
        return section?.context || { sections: {}, externalContext: {} };
    }, [section?.context]);

    const reportSections = useMemo(() => {
        if (!project?.sections) return [];
        return project.sections
            .filter(s => s.id !== itemKey)
            .map(s => ({ id: s.id, title: s.title }));
    }, [project?.sections, itemKey]);

    const sectionsContent = useMemo(() => {
        if (!project?.sections) return {};
        return project.sections.reduce((acc, section) => {
            acc[section.id] = section.content || '';
            return acc;
        }, {} as Record<string, string>);
    }, [project?.sections]);

    const contextTypes: ExternalContextType[] = ['context', 'example', 'question', 'textbook', 'guidelines'];

    const handleContextChange = useCallback((
        sectionId: string,
        type: 'sections' | 'externalContext',
        subKey: string,
        value: ExternalContextType | false
    ) => {
        updateProject(p => p.updateSection(sectionId, (sec) => {
            const newContext = { ...sec.context };
            const newDict = { ...(newContext[type] || {}) };
            
            if (value === false) {
                delete newDict[subKey];
            } else {
                newDict[subKey] = value;
            }
            
            newContext[type] = newDict;
            return sec.with({ context: newContext });
        }));
    }, [updateProject]);

    const renderContextItem = (item: { id: string; title: string; content?: string | undefined; fileName?: string }, type: 'sections' | 'externalContext') => {
        const isSelected = !!currentSelection[type]?.[item.id];
        const selectedType = currentSelection[type]?.[item.id] || 'context';
        const hasContent = type === 'sections' ? !!sectionsContent[item.id] : !!item.content;
        const displayName = item.fileName || item.title;

        return (
            <div key={`${type}-${itemKey}-${item.id}`} className="flex items-center space-x-2 p-1 rounded-md hover:bg-muted/50">
                <Checkbox
                    id={`${type}-${itemKey}-${item.id}`}
                    checked={isSelected}
                    onCheckedChange={(checked) => handleContextChange(itemKey, type, item.id, checked ? 'context' : false)}
                    disabled={type === 'sections' && !hasContent}
                />
                <Label htmlFor={`${type}-${itemKey}-${item.id}`} className={cn("text-sm font-normal flex-1 truncate", !hasContent && "text-muted-foreground/50")}>
                    {displayName}
                </Label>
                {isSelected && (
                    <Select
                        value={selectedType}
                        onValueChange={(value: ExternalContextType) => handleContextChange(itemKey, type, item.id, value)}
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
        );
    };

    return (
        <div className="space-y-4 pr-4">
            <div className="space-y-2">
                <Label className="font-semibold">{t('builder.reportGenerator.ContextualSections')}</Label>
                {reportSections.map(section => renderContextItem({ ...section, content: sectionsContent[section.id] }, 'sections'))}
                {reportSections.length === 0 && (
                    <p className="text-xs text-muted-foreground pl-4">{t('builder.reportGenerator.noOtherSections')}</p>
                )}
            </div>

            {project?.externalContext && project.externalContext.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                    <Label className="font-semibold">{t('builder.reportGenerator.externalContext')}</Label>
                    {project.externalContext.map((item) => renderContextItem(item, 'externalContext'))}
                </div>
            )}
        </div>
    );
}
