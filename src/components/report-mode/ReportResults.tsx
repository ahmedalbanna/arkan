'use client';

import { A4Page } from '@/components/shared/A4Page';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore } from '@/hooks';
import MarkdownEditor from './MarkdownEditor';
import { CoverPage } from '../shared/CoverPage';
import { BookOpenCheck, Brush, LayoutList, Bot, FileVideo, FileText, ChevronDown, Lightbulb, History } from 'lucide-react';
import { TableOfContentForm } from './TableOfContentForm';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../ui/button';
import { FileContentViewer } from './file-manager/FileContentViewer';

const ReportSteps = () => {
  const { t } = useLocalization();

  const steps = [
    {
      icon: <FileVideo className="h-6 w-6 text-primary" />,
      title: "1. Customize Cover Page",
      description: "Click on the text on the cover page to edit your project's title, description, and author details directly."
    },
    {
      icon: <LayoutList className="h-6 w-6 text-primary" />,
      title: "2. Insert Table of Contents",
      description: "Use the 'Add Chapter' button or paste a structure in the 'Generation Tools' to create your document's outline."
    },
    {
      icon: <Bot className="h-6 w-6 text-primary" />,
      title: "3. AI Generate Project Template",
      description: "Apply a pre-defined template to structure your report and generate content for all sections with a single click."
    },
    {
      icon: <Brush className="h-6 w-6 text-primary" />,
      title: "4. Customize Generation Tools",
      description: "For each section, expand it to edit the AI prompt, add guidelines, and select context from other sections or files."
    },
    {
      icon: <BookOpenCheck className="h-6 w-6 text-primary" />,
      title: "5. View Chapter and Section",
      description: "Generate content by clicking the 'Generate' button on any section and review the results as they appear in the editor."
    }
  ];

  return (
    <div className="p-8">
      <div className="text-center mb-10">
        <h3 className="text-xl font-semibold font-headline">{t('builder.reportGenerator.emptyStateTitle')}</h3>
        <p className="text-muted-foreground">{t('builder.reportGenerator.emptyStateDesc')}</p>
      </div>
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
              {step.icon}
            </div>
            <div>
              <h4 className="font-semibold">{step.title}</h4>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ReportResultsProps {
    activePanelKey: string;
}

const ReportResults = ({ activePanelKey }: ReportResultsProps) => {
  const { t } = useLocalization();
  const { project, version, updateProjectFromMarkdown, selectedFileId } = useBuilderStore();
  const [isSuggestionVisible, setIsSuggestionVisible] = useState(true);

  const handleContentChange = (newMarkdown: string) => {
    updateProjectFromMarkdown(newMarkdown);
  };
  
  const hasContent = project?.content && project.content.length > 0;

  // Logic for suggestions
  const getSuggestion = () => {
    if (!project || !project.sections) return "Start by adding a chapter or applying a template.";
    const emptySection = project.sections.find(s => !s.content);
    if (emptySection) {
        return `Suggestion: Try generating the "${emptySection.title}" section next.`;
    }
    return "All sections have content. You can now review or export your document.";
  };
  const suggestion = getSuggestion();

  const renderContent = () => {
    switch (activePanelKey) {
        case 'settings':
            return <CoverPage project={project} />;
        case 'templates':
             return (
                <A4Page>
                    <TableOfContentForm />
                </A4Page>
            );
        case 'files': {
            const selectedFile = project?.externalContext.find(f => f.id === selectedFileId);

            if (!selectedFile) {
                return (
                    <A4Page>
                        <div className="p-8 text-center text-muted-foreground h-full flex flex-col justify-center items-center">
                            <FileText className="mx-auto h-16 w-16 mb-4" />
                            <h3 className="text-xl font-semibold font-headline text-foreground">File Content Viewer</h3>
                            <p className="mt-2">When you select a file from the manager, its content will be displayed here for review and analysis.</p>
                        </div>
                    </A4Page>
                );
            }

            return (
                <A4Page>
                    <FileContentViewer fileName={selectedFile.fileName} content={selectedFile.content} />
                </A4Page>
            );
        }
        case 'generate':
        default:
             if (hasContent) {
                 return (
                    <A4Page>
                        <MarkdownEditor
                            key={version} // Re-mount editor when version changes
                            content={project?.fullMarkdownContent || ''}
                            onChange={handleContentChange}
                        />
                    </A4Page>
                 )
             }
             return (
                <div className="max-w-[210mm] mx-auto my-4">
                    <ReportSteps />
                </div>
             )
    }
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <Collapsible open={isSuggestionVisible} onOpenChange={setIsSuggestionVisible} className="border-b">
        <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                <div>
                    <CardTitle className="font-headline text-lg">
                      {t('builder.reportGenerator.resultsTitle')}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {t('builder.reportGenerator.resultsDesc')}
                    </CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0">
                    <ChevronDown className={`h-4 w-4 transition-transform ${isSuggestionVisible ? '' : '-rotate-90'}`} />
                    <span className="sr-only">Toggle suggestions</span>
                </Button>
            </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
            <div className="p-4 border-t bg-muted/30 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">Suggestion:</span>
                    <span className="text-muted-foreground">{suggestion}</span>
                </div>
                {project?.meta.updated && (
                    <div className="flex items-center gap-2 text-sm">
                        <History className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold">Last operation:</span>
                        <span className="text-muted-foreground">
                            Project updated {formatDistanceToNow(new Date(project.meta.updated), { addSuffix: true })}
                        </span>
                    </div>
                )}
            </div>
        </CollapsibleContent>
      </Collapsible>

      <CardContent className="flex-grow flex flex-col p-0 bg-slate-200 dark:bg-slate-900/50 min-h-0">
          <ScrollArea className="flex-grow">
              <div className="py-4">
                  {renderContent()}
              </div>
          </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ReportResults;
