
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
import ContentEditable from 'react-contenteditable';
import { cn } from '@/lib/utils/cn';
import { useEffect } from 'react';

export function ReportResults() {
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
        // The useGenerateTocLogic hook now handles updating the store on success.
        generateTocMutation.mutate({ projectDescription: project.projectDescription || '' });
    }
  };
  
  const handleTocChange = (evt: React.FocusEvent<HTMLDivElement>) => {
    const newMarkdown = evt.currentTarget.innerText;
    updateProject(p => {
        p.tableOfContentsMarkdown = newMarkdown;
    });
  }

  const tocMarkdown = project?.tableOfContentsMarkdown || '';

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
            
            {tocMarkdown && (
              <A4Page title="Table of Contents">
                 <ContentEditable
                    html={tocMarkdown.replace(/\n/g, '<br>')}
                    onBlur={handleTocChange}
                    className={cn("prose dark:prose-invert max-w-none outline-none focus:bg-primary/5 focus:shadow-inner p-1 rounded-md", 'whitespace-pre-wrap')}
                    tagName="div"
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
