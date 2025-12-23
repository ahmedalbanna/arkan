
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
import { useEffect, useMemo, useState } from 'react';
import { MenuBar } from './MenuBar';
import RichTextEditor from './RichTextEditor';


export function ReportResults() {
  const { t } = useLocalization();
  const { project, updateProject } = useBuilderStore();
  
  const fullMarkdownContent = useMemo(() => {
    return project?.fullMarkdownContent || '';
  }, [project]);
  
  const [localMarkdown, setLocalMarkdown] = useState(fullMarkdownContent);

  useEffect(() => {
    setLocalMarkdown(fullMarkdownContent);
  }, [fullMarkdownContent]);
  

  function handleContentChange(markdown: string) {
    if (!project) return;
    setLocalMarkdown(markdown);
    // Use the new method on the Project instance to update its structure
    const updatedProject = project.withContentFromMarkdown(markdown);
    // Directly update the store without causing a loop
    useBuilderStore.setState({ project: updatedProject, hasUnsavedChanges: true });
  }

  function renderContent() {
    return (
        <A4Page>
            <RichTextEditor
              key={project?.id} // Re-mount editor when project changes
              content={localMarkdown}
              onChange={handleContentChange}
            />
        </A4Page>
    );
  };

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
            <ScrollArea className="flex-grow">
              {renderContent()}
            </ScrollArea>
            <MenuBar />
        </CardContent>
    </Card>
  );
};
