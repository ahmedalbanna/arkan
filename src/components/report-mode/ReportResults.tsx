
'use client';

import A4Page from '@/components/shared/A4Page';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalization } from '@/context/LocalizationContext';
import { useBuilderStore, useGenerateTocLogic } from '@/hooks';
import MarkdownEditor from './MarkdownEditor';
import { CoverPage } from '../shared/CoverPage';
import { Button } from '../ui/button';
import { ListTree, Loader2 } from 'lucide-react';
import React, { useEffect, useMemo } from 'react';
import { Chapter, TocSection } from '@/lib/models';
import { parseMarkdownToContent } from '@/hooks/util/useMarkdownParser';


const ReportResults = React.memo(function ReportResults() {
  const { t } = useLocalization();
  const { project, updateProject, setContentFromMarkdown, applyTableOfContents } = useBuilderStore();
  const { form, mutation: generateTocMutation, results: tocResults } = useGenerateTocLogic();

  // Effect to automatically generate TOC if project description exists but TOC is empty
  useEffect(() => {
    if (project?.projectDescription && project.content.length === 0) {
      form.setValue('projectDescription', project.projectDescription);
      // Automatically trigger generation if description is present and content is empty
      // onSubmit({ projectDescription: project.projectDescription });
    }
  }, [project?.projectDescription, project?.content.length, form]);

  useEffect(() => {
    if (tocResults?.tableOfContents) {
        applyTableOfContents(tocResults.tableOfContents);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tocResults]);
  
  const handleGenerateToc = () => {
    if (project && project.projectDescription) {
        form.handleSubmit(onSubmit)();
    }
  };

  const onSubmit = (data: {projectDescription: string}) => {
    generateTocMutation.mutate(data);
  };
  
  const handleTocChange = (newMarkdown: string) => {
    updateProject(p => {
        if (!p) return;
        // When TOC changes, we parse it to update the *structure* of the project content.
        // We pass `true` for isToc to indicate only structure should be parsed, preserving content.
        const newContent = parseMarkdownToContent(newMarkdown, p.content, true);
        p.content = newContent;
    });
  }

  // Dynamically generate TOC markdown from the project structure
  const tocMarkdown = useMemo(() => {
    if (!project || project.content.length === 0) return '';
    
    let markdown = '';
    project.content.forEach((item) => {
      if (item instanceof Chapter) {
        markdown += `# ${item.title}\\n`;
        item.sections.forEach((section) => {
          markdown += `  - ${section.title}\\n`;
        });
      } else { // It's a top-level section without a chapter
        markdown += `# ${item.title}\\n`;
      }
      markdown += '\\n';
    });
    return markdown.trim();
  }, [project]);
  

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="font-headline">
              {t('builder.reportGenerator.resultsTitle')}
            </CardTitle>
            <CardDescription>
              {t('builder.reportGenerator.resultsDesc')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col p-0 bg-slate-200 dark:bg-slate-900/50 min-h-0">
        <ScrollArea className="flex-grow ">
            <CoverPage project={project} />

            <div className="flex justify-center my-4">
              <Button onClick={handleGenerateToc} variant="outline" disabled={generateTocMutation.isPending || !project?.projectDescription}>
                {generateTocMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ListTree className="mr-2 h-4 w-4" />}
                {project && project.content.length > 0 ? 'Regenerate Table of Contents' : 'Generate Table of Contents'}
              </Button>
            </div>
            
            {(project && project.content.length > 0) && (
              <A4Page title="Table of Contents">
                 <MarkdownEditor
                    key={`toc-editor-${project.id}`}
                    content={tocMarkdown}
                    onChange={handleTocChange}
                    isToc={true}
                    editorClassName="prose-h1:text-xl prose-h1:font-bold prose-ul:list-none prose-ul:pl-0 prose-li:pl-6 prose-p:text-base"
                  />
              </A4Page>
            )}

            <A4Page>
                <MarkdownEditor
                    key={`content-editor-${project.id}`}
                    content={project?.fullMarkdownContent || ''}
                    onChange={setContentFromMarkdown}
                />
            </A4Page>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});

export default ReportResults;
