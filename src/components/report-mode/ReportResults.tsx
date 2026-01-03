
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
import RichTextEditor from './RichTextEditor';
import { CoverPage } from '../shared/CoverPage';
import { Button } from '../ui/button';
import { ListTree, Loader2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Chapter } from '@/lib/models';


export default function ReportResults() {
  const { t } = useLocalization();
  const { project, setContentFromMarkdown, updateProject } = useBuilderStore();
  const { form, mutation: generateTocMutation } = useGenerateTocLogic();

  useEffect(() => {
    if (project?.projectDescription) {
      form.setValue('projectDescription', project.projectDescription);
    }
  }, [project?.projectDescription, form]);
  
  const handleGenerateToc = () => {
    if (project) {
        generateTocMutation.mutate({ projectDescription: project.projectDescription || '' });
    }
  };
  
  const handleTocChange = (newMarkdown: string) => {
    updateProject(p => {
        p.tableOfContentsMarkdown = newMarkdown;
    });
  }

  // Dynamically generate TOC from project structure
  const tocMarkdown = useMemo(() => {
    if (!project || project.content.length === 0) return '';
    
    let markdown = '';
    project.content.forEach((item) => {
      if (item instanceof Chapter) {
        markdown += `# ${item.title}\n`;
        item.sections.forEach((section) => {
          markdown += `  - ${section.title}\n`;
        });
      } else { // It's a top-level section
        markdown += `# ${item.title}\n`;
      }
      markdown += '\n';
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
              <Button onClick={handleGenerateToc} variant="outline" disabled={generateTocMutation.isPending}>
                {generateTocMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ListTree className="mr-2 h-4 w-4" />}
                {tocMarkdown ? 'Regenerate Table of Contents' : 'Generate Table of Contents'}
              </Button>
            </div>
            
            {(tocMarkdown || generateTocMutation.isPending) && (
              <A4Page title="Table of Contents">
                 <RichTextEditor
                    content={tocMarkdown}
                    onChange={handleTocChange}
                    editorClassName="prose-h1:text-xl prose-h1:font-bold prose-h2:text-base prose-h2:font-semibold prose-p:text-base prose-p:ml-4"
                  />
              </A4Page>
            )}

            <A4Page>
                <RichTextEditor
                content={project?.fullMarkdownContent || ''}
                onChange={setContentFromMarkdown}
                />
            </A4Page>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
