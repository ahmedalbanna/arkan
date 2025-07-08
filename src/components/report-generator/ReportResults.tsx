
'use client';

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import ProposalViewer from '@/components/ProposalViewer';
import Image from 'next/image';
import { EditableSection } from './EditableSection';
import { useLocalization } from '@/context/LocalizationContext';
import { sectionConfig, diagramConfig } from '@/lib/report-config';
import type { ProjectProposal, SectionName, DiagramType } from '@/ai/schemas';
import type { ReportState } from '@/app/generate-report/actions';

const orderedSections = Object.keys(sectionConfig) as SectionName[];
const orderedDiagrams = Object.keys(diagramConfig) as DiagramType[];

interface ReportResultsProps {
  reportState: ReportState;
  generatingItem: string | null;
  proposal: ProjectProposal | null;
  onProposalUpdate: (path: string, value: any) => void;
  onSectionUpdate: (key: SectionName, value: string) => void;
}

export const ReportResults = ({ reportState, generatingItem, proposal, onProposalUpdate, onSectionUpdate }: ReportResultsProps) => {
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
            return (
              <AccordionItem value={title} key={key} className="bg-background rounded-lg border">
                  <AccordionTrigger className="font-headline text-xl p-4 hover:no-underline">
                      <div className="flex items-center">
                          <Icon className="mr-2 h-5 w-5 text-primary" /> {title}
                      </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 p-4 border-t">
                      <Image 
                          src={diagramData.imageUrl} 
                          alt={`Rendered ${title}`}
                          width={800}
                          height={600}
                          className="w-full h-auto object-contain rounded-md border bg-white p-2"
                      />
                      <Textarea
                          defaultValue={diagramData.plantUmlCode}
                          rows={15}
                          className="bg-muted p-4 rounded-md overflow-x-auto text-sm text-left font-mono"
                          dir="ltr"
                          placeholder="PlantUML code..."
                      />
                  </AccordionContent>
              </AccordionItem>
            )
        })}
      </Accordion>
    </div>
  );
};
