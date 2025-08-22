
'use client';

import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '../ui/switch';
import type { TemplateKey } from '@/lib/types';
import { useLocalization } from '@/context/LocalizationContext';

const FONT_FACES = ['Calibri', 'Times New Roman', 'Arial', 'Garamond', 'Helvetica', 'Verdana'];

interface StyleEditorProps {
    heading: string;
    styleKey: 'document' | 'heading1' | 'heading2' | 'heading3';
    templateKey: TemplateKey;
    styles: any;
    onChange: (templateKey: TemplateKey, path: string, value: any) => void;
}

export function StyleEditor({ heading, styleKey, templateKey, styles: templateStyles, onChange }: StyleEditorProps) {
    const { t } = useLocalization();

    const styles = templateStyles?.default?.[styleKey]?.run;

    if (!styles) return null;

    const handleStyleChange = (path: string, value: any) => {
        onChange(templateKey, `${styleKey}.run.${path}`, value);
    }

    return (
        <AccordionItem value={styleKey}>
            <AccordionTrigger>{heading}</AccordionTrigger>
            <AccordionContent className="space-y-4 p-2">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>{t('manageTemplates.fontFamily')}</Label>
                        <Select
                            value={
                                typeof styles?.font === 'string' ?
                                styles.font :
                                (styles?.font as any)?.name || ''
                            }
                            onValueChange={(value) => handleStyleChange('font.name', value)}
                        >
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                {FONT_FACES.map(font => <SelectItem key={font} value={font}>{font}</SelectItem>)}
                            </SelectContent>
                        </Select>

                    </div>
                     <div className="space-y-2">
                        <Label>{t('manageTemplates.fontSize')}</Label>
                        <Input
                          type="number"
                          value={Number(styles?.size || 0) / 2}
                          onChange={(e) => handleStyleChange('size', Number(e.target.value) * 2)}
                        />
                      </div>
                </div>

                <div className="space-y-2">
                    <Label>{t('manageTemplates.fontColor')}</Label>
                    <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={`#${styles?.color || '000000'}`}
                          onChange={(e) => handleStyleChange('color', e.target.value.substring(1))}
                          className="w-10 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={styles?.color || ''}
                          onChange={(e) => handleStyleChange('color', e.target.value)}
                        />
                    </div>
                </div>

                {styleKey.startsWith('heading') && (
                    <div className="flex items-center space-x-2">
                        <Switch
                            id={`bold-${styleKey}-${templateKey}`}
                            checked={!!styles?.bold}
                            onCheckedChange={(checked) => handleStyleChange('bold', checked)}
                        />
                        <Label htmlFor={`bold-${styleKey}-${templateKey}`}>{t('manageTemplates.bold')}</Label>
                    </div>
                )}
            </AccordionContent>
        </AccordionItem>
    );
}
