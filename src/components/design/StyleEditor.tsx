
'use client';

import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useDocxStyles } from '@/hooks/use-docx-styles';
import { Switch } from '../ui/switch';
import { TemplateKey } from '@/lib/types';

const FONT_FACES = ['Calibri', 'Times New Roman', 'Arial', 'Garamond', 'Helvetica', 'Verdana'];

interface StyleEditorProps {
    heading: string;
    styleKey: 'document' | 'heading1' | 'heading2' | 'heading3';
}

export function StyleEditor({ heading, styleKey }: StyleEditorProps) {
    const { activeStyles, updateStyle, activeTemplateKey } = useDocxStyles();
    
    if (!activeStyles?.default?.[styleKey]?.run) return null;

    const styles = activeStyles.default[styleKey].run;

    const handleStyleChange = (path: string, value: any) => {
        if (activeTemplateKey) {
            updateStyle(`${styleKey}.run.${path}`, value);
        }
    }
    
    return (
        <AccordionItem value={styleKey}>
            <AccordionTrigger>{heading}</AccordionTrigger>
            <AccordionContent className="space-y-4 p-2">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Font Family</Label>
                        <Select
                            value={
                                typeof styles?.font === 'string' ?
                                styles.font :
                                (styles?.font as any)?.name || '' // Use any as a temporary workaround if type is complex
                            }
                            onValueChange={(value) => handleStyleChange('font.name', value)}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {FONT_FACES.map(font => <SelectItem key={font} value={font}>{font}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Font Size (pt)</Label>
                        <Input
                            type="number"
                            value={Number(styles?.size || 0) / 2}
                            onChange={(e) => handleStyleChange('size', Number(e.target.value) * 2)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Font Color</Label>
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
                            id={`bold-${styleKey}`}
                            checked={!!styles?.bold}
                            onCheckedChange={(checked) => handleStyleChange('bold', checked)}
                        />
                        <Label htmlFor={`bold-${styleKey}`}>Bold</Label>
                    </div>
                )}
            </AccordionContent>
        </AccordionItem>
    );
}
