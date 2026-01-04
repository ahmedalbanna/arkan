

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
import MarkdownEditor from './MarkdownEditor';

const ReportResults = () => {
  const { t } = useLocalization();
  const { project, updateProjectFromMarkdown } = useBuilderStore();

  const handleContentChange = (newMarkdown: string) => {
    updateProjectFromMarkdown(newMarkdown);
  };
  
  const fullContent = project?.fullMarkdownContent || '';

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
            <A4Page>
                <MarkdownEditor
                    key={project?.id} // Add a key to force re-mount when project changes
                    content={fullContent}
                    onChange={handleContentChange}
                />
            </A4Page>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ReportResults;
