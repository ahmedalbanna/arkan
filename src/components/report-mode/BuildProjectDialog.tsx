'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBuilderStore } from '@/hooks';
import { Loader2, Building, AlertTriangle } from 'lucide-react';
import type { Project } from '@/lib/models';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BuildProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  selectedChapters: string[];
  selectedSections: Record<string, Set<string>>;
  onGenerateProject: () => void;
  isLoading: boolean;
}

export function BuildProjectDialog({
  isOpen,
  onOpenChange,
  project,
  selectedChapters,
  selectedSections,
  onGenerateProject,
  isLoading,
}: BuildProjectDialogProps) {
  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Confirm Project Build</DialogTitle>
          <DialogDescription>
            You are about to generate content for the selected chapters and sections. Please confirm the details below.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <h4 className="font-semibold">Summary of Generation Plan:</h4>
          {selectedChapters.length > 0 ? (
             <ScrollArea className="h-64 border rounded-md p-4">
                <ul className="space-y-3">
                    {selectedChapters.map(chapterId => {
                        const chapter = project.getChapter(chapterId);
                        if (!chapter) return null;
                        const chapterSelectedSections = chapter.sections.filter(s => selectedSections[chapterId]?.has(s.id));
                        return (
                            <li key={chapterId}>
                                <p className="font-semibold">{chapter.title}</p>
                                <ul className="pl-6 mt-1 space-y-1 list-disc list-inside text-sm text-muted-foreground">
                                    {chapterSelectedSections.length > 0 ? (
                                        chapterSelectedSections.map(section => (
                                            <li key={section.id}>{section.title}</li>
                                        ))
                                    ) : (
                                        <li className="text-orange-500 italic">No sections selected in this chapter. It will be skipped.</li>
                                    )}
                                </ul>
                            </li>
                        )
                    })}
                </ul>
            </ScrollArea>
          ) : (
             <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
                <p>No chapters selected for the build.</p>
            </div>
          )}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4"/>
            <AlertDescription>
              This action will consume credits for each section generated. The exact cost depends on the complexity and number of sections.
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onGenerateProject} disabled={isLoading || selectedChapters.length === 0}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Building className="mr-2 h-4 w-4" />
            )}
            Confirm and Build Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
