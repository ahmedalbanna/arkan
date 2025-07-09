
'use client';

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { CardTitle } from '@/components/ui/card';
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

const orderedSections = Object.keys(sectionConfig) as SectionName[];
const orderedDiagrams = Object.keys(diagramConfig) as DiagramType[];

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
        <div>
          <CardTitle className="font-headline text-xl mb-4">{t('reportGenerator.proposalDetailsTitle')}</CardTitle>
          <ProposalViewer proposal={proposal} onUpdate={onProposalUpdate} />
        </div>
      )}
      
      <Accordion type="multiple" className="w-full space-y-4" defaultValue={[...orderedSections.map(s => sectionConfig[s].title), ...orderedDiagrams.map(d => diagramConfig[d].title)]}>
        {orderedSections.map((key) => {
            const content = reportState.sections[key];
            if (!content) return null;
            const { title, icon: Icon } = sectionConfig[key];
            return (
                <EditableSection
                    key={key}
                    sectionKey={key}
                    title={title}
                    icon={Icon}
                    content={content}
                    onUpdate={onSectionUpdate}
                />
            )
        })}
        {orderedDiagrams.map((key) => {
            const diagramData = reportState.diagrams?.[key];
            if (!diagramData) return null;
            const { title, icon: Icon } = diagramConfig[key];
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
                        imageUrl={diagramData.imageUrl}
                        plantUmlCode={diagramData.plantUmlCode}
                        onCodeChange={(newCode) => onDiagramCodeUpdate(key, newCode)}
                      />
                      <Button
                          onClick={() => onDiagramUpdate(key, diagramData.plantUmlCode)}
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
      </Accordion>
    </div>
  );
};
