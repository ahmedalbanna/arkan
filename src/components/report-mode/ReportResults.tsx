
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


export function ReportResults() {
  const { t } = useLocalization();
  const { project, setContentFromMarkdown } = useBuilderStore();

  // The handleContentChange function is no longer needed
  // as the logic is now handled inside the RichTextEditor component.

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
