
'use client';

import { Accordion } from '@/components/ui/accordion';
import { CardTitle, Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { EditableSection } from './EditableSection';
import { useLocalization } from '../../context/LocalizationContext';
import { sectionConfig } from '@/lib/report-config';
import type { SectionName } from '@/ai/schemas';
import { Loader2, FileText, AlertTriangle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { Button } from '../ui/button';
import { useAuth } from '@/context/AuthContext';

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

function ErrorReportCard({ itemKey, error, onRetry }: { itemKey: string, error: string, onRetry: () => void }) {
    const { title, icon: Icon } = sectionConfig[itemKey as SectionName];
    return (
        <Card className="border-destructive bg-destructive/5">
            <CardHeader className="flex-row items-center justify-between p-4">
                <CardTitle className="font-headline text-lg flex items-center gap-2 text-destructive"><Icon className="h-5 w-5" /> {title}</CardTitle>
                <AlertTriangle className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <p className="text-sm text-destructive mb-4">{error}</p>
                <Button variant="destructive" size="sm" onClick={onRetry}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry Generation
                </Button>
            </CardContent>
        </Card>
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
  onSectionUpdate: (key: SectionName, value: string) => void;
}

export const ReportResults = ({ onSectionUpdate }: ReportResultsProps) => {
  const { t } = useLocalization();
  const { user, fetchUser } = useAuth();
  const { 
    sections, 
    generatingItem, 
    isAnythingGenerating,
    error, 
    lastGenerated, 
    handleRetryGeneration,
    handleGenerateReportSection
  } = useBuilderStore(state => ({
    sections: state.sections,
    generatingItem: state.isAnythingGenerating ? state.lastGenerated : null,
    isAnythingGenerating: state.isAnythingGenerating,
    error: state.error,
    lastGenerated: state.lastGenerated,
    handleRetryGeneration: state.handleRetryGeneration,
    handleGenerateReportSection: state.handleGenerateReportSection,
  }));
  
  const hasContent = Object.values(sections).some(s => !!s);
  const generationError = isAnythingGenerating ? null : error;

  if (!hasContent && !isAnythingGenerating && !generationError) {
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

  const handleRetry = (key: SectionName) => {
    if (user) {
        handleRetryGeneration(key, user, fetchUser);
    }
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
              const hasError = generationError && lastGenerated === key;

              if (!content && !isGenerating && !hasError) return null;

              if (hasError) {
                return <ErrorReportCard key={key} itemKey={key} error={generationError} onRetry={() => handleRetry(key)} />
              }

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
