
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
import { useState, useMemo } from 'react';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Files, File, ChevronLeft, ChevronRight } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils/cn';

type ViewMode = 'single' | 'carousel';

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
                        <ToggleGroupItem value="carousel" aria-label="Carousel view">
                            <Files className="h-4 w-4" />
                        </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent><p>Carousel View</p></TooltipContent>
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
  const slides = useMemo(() => fullContent.split('<!-- slide-break -->'), [fullContent]);

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
        {viewMode === 'single' ? (
          <ScrollArea className="flex-grow">
              <div className="py-4">
                  <CoverPage project={project} />
                  <A4Page>
                      <MarkdownEditor
                          key={project?.id}
                          content={fullContent}
                          onChange={handleContentChange}
                      />
                  </A4Page>
              </div>
          </ScrollArea>
        ) : (
          <Carousel className="w-full h-full flex-grow flex items-center justify-center px-16">
            <CarouselContent className="h-full">
                <CarouselItem key="cover-page">
                    <div className="p-1 h-full">
                        <A4Page viewMode="carousel" className="h-full">
                            <CoverPage project={project} />
                        </A4Page>
                    </div>
                </CarouselItem>
                {slides.map((slideContent, index) => (
                    <CarouselItem key={index}>
                        <div className="p-1 h-full">
                             <A4Page viewMode="carousel" className="h-full">
                                <MarkdownEditor
                                    key={`${project?.id}-slide-${index}`}
                                    content={slideContent}
                                    onChange={(changedContent) => {
                                        const newSlides = [...slides];
                                        newSlides[index] = changedContent;
                                        handleContentChange(newSlides.join('<!-- slide-break -->'));
                                    }}
                                />
                            </A4Page>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportResults;
