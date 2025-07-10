
'use client';

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { CardTitle, Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import ProposalViewer from '@/components/ProposalViewer';
import { Button } from '@/components/ui/button';
import { EditableSection } from './EditableSection';
import { useLocalization } from '../../context/LocalizationContext';
import { sectionConfig, diagramConfig } from '@/lib/report-config';
import type { ProjectProposal, SectionName, DiagramType } from '@/ai/schemas';
import type { ReportState } from '@/app/generate-report/actions';
import DiagramViewer from '../DiagramViewer';
import { Loader2, RefreshCw } from 'lucide-react';
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
  proposal: ProjectProposal | null;
  onProposalUpdate: (path: string, value: any) => void;
  onSectionUpdate: (key: SectionName, value: string) => void;
  onDiagramCodeUpdate: (diagramType: DiagramType, code: string) => void;
  onDiagramUpdate: (diagramType: DiagramType, code: string) => void;
}

export const ReportResults = ({ reportState, generatingItem, proposal, onProposalUpdate, onSectionUpdate, onDiagramCodeUpdate, onDiagramUpdate }: ReportResultsProps) => {
  const { t } = useLocalization();

  return (
    <div className="space-y-6">
      {proposal && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">{t('reportGenerator.proposalDetailsTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProposalViewer proposal={proposal} onUpdate={onProposalUpdate} />
          </CardContent>
        </Card>
      )}

      <Accordion type="multiple" className="w-full space-y-4" defaultValue={['Results']}>
        <AccordionItem value="Results" className="border-none">
          <CardTitle className="font-headline text-xl mb-4 p-1">Report Content</CardTitle>
          <AccordionContent className="space-y-4 border-none">
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

              const isUpdating = generatingItem === key;

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
                      imageUrl={diagramData!.imageUrl}
                      plantUmlCode={diagramData!.plantUmlCode}
                      onCodeChange={(newCode) => onDiagramCodeUpdate(key, newCode)}
                    />
                    <Button
                      onClick={() => onDiagramUpdate(key, diagramData!.plantUmlCode)}
                      className="font-headline"
                      disabled={isUpdating}
                    >
                      {isUpdating ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <RefreshCw className="ml-2 h-4 w-4" />}
                      Update Diagram
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              )
            })}

          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
