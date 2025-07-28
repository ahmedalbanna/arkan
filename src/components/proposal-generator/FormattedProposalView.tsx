'use client';

import React from 'react';
import { type AnyProjectProposal } from '@/ai/schemas';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { EditableContent } from '../EditableContent';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';

interface FormattedProposalViewProps {
  proposal: AnyProjectProposal;
  onUpdate: (path: string, value: any) => void;
  readOnly?: boolean;
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-2">
        <h3 className="font-semibold text-lg text-primary/90">{title}</h3>
        <div className="pl-2 border-l-2 border-primary/20">{children}</div>
    </div>
);

export default function FormattedProposalView({ proposal, onUpdate, readOnly }: FormattedProposalViewProps) {
    if (!proposal) return null;

    const handleUpdate = (path: string) => (newValue: any) => {
        onUpdate(path, newValue);
    };

    return (
        <div className="space-y-6">
            <Section title="Objective">
                <EditableContent value={proposal.objective} onUpdate={handleUpdate('objective')} multiline readOnly={readOnly} />
            </Section>
            
            <Separator />

            <Section title="Methodology">
                <EditableContent value={proposal.methodology} onUpdate={handleUpdate('methodology')} multiline readOnly={readOnly} />
            </Section>

             <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Section title="Expected Outcomes">
                    <ul className="list-disc list-inside space-y-2">
                        {proposal.expected_outcome?.map((item: string, index: number) => (
                            <li key={index}>
                                <EditableContent value={item} onUpdate={handleUpdate(`expected_outcome.${index}`)} readOnly={readOnly} />
                            </li>
                        ))}
                    </ul>
                </Section>
                <Section title="Success Criteria">
                     <ul className="list-disc list-inside space-y-2">
                        {proposal.success_criteria?.map((item: string, index: number) => (
                            <li key={index}>
                                <EditableContent value={item} onUpdate={handleUpdate(`success_criteria.${index}`)} readOnly={readOnly} />
                            </li>
                        ))}
                    </ul>
                </Section>
            </div>
            
             <Separator />

            <Section title="Evaluation">
                <EditableContent value={proposal.evaluation} onUpdate={handleUpdate('evaluation')} multiline readOnly={readOnly} />
            </Section>
            
             <Separator />

            <Section title="Timeline">
                <p><strong>Start Date:</strong> {proposal.timeline?.startDate ? format(new Date(proposal.timeline.startDate), 'PPP') : 'N/A'}</p>
                <p><strong>End Date:</strong> {proposal.timeline?.endDate ? format(new Date(proposal.timeline.endDate), 'PPP') : 'N/A'}</p>
                <h4 className="font-medium mt-4">Phases:</h4>
                 <ul className="list-disc list-inside space-y-2">
                    {proposal.timeline?.phases?.map((phase: any, index: number) => (
                        <li key={index}>
                            <EditableContent 
                                value={`${phase.name} (${phase.durationWeeks} weeks)`} 
                                onUpdate={(val) => {
                                    // Basic parsing, would need more robust logic for complex edits
                                    const nameMatch = val.match(/^(.*)\s\(/);
                                    const durationMatch = val.match(/\((\d+)\sweeks\)/);
                                    if(nameMatch) onUpdate(`timeline.phases.${index}.name`, nameMatch[1]);
                                    if(durationMatch) onUpdate(`timeline.phases.${index}.durationWeeks`, parseInt(durationMatch[1]));
                                }} 
                                readOnly={readOnly} 
                            />
                        </li>
                    ))}
                </ul>
            </Section>
            
             <Separator />

            <Section title="Budget">
                 <p className="text-xl font-bold">Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency: proposal.budget?.currency || 'USD' }).format(proposal.budget?.totalAmount || 0)}</p>
                 <div className="space-y-1 mt-2">
                    {proposal.budget?.breakdown?.map((item: any, index: number) => (
                       <div key={index} className="flex justify-between">
                           <span>{item.item}</span>
                           <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: proposal.budget?.currency || 'USD' }).format(item.cost || 0)}</span>
                       </div>
                    ))}
                 </div>
            </Section>
            
            <Separator />
            
             <Section title="Stakeholders">
                {proposal.stakeholders?.map((stakeholder: any, index: number) => (
                    <div key={index} className="mb-4">
                        <p className="font-semibold">{stakeholder.name} <Badge variant="secondary">{stakeholder.role}</Badge></p>
                        <p className="text-sm text-muted-foreground pl-2">{stakeholder.interest}</p>
                    </div>
                ))}
            </Section>

            <Separator />

             <Section title="Risks and Mitigations">
                {proposal.risks?.map((risk: any, index: number) => (
                    <div key={index} className="mb-4">
                        <p className="font-semibold">Risk: {risk.description}</p>
                        <p className="text-sm text-muted-foreground pl-2">Mitigation: {risk.mitigation}</p>
                    </div>
                ))}
            </Section>
             <Separator />
             <div className="flex flex-wrap gap-2">
                {proposal.tags?.map((tag: string) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
            </div>

        </div>
    );
}