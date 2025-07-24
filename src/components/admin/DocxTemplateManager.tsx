
'use client';

import { useDocxStyles, useRefreshTemplateImage } from '@/hooks/use-docx-styles';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Save, RefreshCw } from 'lucide-react';
import type { TemplateKey } from '@/lib/docx-styles';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import Image from 'next/image';
import { useLocalization } from '@/context/LocalizationContext';
import { Skeleton } from '../ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const FONT_FACES = ['Calibri', 'Times New Roman', 'Arial', 'Garamond', 'Helvetica', 'Verdana'];

function DocxTemplateSkeleton() {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <Skeleton className="w-full aspect-[400/565] rounded-md" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-32" />
            </CardFooter>
        </Card>
    );
}

export default function DocxTemplateManager() {
  const { templates, updateStyle, saveChanges, isSaving, isLoaded } = useDocxStyles();
  const refreshImageMutation = useRefreshTemplateImage('docx');
  const { t } = useLocalization();

  const handleStyleChange = (templateKey: TemplateKey, path: string, value: string | number | boolean) => {
    updateStyle(templateKey, path, value);
  };

  const handleSave = (key: TemplateKey) => {
    saveChanges(key);
  };

  if (!isLoaded) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DocxTemplateSkeleton />
        <DocxTemplateSkeleton />
        <DocxTemplateSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {(Object.keys(templates) as TemplateKey[]).map((key) => {
        const template = templates[key];
        const styles = template.styles.default;

        return (
          <Card key={key} className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline">{t(template.name)}</CardTitle>
              <CardDescription>{t(template.description)}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div className="relative">
                <Image
                  src={template.imageUrl || `https://placehold.co/400x565.png`}
                  alt={`${t(template.name)} preview`}
                  width={400}
                  height={565}
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
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="general">
                  <AccordionTrigger>{t('manageTemplates.generalStyles')}</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('manageTemplates.fontFamily')}</Label>
                        <Select
                          value={(styles?.document?.run?.font as any)?.name || ''}
                          onValueChange={(value) => handleStyleChange(key, 'document.run.font.name', value)}
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
                          value={Number(styles?.document?.run?.size || 0) / 2}
                          onChange={(e) => handleStyleChange(key, 'document.run.size', Number(e.target.value) * 2)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('manageTemplates.fontColor')}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={`#${styles?.document?.run?.color || '000000'}`}
                          onChange={(e) => handleStyleChange(key, 'document.run.color', e.target.value.substring(1))}
                          className="w-10 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={styles?.document?.run?.color || ''}
                          onChange={(e) => handleStyleChange(key, 'document.run.color', e.target.value)}
                          placeholder="e.g., 333333"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="headings">
                  <AccordionTrigger>{t('manageTemplates.headingStyles')}</AccordionTrigger>
                  <AccordionContent className="space-y-6">
                    {[1, 2, 3].map(level => (
                      <div key={level} className="space-y-3 p-2 border-l-2">
                        <h4 className="font-semibold">{t('manageTemplates.headingLevel', { level })}</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{t('manageTemplates.fontSize')}</Label>
                            <Input
                              type="number"
                              value={Number((styles as any)?.[`heading${level}`]?.run?.size || 0) / 2}
                              onChange={(e) => handleStyleChange(key, `heading${level}.run.size`, Number(e.target.value) * 2)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{t('manageTemplates.bold')}</Label>
                            <input
                              type="checkbox"
                              className="w-5 h-5 block"
                              checked={!!(styles as any)?.[`heading${level}`]?.run?.bold}
                              onChange={(e) => handleStyleChange(key, `heading${level}.run.bold`, e.target.checked)}
                            />

                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>{t('manageTemplates.fontColor')}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={`#${(styles as any)?.[`heading${level}`]?.run?.color || '000000'}`}
                              onChange={(e) => handleStyleChange(key, `heading${level}.run.color`, e.target.value.substring(1))}
                              className="w-10 h-10 p-1"
                            />

                            <Input
                              type="text"
                              value={(styles as any)?.[`heading${level}`]?.run?.color || ''}
                              onChange={(e) => handleStyleChange(key, `heading${level}.run.color`, e.target.value)}
                              placeholder="e.g., 2E74B5"
                            />

                          </div>
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSave(key)} disabled={isSaving} className="font-headline">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {t('manageTemplates.saveButton')}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
