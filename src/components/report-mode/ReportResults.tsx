
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
import { useEffect, useState } from 'react';
import { MenuBar } from '@/lib/editor/MenuBar';
import RichTextEditor from './RichTextEditor';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookCopy, BookOpenText } from 'lucide-react';
import { CoverPage } from '../shared/CoverPage';


export function ReportResults() {
  const { t } = useLocalization();
  const { project, updateProject, activeView, setActiveView } = useBuilderStore();

  const [currentMarkdown, setCurrentMarkdown] = useState('');

  // Effect to update local state when global state changes
  useEffect(() => {
    if (project) {
        if (activeView === 'report-content') {
            setCurrentMarkdown(project.fullMarkdownContent || '');
        } else if (activeView === 'cover-page') {
            setCurrentMarkdown(project.coverPageMarkdown || '');
        }
    }
  }, [project, activeView]);

  function handleContentChange(markdown: string) {
    if (!project) return;
    if (activeView === 'report-content') {
        updateProject(p => p.withContentFromMarkdown(markdown));
    } else if (activeView === 'cover-page') {
        updateProject(p => p.with({ coverPageMarkdown: markdown }));
    }
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="font-headline">
              {activeView === 'cover-page' ? 'Cover Page' : t('builder.reportGenerator.resultsTitle')}
            </CardTitle>
            <CardDescription>
              {activeView === 'cover-page' ? 'A preview of your project\'s cover page.' : t('builder.reportGenerator.resultsDesc')}
            </CardDescription>
          </div>
           <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
              <TabsList>
                  <TabsTrigger value="cover-page"><BookCopy className="w-4 h-4 mr-2"/> Cover Page</TabsTrigger>
                  <TabsTrigger value="report-content"><BookOpenText className="w-4 h-4 mr-2"/>Report Content</TabsTrigger>
              </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col p-0 bg-slate-200 dark:bg-slate-900/50 min-h-0">
        <ScrollArea className="flex-grow ">
            {activeView === 'cover-page' ? (
                 <CoverPage project={project} />
            ) : (
                <A4Page>
                    <RichTextEditor
                    key={`${project?.id}-${activeView}`} // Re-mount editor when view or project changes
                    content={currentMarkdown}
                    onChange={handleContentChange}
                    />
                </A4Page>
            )}
        </ScrollArea>
        {activeView === 'report-content' && <MenuBar />}
      </CardContent>
    </Card>
  );
};
