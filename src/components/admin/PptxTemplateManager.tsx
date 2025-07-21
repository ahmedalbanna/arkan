
'use client';

import { usePptxStyles, useRefreshPptxTemplateImage } from '@/hooks/use-pptx-styles';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Save, RefreshCw } from 'lucide-react';
import type { PptxTemplateKey } from '@/lib/pptx-styles';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useLocalization } from '@/context/LocalizationContext';
import { Skeleton } from '../ui/skeleton';

const FONT_FACES = ['Calibri', 'Times New Roman', 'Arial', 'Garamond', 'Helvetica', 'Verdana'];


function PptxTemplateSkeleton() {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <Skeleton className="w-full aspect-video rounded-md" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-32" />
            </CardFooter>
        </Card>
    );
}


export default function PptxTemplateManager() {
  const { templates, updateStyle, saveChanges, isSaving, isLoaded } = usePptxStyles();
  const refreshImageMutation = useRefreshPptxTemplateImage();
  const { t } = useLocalization();

  const handleStyleChange = (templateKey: PptxTemplateKey, path: string, value: string | number | boolean) => {
    updateStyle(templateKey, path, value);
  };

  const handleSave = (key: PptxTemplateKey) => {
    saveChanges(key);
  };

  if (!isLoaded) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PptxTemplateSkeleton />
        <PptxTemplateSkeleton />
        <PptxTemplateSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {(Object.keys(templates) as PptxTemplateKey[]).map((key) => {
        const template = templates[key];
        // Ensure template and its styles are defined before rendering
        if (!template || !template.styles) {
          return <PptxTemplateSkeleton key={key} />;
        }
        const styles = template.styles;

        return (
          <Card key={key} className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline">{t(template.name)}</CardTitle>
              <CardDescription>{t(template.description)}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
               <div className="relative">
                <Image
                  src={template.imageUrl || 'https://placehold.co/400x225.png'}
                  alt={`${t(template.name)} preview`}
                  width={400}
                  height={225}
                  className="w-full h-auto rounded-md border"
                />
                 <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={() => refreshImageMutation.mutate({ templateId: key, prompt: template.dataAiHint })}
                    disabled={refreshImageMutation.isPending && refreshImageMutation.variables?.templateId === key}
                  >
                    {refreshImageMutation.isPending && refreshImageMutation.variables?.templateId === key ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </Button>
               </div>
              <Accordion type="multiple" className="w-full" defaultValue={['general']}>
                <AccordionItem value="general">
                  <AccordionTrigger>{t('pptxTemplates.generalStyles')}</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t('pptxTemplates.backgroundColor')}</Label>
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
                  <AccordionTrigger>{t('pptxTemplates.titleText')}</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t('pptxTemplates.fontFamily')}</Label>
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
                        <Label>{t('pptxTemplates.fontSize')}</Label>
                        <Input
                          type="number"
                          value={styles.title.fontSize}
                          onChange={(e) => handleStyleChange(key, 'title.fontSize', Number(e.target.value))}
                        />
                      </div>
                    <div className="space-y-2">
                      <Label>{t('pptxTemplates.fontColor')}</Label>
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
                  <AccordionTrigger>{t('pptxTemplates.bodyText')}</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                     <div className="space-y-2">
                        <Label>{t('pptxTemplates.fontFamily')}</Label>
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
                        <Label>{t('pptxTemplates.fontSize')}</Label>
                        <Input
                          type="number"
                          value={styles.body.fontSize}
                          onChange={(e) => handleStyleChange(key, 'body.fontSize', Number(e.target.value))}
                        />
                      </div>
                    <div className="space-y-2">
                      <Label>{t('pptxTemplates.fontColor')}</Label>
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
              <Button onClick={() => handleSave(key)} disabled={isSaving} className="font-headline">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {t('pptxTemplates.saveButton')}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
