
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
import { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Files, File } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';

type ViewMode = 'single' | 'continuous';

function ViewOptions({ viewMode, setViewMode }: { viewMode: ViewMode, setViewMode: (mode: ViewMode) => void }) {
    return (
        <TooltipProvider>
            <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(value: ViewMode) => value && setViewMode(value)}
                size="sm"
            >
                <Tooltip>
                    <TooltipTrigger asChild>
                        <ToggleGroupItem value="single" aria-label="Single page view">
                            <File className="h-4 w-4" />
                        </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent><p>Single Page View</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <ToggleGroupItem value="continuous" aria-label="Continuous scroll view">
                            <Files className="h-4 w-4" />
                        </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent><p>Continuous Scroll View</p></TooltipContent>
                </Tooltip>
            </ToggleGroup>
        </TooltipProvider>
    );
}


const ReportResults = () => {
  const { t } = useLocalization();
  const { project, updateProjectFromMarkdown } = useBuilderStore();
  const [viewMode, setViewMode] = useState<ViewMode>('single');

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
           <ViewOptions viewMode={viewMode} setViewMode={setViewMode} />
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col p-0 bg-slate-200 dark:bg-slate-900/50 min-h-0">
        <ScrollArea className="flex-grow">
            <div className={viewMode === 'continuous' ? 'py-4' : ''}>
                <CoverPage project={project} />
                <A4Page viewMode={viewMode}>
                    <MarkdownEditor
                        key={project?.id} // Add a key to force re-mount when project changes
                        content={fullContent}
                        onChange={handleContentChange}
                    />
                </A4Page>
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ReportResults;
