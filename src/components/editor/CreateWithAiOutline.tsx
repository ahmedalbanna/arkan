
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';
import { GeneratePresentationOutlineOutput } from '@/ai/flows/generate-presentation-outline';
import { ScrollArea } from '../ui/scroll-area';
import { CreateWithAiTemplates } from './CreateWithAiTemplates';

interface OutlineItemProps {
  item: GeneratePresentationOutlineOutput['outline'][0];
  level?: number;
}

const OutlineItem = ({ item, level = 0 }: OutlineItemProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div style={{ paddingLeft: `${level * 1.5}rem` }}>
      <div className="flex items-center gap-2 py-1">
        {hasChildren ? (
          <button onClick={() => setIsOpen(!isOpen)} className="p-1 -ml-1">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <div className="w-6 h-6" />
        )}
        <h4 className="font-semibold">{item.title}</h4>
      </div>
      {isOpen && hasChildren && (
        <div>
          {item.children?.map((child, index) => (
            <OutlineItem key={index} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export function CreateWithAiOutline({
  outline,
  onBack,
}: {
  outline: GeneratePresentationOutlineOutput;
  onBack: () => void;
}) {
    const [view, setView] = useState<'outline' | 'templates'>('outline');
    
    if (view === 'templates') {
        return <CreateWithAiTemplates outline={outline} onBack={() => setView('outline')} />;
    }

  return (
    <Card className="absolute right-0 top-0 bottom-0 w-80 bg-white z-20 shadow-lg flex flex-col rounded-none border-l">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-base font-semibold">Review Outline</CardTitle>
        <CardDescription className="text-sm">Review the generated outline below. You can make edits later.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 flex-grow overflow-hidden">
        <ScrollArea className="h-full">
            <div className="space-y-2">
                {outline.outline.map((item, index) => (
                    <OutlineItem key={index} item={item} />
                ))}
            </div>
        </ScrollArea>
      </CardContent>
      <div className="p-4 border-t flex flex-col gap-2">
        <Button onClick={() => setView('templates')}>
            <Check className="w-4 h-4 mr-2" />
            Create Presentation
        </Button>
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
      </div>
    </Card>
  );
}
