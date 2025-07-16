
'use client';

import { Accordion } from '@/components/ui/accordion';
import { CardTitle, Card, CardContent, CardHeader } from '@/components/ui/card';
import { EditableSection } from './EditableSection';
import { useLocalization } from '../../context/LocalizationContext';
import { sectionConfig } from '@/lib/report-config';
import type { SectionName } from '@/ai/schemas';
import { Loader2, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useBuilderStore } from '@/hooks/useBuilderStore';

const orderedSections = Object.keys(sectionConfig) as SectionName[];

function SectionSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  )
}

function FullReportSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-xl mb-4 p-1">Report Content</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <div className="space-y-3 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-1/3" />
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                    <SectionSkeleton />
                </div>
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
            </CardContent>
        </Card>
    )
}

interface ReportResultsProps {
  generatingItem: string | null;
  onSectionUpdate: (key: SectionName, value: string) => void;
}

export const ReportResults = ({ generatingItem, onSectionUpdate }: ReportResultsProps) => {
  const { t } = useLocalization();
  const sections = useBuilderStore(s => s.sections);
  const hasContent = Object.values(sections).some(s => !!s);
  const isAnythingGenerating = !!generatingItem;

  if (!hasContent && !isAnythingGenerating) {
    return (
        <Card className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center text-muted-foreground p-8">
                <FileText className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Report Content Will Appear Here</h3>
                <p>Use the Generation Tools to create sections for your report.</p>
            </div>
        </Card>
    )
  }

  if (!hasContent && isAnythingGenerating) {
    return <FullReportSkeleton />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
           <CardTitle className="font-headline text-xl mb-4 p-1">Report Content</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <Accordion type="multiple" className="w-full space-y-4" defaultValue={generatingItem ? [generatingItem] : undefined}>
            {orderedSections.map((key) => {
              const content = sections[key];
              const { title, icon: Icon } = sectionConfig[key];
              const isGenerating = generatingItem === key;

              if (!content && !isGenerating) return null;

              if (isGenerating) {
                return (
                  <Card key={key}>
                    <CardHeader className="flex-row items-center justify-between p-4">
                      <CardTitle className="font-headline text-lg flex items-center gap-2 text-muted-foreground"><Icon className="h-5 w-5" /> {title}</CardTitle>
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </CardHeader>
                    <CardContent><SectionSkeleton /></CardContent>
                  </Card>
                )
              }

              return (
                <EditableSection
                  key={key}
                  sectionKey={key}
                  title={title}
                  icon={Icon}
                  content={content!}
                  onUpdate={onSectionUpdate}
                />
              )
            })}
            </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};
