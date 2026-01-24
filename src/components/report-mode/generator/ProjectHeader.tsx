'use client';

import { Input } from '@/components/ui/input';
import type { Project } from '@/lib/models';
import { formatDistanceToNow } from 'date-fns';
import { SessionActions } from '../session/SessionActions';

interface ProjectHeaderProps {
  project: Project | null;
  onNameChange: (name: string) => void;
  onBlur: () => void;
  isSaving: boolean;
}

/**
 * ProjectHeader Component
 *
 * Displays project name input, last updated timestamp, and session actions.
 */
export function ProjectHeader({ project, onNameChange, onBlur, isSaving }: ProjectHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-4 gap-4 max-w-full">
      <div className="flex-1 space-y-2 overflow-auto">
        <Input
          className="text-xl font-semibold text-foreground border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto bg-transparent"
          value={project?.name || ''}
          onChange={(e) => onNameChange(e.target.value)}
          onBlur={onBlur}
          placeholder="Untitled Project"
        />
        {project?.meta.updated && (
          <p className="text-xs text-muted-foreground pt-1">
            Updated {formatDistanceToNow(new Date(project.meta.updated), { addSuffix: true })}
          </p>
        )}
      </div>
      <div className="flex-none">
        <SessionActions isSaving={isSaving} />
      </div>
    </div>
  );
}
