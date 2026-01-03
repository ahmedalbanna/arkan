
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
import { useBuilderStore } from '@/hooks';
import RichTextEditor from './RichTextEditor';
import { CoverPage } from '../shared/CoverPage';
import { Button } from '../ui/button';
import { ListTree } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { markdownComponents } from '@/lib/utils/markdown-styles';
import ContentEditable from 'react-contenteditable';
import { cn } from '@/lib/utils/cn';

export function ReportResults() {
  const { t } = useLocalization();
  const { project, setContentFromMarkdown, updateProject } = useBuilderStore();

  const handleGenerateToc = () => {
    if (project) {
      updateProject(p => p.generateTableOfContents());
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
              <Button onClick={handleGenerateToc} variant="outline">
                <ListTree className="mr-2 h-4 w-4" />
                Generate Table of Contents
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

