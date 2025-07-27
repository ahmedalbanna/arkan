
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CardTitle, Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { EditableSection } from '../EditableSection';
import { useLocalization } from '../../context/LocalizationContext';
import { sectionConfig } from '@/lib/report-config';
import type { SectionName } from '@/ai/schemas';
import { Loader2, FileText, Languages, ArrowRightLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useReportStore } from '@/hooks/useReportStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import { useTranslate } from '@/hooks/use-translation';
import { toast } from '../ui/use-toast';

const orderedSections = Object.keys(sectionConfig) as SectionName[];

interface ReportResultsProps {
  onSectionUpdate: (key: SectionName, value: string) => void;
}

const TranslationView = ({ sectionKey, originalContent }: { sectionKey: SectionName, originalContent: string }) => {
    const { t, locale } = useLocalization();
    const { translatedSections, setTranslatedSection } = useReportStore();
    const translateMutation = useTranslate();
    const translatedContent = translatedSections[sectionKey];

    const handleTranslate = async () => {
        const targetLang = locale === 'en' ? 'ar' : 'en';
        translateMutation.mutate({ text: originalContent, targetLang }, {
            onSuccess: (data) => {
                setTranslatedSection(sectionKey, data.translatedText);
                toast({ title: t('builder.editableSection.toasts.translateSuccess') });
            },
            onError: (error) => {
                const isCreditError = error.message.toLowerCase().includes('credit');
                toast({ 
                    title: t('builder.editableSection.toasts.translateFailed'), 
                    description: isCreditError ? t('builder.toasts.insufficientCredits') : error.message,
                    variant: 'destructive' 
                });
            }
        });
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Original ({locale === 'en' ? 'English' : 'Arabic'})</h4>
                    <Card className="h-64">
                        <ScrollArea className="h-full">
                            <div className="p-4 prose dark:prose-invert max-w-none text-sm">
                                <ReactMarkdown components={markdownComponents}>{originalContent}</ReactMarkdown>
                            </div>
                        </ScrollArea>
                    </Card>
                </div>
                <div className="space-y-2">
                     <h4 className="font-semibold text-sm">Translation ({locale === 'en' ? 'Arabic' : 'English'})</h4>
                    <Card className="h-64">
                        <ScrollArea className="h-full">
                            <div className="p-4 prose dark:prose-invert max-w-none text-sm">
                               {translateMutation.isPending && <Loader2 className="h-5 w-5 animate-spin" />}
                               {!translateMutation.isPending && translatedContent && <ReactMarkdown components={markdownComponents}>{translatedContent}</ReactMarkdown>}
                               {!translateMutation.isPending && !translatedContent && <p className="text-xs text-muted-foreground">Click translate to see the result here.</p>}
                            </div>
                        </ScrollArea>
                    </Card>
                </div>
            </div>
             <Button onClick={handleTranslate} disabled={translateMutation.isPending}>
                {translateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRightLeft className="mr-2 h-4 w-4" />}
                Translate
            </Button>
        </div>
    )

}

export const ReportResults = ({ onSectionUpdate }: ReportResultsProps) => {
  const { sections } = useReportStore();
  const { t } = useLocalization();
  
  const hasContent = sections && Object.values(sections).some(s => !!s);
  
  if (!hasContent) {
    return (
        <Card className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center text-muted-foreground p-8">
                <FileText className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">{t('builder.reportGenerator.emptyStateTitle')}</h3>
                <p>{t('builder.reportGenerator.emptyStateDesc')}</p>
            </div>
        </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
           <CardTitle className="font-headline text-xl mb-4 p-1">{t('builder.reportGenerator.resultsTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <Accordion type="multiple" className="w-full space-y-4">
            {orderedSections.map((key) => {
              const content = sections[key];
              const { title, icon: Icon } = sectionConfig[key];

              if (!content) return null;

              return (
                 <Card key={key} className="bg-background rounded-lg border">
                    <Tabs defaultValue="view">
                        <AccordionItem value={key} className="border-b-0">
                             <AccordionTrigger className="font-headline text-xl p-4 hover:no-underline">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2">
                                        <Icon className="mr-2 h-5 w-5 text-primary" /> {t(title)}
                                    </div>
                                    <TabsList className="mr-2" onClick={(e) => e.stopPropagation()}>
                                        <TabsTrigger value="view">View</TabsTrigger>
                                        <TabsTrigger value="translate">Translate</TabsTrigger>
                                    </TabsList>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 border-t">
                                <TabsContent value="view">
                                     <EditableSection
                                        sectionKey={key}
                                        title={t(title)}
                                        icon={Icon}
                                        content={content!}
                                        onUpdate={onSectionUpdate}
                                    />
                                </TabsContent>
                                <TabsContent value="translate">
                                    <TranslationView sectionKey={key} originalContent={content} />
                                </TabsContent>
                            </AccordionContent>
                        </AccordionItem>
                    </Tabs>
                </Card>
              )
            })}
            </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};
