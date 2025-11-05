
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { PanelLeftClose, ListPlus } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { Button } from '../ui/button';
import { useBuilderStore } from '@/hooks';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from '@/hooks';

interface GenerationToolsProps {
  onCollapseToggle: () => void;
}

export const GenerationTools = ({
  onCollapseToggle,
}: GenerationToolsProps) => {
  const { t } = useLocalization();
  const { project, updateProject } = useBuilderStore();
  const [tocText, setTocText] = useState('');

  const handleCreateSections = () => {
    if (!tocText.trim()) {
        toast({
            title: "Table of Contents is empty",
            description: "Please paste the section titles into the text area.",
            variant: "destructive",
        });
        return;
    }

    const sectionTitles = tocText.split('\n').map(title => title.trim()).filter(title => title);

    updateProject(p => {
        sectionTitles.forEach(title => {
            const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            // Check if section with this ID already exists to avoid duplicates
            if (!p.sections?.some(s => s.id === id)) {
                 p.addCustomSection(id, title);
            }
        });
    });

    toast({
        title: "Sections Created",
        description: `${sectionTitles.length} sections have been added to your project.`,
    });
    setTocText('');
  };

  return (
    <Card className={cn("flex flex-col h-full")}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="font-headline">{t('builder.reportGenerator.toolsTitle')}</CardTitle>
            <CardDescription>{t('builder.reportGenerator.toolsDesc')}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={onCollapseToggle}>
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
          <div className="space-y-2 flex-grow flex flex-col">
              <Label htmlFor="toc-input">Table of Contents</Label>
              <Textarea
                id="toc-input"
                value={tocText}
                onChange={(e) => setTocText(e.target.value)}
                placeholder={"Introduction\nSystem Analysis\nSystem Design\nConclusion..."}
                className="flex-grow resize-none"
              />
          </div>
          <Button onClick={handleCreateSections} className="w-full">
            <ListPlus className="me-2 h-4 w-4" />
            Create Sections from ToC
          </Button>
      </CardContent>
    </Card>
  );
};
