
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CardTitle, Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EditableSection } from './EditableSection';
import { useLocalization } from '../../context/LocalizationContext';
import { sectionConfig, diagramConfig, presentationConfig } from '@/lib/report-config';
import type { ProjectProposal, SectionName, DiagramType } from '@/ai/schemas';
import type { ReportState } from '@/hooks/use-report-state';
import DiagramViewer from '../DiagramViewer';
import { Loader2, RefreshCw, Eye, FileText, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const orderedSections = Object.keys(sectionConfig) as SectionName[];
const orderedDiagrams = Object.keys(diagramConfig) as DiagramType[];

function SectionSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  )
}

function DiagramSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="aspect-video w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}


interface ReportResultsProps {
  reportState: ReportState;
  generatingItem: string | null;
  isAnythingGenerating: boolean;
  onSectionUpdate: (key: SectionName, value: string) => void;
  onDiagramUpdate: (diagramType: DiagramType) => void;
  onDiagramCodeUpdate: (diagramType: DiagramType, code: string) => void;
}

export const ReportResults = ({ reportState, generatingItem, isAnythingGenerating, onSectionUpdate, onDiagramUpdate, onDiagramCodeUpdate }: ReportResultsProps) => {
  const { t } = useLocalization();
  const hasContent = Object.values(reportState.sections).some(s => !!s) || Object.values(reportState.diagrams || {}).some(d => !!d);


  if (!hasContent && !isAnythingGenerating) {
    return (
        <Card className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center text-muted-foreground p-8">
                <FileText className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Report Content Will Appear Here</h3>
                <p>Use the Generation Tools to create sections and diagrams for your report.</p>
            </div>
        </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
           <CardTitle className="font-headline text-xl mb-4 p-1">Report Content</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {reportState.presentation && (
              <Card>
                  <CardHeader className="flex-row items-center justify-between p-4">
                    <CardTitle className="font-headline text-lg flex items-center gap-2">
                      <presentationConfig.presentation.icon className="h-5 w-5 text-primary" /> {presentationConfig.presentation.title}
                    </CardTitle>
                    <Button variant="secondary" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View Presentation
                    </Button>
                  </CardHeader>
              </Card>
          )}
          <Accordion type="multiple" className="w-full space-y-4">
            {orderedSections.map((key) => {
              const content = reportState.sections[key];
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
            {orderedDiagrams.map((key) => {
              const diagramData = reportState.diagrams?.[key];
              const { title, icon: Icon } = diagramConfig[key];
              const isGenerating = generatingItem === key;

              if (!diagramData && !isGenerating) return null;

              if (isGenerating) {
                return (
                  <Card key={key}>
                    <CardHeader className="flex-row items-center justify-between p-4">
                      <CardTitle className="font-headline text-lg flex items-center gap-2 text-muted-foreground"><Icon className="h-5 w-5" /> {title}</CardTitle>
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </CardHeader>
                    <CardContent><DiagramSkeleton /></CardContent>
                  </Card>
                )
              }
              if(!diagramData) return null;

              const isUpdatingThis = isAnythingGenerating && generatingItem === key;

              return (
                <AccordionItem value={title} key={key} className="bg-background rounded-lg border">
                  <AccordionTrigger className="font-headline text-xl p-4 hover:no-underline">
                    <div className="flex items-center">
                      <Icon className="mr-2 h-5 w-5 text-primary" /> {title}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 border-t space-y-4">
                    <DiagramViewer
                      title={title}
                      imageUrl={diagramData.imageUrl}
                      plantUmlCode={diagramData.plantUmlCode}
                      onCodeChange={(newCode) => onDiagramCodeUpdate(key, newCode)}
                      isReadOnly={isAnythingGenerating}
                    />
                    <Button
                      onClick={() => onDiagramUpdate(key)}
                      className="font-headline"
                      disabled={isUpdatingThis}
                    >
                      {isUpdatingThis ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                      Update Diagram
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
            </Accordion>
             {generatingItem === 'presentation' && (
                <Card>
                    <CardHeader className="flex-row items-center justify-between p-4">
                        <CardTitle className="font-headline text-lg flex items-center gap-2 text-muted-foreground">
                            <presentationConfig.presentation.icon className="h-5 w-5" /> {presentationConfig.presentation.title}
                        </CardTitle>
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </CardHeader>
                    <CardContent><SectionSkeleton /></CardContent>
                </Card>
            )}
        </CardContent>
      </Card>
    </div>
  );
};
