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
import { useContextSelector } from '@/hooks/core/use-context-selector';

interface ContextSelectorProps {
    itemKey: string;
}

const contextTypes: ExternalContextType[] = ['context', 'example', 'question', 'textbook', 'guidelines'];

const ContextItem = ({
    item,
    itemKey,
    type,
    isSelected,
    selectedType,
    hasContent,
    onContextChange
}: {
    item: { id: string, title?: string, fileName?: string },
    itemKey: string,
    type: 'sections' | 'externalContext',
    isSelected: boolean,
    selectedType: ExternalContextType,
    hasContent: boolean,
    onContextChange: (sectionId: string, type: 'sections' | 'externalContext', subKey: string, value: ExternalContextType | false) => void
}) => {
    const displayName = item.fileName || item.title;

    return (
        <div key={`${type}-${itemKey}-${item.id}`} className="flex items-center space-x-2 p-1 rounded-md hover:bg-muted/50">
            <Checkbox
                id={`${type}-${itemKey}-${item.id}`}
                checked={isSelected}
                onCheckedChange={(checked) => onContextChange(itemKey, type, item.id, checked ? 'context' : false)}
                disabled={type === 'sections' && !hasContent}
            />
            <Label htmlFor={`${type}-${itemKey}-${item.id}`} className={cn("text-sm font-normal flex-1 truncate", !hasContent && "text-muted-foreground/50")}>
                {displayName}
            </Label>
            {isSelected && (
                <Select
                    value={selectedType}
                    onValueChange={(value: ExternalContextType) => onContextChange(itemKey, type, item.id, value)}
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


export function ContextSelector({ itemKey }: ContextSelectorProps) {
    const { t, reportSections, handleContextChange, currentSelection, sections, externalContext } = useContextSelector(itemKey);

    return (
        <div className="space-y-4 pr-4">
            <div className="space-y-2">
                <Label className="font-semibold">{t('builder.reportGenerator.ContextualSections')}</Label>
                {reportSections.map(section => (
                    <ContextItem
                        key={section.id}
                        item={section}
                        itemKey={itemKey}
                        type="sections"
                        isSelected={!!currentSelection.sections?.[section.id]}
                        selectedType={currentSelection.sections?.[section.id] || 'context'}
                        hasContent={!!sections[section.id]}
                        onContextChange={handleContextChange}
                    />
                ))}
                {reportSections.length === 0 && (
                    <p className="text-xs text-muted-foreground pl-4">{t('builder.reportGenerator.noOtherSections')}</p>
                )}
            </div>

            {externalContext && externalContext.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                    <Label className="font-semibold">{t('builder.reportGenerator.externalContext')}</Label>
                    {externalContext.map((item) => (
                        <ContextItem
                            key={item.id}
                            item={item}
                            itemKey={itemKey}
                            type="externalContext"
                            isSelected={!!currentSelection.externalContext?.[item.id]}
                            selectedType={currentSelection.externalContext?.[item.id] || 'context'}
                            hasContent={!!item.content}
                            onContextChange={handleContextChange}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
