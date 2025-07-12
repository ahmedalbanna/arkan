
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, ExternalLink, Loader2, Presentation } from 'lucide-react';
import type { ProjectDetail } from '@/lib/db/queries';
import { exportProposalAsDocx, exportReportAsDocx } from '@/lib/docx-exporter';
import { type TemplateKey, templates } from '@/lib/docx-styles';
import { type ProjectProposal, ProjectProposalSchema, type SectionName, type DiagramType, type PresentationSlide } from '@/ai/schemas';
import PresentationViewer from './PresentationViewer';
import { useToast } from '@/hooks/use-toast';

interface ProjectActionsProps {
  project: NonNullable<ProjectDetail>;
}

export default function ProjectActions({ project }: ProjectActionsProps) {
  const [isDownloadingProposal, setIsDownloadingProposal] = useState(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const [isGeneratingPresentation, setIsGeneratingPresentation] = useState(false);
  const [presentationSlides, setPresentationSlides] = useState<PresentationSlide[] | null>(null);
  const [showPresentation, setShowPresentation] = useState(false);
  const { toast } = useToast();

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

  const handleGeneratePresentation = async () => {
    if (!proposal) {
        toast({
            title: "Proposal Data Missing",
            description: "Cannot generate a presentation without a project proposal.",
            variant: "destructive"
        });
        return;
    };
    setIsGeneratingPresentation(true);
    try {
        const response = await fetch('/api/generate-presentation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                proposal,
                sections: reportSections,
                diagrams: reportDiagrams ? Object.fromEntries(Object.entries(reportDiagrams).map(([key, value]) => [key, value.plantUmlCode])) : undefined
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to generate presentation");
        }
        
        const result = await response.json();
        setPresentationSlides(result.slides);
        setShowPresentation(true);
        toast({
            title: "Presentation Generated!",
            description: "Your presentation is ready to be viewed.",
        });

    } catch (error) {
        console.error("Presentation generation failed:", error);
        toast({
            title: "Generation Failed",
            description: error instanceof Error ? error.message : "An unknown error occurred.",
            variant: "destructive"
        });
    } finally {
        setIsGeneratingPresentation(false);
    }
  };

  const hasReportContent = !!(reportSections && Object.keys(reportSections).length > 0) || !!(reportDiagrams && Object.keys(reportDiagrams).length > 0);
  const canGeneratePresentation = !!proposal;

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
          <Button onClick={handleGeneratePresentation} disabled={isGeneratingPresentation || !canGeneratePresentation} className="w-full font-headline" variant="secondary">
            {isGeneratingPresentation ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Presentation className="ml-2 h-4 w-4" />}
            Generate Presentation
          </Button>
        </CardContent>
      </Card>
      {presentationSlides && (
        <PresentationViewer
            isOpen={showPresentation}
            onOpenChange={setShowPresentation}
            slides={presentationSlides}
        />
      )}
    </>
  );
}
