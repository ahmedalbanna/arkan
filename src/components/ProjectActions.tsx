
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, ExternalLink, Loader2 } from 'lucide-react';
import type { ProjectDetail } from '@/lib/db/queries';
import { exportProposalAsDocx, exportReportAsDocx } from '@/lib/docx-exporter';
import { type TemplateKey, templates } from '@/lib/docx-styles';
import { type ProjectProposal, ProjectProposalSchema, type SectionName, type DiagramType } from '@/ai/schemas';

interface ProjectActionsProps {
  project: NonNullable<ProjectDetail>;
}

export default function ProjectActions({ project }: ProjectActionsProps) {
  const [isDownloadingProposal, setIsDownloadingProposal] = useState(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  
  let proposal: ProjectProposal | null = null;
  if (project.proposalData) {
    try {
      proposal = ProjectProposalSchema.parse(JSON.parse(project.proposalData));
    } catch (e) {
      console.error("Failed to parse proposal data for actions:", project.id, e);
    }
  }

  let reportSections: { [key in SectionName]?: string; } | null = null;
  if (project.reportSections) {
    try {
      reportSections = JSON.parse(project.reportSections);
    } catch (e) {
      console.error("Failed to parse report sections for actions:", project.id, e);
    }
  }

  let reportDiagrams: { [key in DiagramType]?: { plantUmlCode: string; imageUrl: string; } } | null = null;
  if (project.reportDiagrams) {
    try {
      reportDiagrams = JSON.parse(project.reportDiagrams);
    } catch (e) {
      console.error("Failed to parse report diagrams for actions:", project.id, e);
    }
  }

  const handleDownloadProposal = async () => {
    if (!proposal) return;
    setIsDownloadingProposal(true);
    const templateKey = (localStorage.getItem('arkan-docx-template') as TemplateKey) || 'modern';
    const template = templates[templateKey] || templates.modern;
    await exportProposalAsDocx(proposal, template.styles);
    setIsDownloadingProposal(false);
  };

  const handleDownloadReport = async () => {
    if (!reportSections && !reportDiagrams) return;
    setIsDownloadingReport(true);
    const templateKey = (localStorage.getItem('arkan-docx-template') as TemplateKey) || 'modern';
    const template = templates[templateKey] || templates.modern;
    await exportReportAsDocx(reportSections || {}, reportDiagrams || {}, project.title, template.styles);
    setIsDownloadingReport(false);
  };

  const hasReportContent = !!(reportSections && Object.keys(reportSections).length > 0) || !!(reportDiagrams && Object.keys(reportDiagrams).length > 0);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {project.liveLink && (
            <Button asChild className="w-full font-headline" size="lg">
              <a href={project.liveLink} target="_blank" rel="noopener noreferrer">
                View Live Project <ExternalLink className="mr-2 rtl:mr-0 rtl:ml-2 h-5 w-5" />
              </a>
            </Button>
          )}
          {proposal && (
            <Button onClick={handleDownloadProposal} disabled={isDownloadingProposal} className="w-full font-headline" variant="secondary">
              {isDownloadingProposal ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Download className="ml-2 h-4 w-4" />}
              Download Proposal
            </Button>
          )}
          {hasReportContent && (
            <Button onClick={handleDownloadReport} disabled={isDownloadingReport} className="w-full font-headline" variant="secondary">
              {isDownloadingReport ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Download className="ml-2 h-4 w-4" />}
              Download Full Report
            </Button>
          )}
        </CardContent>
      </Card>
    </>
  );
}
