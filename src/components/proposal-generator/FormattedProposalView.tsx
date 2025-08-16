

'use client';

import React from 'react';
import { type AnyProjectProposal } from '@/ai/schemas';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/markdown-components';
import remarkGfm from 'remark-gfm';
import { useLocalization } from '@/context/LocalizationContext';

interface FormattedProposalViewProps {
    proposal: AnyProjectProposal;
    onUpdate: (path: string, value: any) => void;
    readOnly?: boolean;
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-2">
        <h3 className="font-semibold text-lg text-primary/90">{title}</h3>
        <div className="pl-2 border-l-2 border-primary/20 prose dark:prose-invert max-w-none">{children}</div>
    </div>
);

export default function FormattedProposalView({ proposal }: FormattedProposalViewProps) {
    const { t } = useLocalization();
    if (!proposal) return null;
    
    // Ensure outcomes and criteria are arrays before mapping
    const expectedOutcomes = Array.isArray(proposal.expected_outcome) ? proposal.expected_outcome : [];
    const successCriteria = Array.isArray(proposal.success_criteria) ? proposal.success_criteria : [];

    return (
        <div className="space-y-6">
            <Section title={t('builder.proposalViewer.objective')}>
                <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{String(proposal?.objective || '')}</ReactMarkdown>
            </Section>

            <Separator />

            <Section title={t('builder.proposalViewer.methodology')}>
                <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{String(proposal?.methodology || '')}</ReactMarkdown>
            </Section>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Section title={t('builder.proposalViewer.outcomes')}>
                    <ul className="list-disc pl-5 space-y-1">
                        {expectedOutcomes.map((item: string, index: number) => (
                            <li key={index}>
                                <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{item}</ReactMarkdown>
                            </li>
                        ))}
                    </ul>
                </Section>
                <Section title={t('builder.proposalViewer.successCriteria')}>
                    <ul className="list-disc pl-5 space-y-1">
                        {successCriteria.map((item: string, index: number) => (
                            <li key={index}>
                                <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{item}</ReactMarkdown>
                            </li>
                        ))}
                    </ul>
                </Section>
            </div>

            <Separator />

            <Section title={t('builder.proposalViewer.evaluationPlan')}>
                <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{String(proposal?.evaluation || '')}</ReactMarkdown>
            </Section>

            <Separator />

            <Section title={t('builder.proposalViewer.timeline')}>
                <p><strong>{t('builder.proposalViewer.startDate')}</strong> {proposal.timeline?.startDate ? format(new Date(proposal.timeline.startDate), 'PPP') : 'N/A'}</p>
                <p><strong>{t('builder.proposalViewer.endDate')}</strong> {proposal.timeline?.endDate ? format(new Date(proposal.timeline.endDate), 'PPP') : 'N/A'}</p>
                <h4 className="font-medium mt-4">{t('builder.proposalViewer.phases')}</h4>
                <ul className="list-disc list-inside space-y-2">
                    {proposal.timeline?.phases?.map((phase: any, index: number) => (
                        <li key={`phase-${index}`}>
                            {`${phase.name} (${phase.durationWeeks} ${t('builder.proposalViewer.weeks')})`}
                        </li>
                    ))}
                </ul>
            </Section>

            <Separator />

            <Section title={t('builder.proposalViewer.budget')}>
                <p className="text-xl font-bold">{t('builder.proposalViewer.total')} {new Intl.NumberFormat('en-US', { style: 'currency', currency: proposal.budget?.currency || 'USD' }).format(proposal.budget?.totalAmount || 0)}</p>
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

            <Section title={t('builder.proposalViewer.stakeholders')}>
                {proposal.stakeholders?.map((stakeholder: any, index: number) => (
                    <div key={index} className="mb-4">
                        <div className="font-semibold">{stakeholder.name} <Badge variant="secondary">{stakeholder.role}</Badge></div>
                        <p className="text-sm text-muted-foreground pl-2">{stakeholder.interest}</p>
                    </div>
                ))}
            </Section>

            <Separator />

            <Section title={t('builder.proposalViewer.risks')}>
                {proposal.risks?.map((risk: any, index: number) => (
                    <div key={index} className="mb-4">
                        <div className="font-semibold">{t('builder.proposalViewer.risk')} {risk.description}</div>
                        <p className="text-sm text-muted-foreground pl-2">{t('builder.proposalViewer.mitigation')} {risk.mitigation}</p>
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
