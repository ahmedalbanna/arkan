
'use client';

import { usePptxStyles } from '@/hooks/use-pptx-styles';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import type { PptxTemplateKey } from '@/lib/pptx-styles';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const FONT_FACES = ['Calibri', 'Times New Roman', 'Arial', 'Garamond', 'Helvetica', 'Verdana', 'Tahoma'];

export default function PptxTemplateManager() {
  const { templates, updateStyle, isLoaded } = usePptxStyles();
  const [savingState, setSavingState] = useState<Record<PptxTemplateKey, boolean>>(() => ({} as Record<PptxTemplateKey, boolean>));

  const { toast } = useToast();

  const handleStyleChange = (templateKey: PptxTemplateKey, path: string, value: string | number | boolean) => {
    updateStyle(templateKey, path, value);
  };

  const handleSave = (key: PptxTemplateKey) => {
    setSavingState(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      toast({
        title: "Template Saved",
        description: `Your changes to the "${templates[key].name}" template have been saved.`,
      });
      setSavingState(prev => ({ ...prev, [key]: false }));
    }, 500);
  };

  if (!isLoaded) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card><CardHeader><Loader2 className="animate-spin" /></CardHeader></Card>
        <Card><CardHeader><Loader2 className="animate-spin" /></CardHeader></Card>
        <Card><CardHeader><Loader2 className="animate-spin" /></CardHeader></Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {(Object.keys(templates) as PptxTemplateKey[]).map((key) => {
        const template = templates[key];
        const styles = template.styles;

        return (
          <Card key={key} className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
               <Image
                  src={template.imageUrl}
                  alt={`${template.name} preview`}
                  width={400}
                  height={225}
                  className="w-full h-auto rounded-md border"
                  data-ai-hint={template.dataAiHint}
                />
              <Accordion type="multiple" className="w-full" defaultValue={['general']}>
                <AccordionItem value="general">
                  <AccordionTrigger>General Styles</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Background Color</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="color"
                                value={`#${styles.background.color}`}
                                onChange={(e) => handleStyleChange(key, 'background.color', e.target.value.substring(1))}
                                className="w-10 h-10 p-1"
                            />
                            <Input
                                type="text"
                                value={styles.background.color}
                                onChange={(e) => handleStyleChange(key, 'background.color', e.target.value)}
                                placeholder="e.g., FFFFFF"
                            />
                        </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="title">
                  <AccordionTrigger>Title Text</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Font Family</Label>
                        <Select
                          value={styles.title.fontFace}
                          onValueChange={(value) => handleStyleChange(key, 'title.fontFace', value)}
                        >
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                {FONT_FACES.map(font => <SelectItem key={font} value={font}>{font}</SelectItem>)}
                            </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Font Size (pt)</Label>
                        <Input
                          type="number"
                          value={styles.title.fontSize}
                          onChange={(e) => handleStyleChange(key, 'title.fontSize', Number(e.target.value))}
                        />
                      </div>
                    <div className="space-y-2">
                      <Label>Font Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={`#${styles.title.color}`}
                          onChange={(e) => handleStyleChange(key, 'title.color', e.target.value.substring(1))}
                          className="w-10 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={styles.title.color}
                          onChange={(e) => handleStyleChange(key, 'title.color', e.target.value)}
                          placeholder="e.g., 363636"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="body">
                  <AccordionTrigger>Body Text</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                     <div className="space-y-2">
                        <Label>Font Family</Label>
                         <Select
                          value={styles.body.fontFace}
                          onValueChange={(value) => handleStyleChange(key, 'body.fontFace', value)}
                        >
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                {FONT_FACES.map(font => <SelectItem key={font} value={font}>{font}</SelectItem>)}
                            </SelectContent>
                        </Select>
                      </div>
                       <div className="space-y-2">
                        <Label>Font Size (pt)</Label>
                        <Input
                          type="number"
                          value={styles.body.fontSize}
                          onChange={(e) => handleStyleChange(key, 'body.fontSize', Number(e.target.value))}
                        />
                      </div>
                    <div className="space-y-2">
                      <Label>Font Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={`#${styles.body.color}`}
                          onChange={(e) => handleStyleChange(key, 'body.color', e.target.value.substring(1))}
                          className="w-10 h-10 p-1"
                        />
                         <Input
                          type="text"
                          value={styles.body.color}
                          onChange={(e) => handleStyleChange(key, 'body.color', e.target.value)}
                          placeholder="e.g., 4f4f4f"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave(key)} disabled={savingState[key]} className="font-headline">
                {savingState[key] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Template
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
