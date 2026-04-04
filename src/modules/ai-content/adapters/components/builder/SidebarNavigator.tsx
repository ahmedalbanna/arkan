'use client';

import React from 'react';
import { SidebarSection } from './layout/SidebarSection';
import { SidebarOutlineManager } from './outline/SidebarOutlineManager';
import { SourceManager } from './file-manager/SourceManager';

/**
 * SidebarNavigator — Main structural navigation hub for the builder side panel.
 * Composes functional groups using the SidebarSection architecture.
 */

interface SidebarNavigatorProps {
  activeChapterId: string | null;
  selectedSectionIds: string[];
  onActiveChapterChange: (id: string | null) => void;
  onActiveSectionChange: (id: string | null, multiSelect?: boolean) => void;
}

export function SidebarNavigator({
  activeChapterId,
  selectedSectionIds,
  onActiveChapterChange,
  onActiveSectionChange,
}: SidebarNavigatorProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar -mx-5 -my-5">
      {/* Source Context Layer — High-Density Logic */}
      <SidebarSection title="Source Context" defaultOpen={true}>
        <SourceManager />
      </SidebarSection>

      {/* Structural Navigation Group */}
      <SidebarSection title="Project Architecture" defaultOpen={true}>
        <SidebarOutlineManager
          activeChapterId={activeChapterId}
          selectedSectionIds={selectedSectionIds}
          onActiveChapterChange={onActiveChapterChange}
          onActiveSectionChange={onActiveSectionChange}
        />
      </SidebarSection>
    </div>
  );
}
