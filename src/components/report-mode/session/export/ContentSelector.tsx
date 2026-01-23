'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Chapter, Section, type Project } from '@/lib/models';

interface ContentSelectorProps {
  project: Project | null;
  selectedContent: Set<string>;
  onToggleChapter: (chapterId: string) => void;
  onToggleSection: (sectionId: string) => void;
}

/**
 * ContentSelector Component
 * 
 * Displays project structure with checkboxes for content selection.
 */
export function ContentSelector({
  project,
  selectedContent,
  onToggleChapter,
  onToggleSection,
}: ContentSelectorProps) {
  if (!project?.content || project.content.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        No content available to export
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] border rounded-md p-4">
      <div className="space-y-4">
        {project.content.map((item) => {
          if (item instanceof Chapter) {
            const sectionIds = item.sections.map(s => s.id);
            const areAllSelected = sectionIds.every(id => selectedContent.has(id));
            const areSomeSelected = sectionIds.some(id => selectedContent.has(id));

            return (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={item.id}
                    checked={areAllSelected}
                    onCheckedChange={() => onToggleChapter(item.id)}
                    className={areSomeSelected && !areAllSelected ? 'data-[state=checked]:bg-muted' : ''}
                  />
                  <Label htmlFor={item.id} className="font-semibold cursor-pointer">
                    {item.title}
                  </Label>
                </div>
                <div className="ml-6 space-y-2">
                  {item.sections.map((section) => (
                    <div key={section.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={section.id}
                        checked={selectedContent.has(section.id)}
                        onCheckedChange={() => onToggleSection(section.id)}
                      />
                      <Label htmlFor={section.id} className="font-normal cursor-pointer">
                        {section.title}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            );
          } else if (item instanceof Section) {
            return (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox
                  id={item.id}
                  checked={selectedContent.has(item.id)}
                  onCheckedChange={() => onToggleSection(item.id)}
                />
                <Label htmlFor={item.id} className="font-normal cursor-pointer">
                  {item.title}
                </Label>
              </div>
            );
          }
          return null;
        })}
      </div>
    </ScrollArea>
  );
}
