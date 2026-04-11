'use client';

import { Input } from '@/components/ui/input';
import { useMobile } from '@/hooks/util/use-mobile';
import { debounce } from 'lodash';
import { Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { SourceManager } from './file-manager/SourceManager';
import { SidebarSection } from './layout/SidebarSection';
import { SidebarOutlineManager } from './outline/SidebarOutlineManager';

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
  const isMobile = useMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<any>(null);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Desktop keyboard shortcuts for navigation
  useEffect(() => {
    if (isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.getElementById('sidebar-search')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobile]);

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar -mx-5 -my-5">
      {/* Search Bar - Desktop only */}
      {!isMobile && (
        <div className="px-5 pt-3 pb-2 border-b border-primary/5">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40" />
            <Input
              id="sidebar-search"
              placeholder="Search sections... (⌘F)"
              className="h-7 text-xs pl-7 bg-primary/5 border-primary/10 rounded-md"
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Source Context Layer */}
      <SidebarSection
        title="Source Context"
        defaultOpen={true}
        sectionId="source-context"
        persistState={!isMobile}
      >
        <SourceManager searchQuery={searchQuery} />
      </SidebarSection>

      {/* Structural Navigation Group */}
      <SidebarSection
        title="Project Architecture"
        defaultOpen={true}
        sectionId="project-architecture"
        persistState={!isMobile}
      >
        <SidebarOutlineManager
          activeChapterId={activeChapterId}
          selectedSectionIds={selectedSectionIds}
          onActiveChapterChange={onActiveChapterChange}
          onActiveSectionChange={onActiveSectionChange}
          searchQuery={searchQuery}
        />
      </SidebarSection>

      {/* Quick Stats - Desktop only */}
      {!isMobile && (
        <div className="mt-auto p-3 border-t border-primary/5 text-[9px] text-muted-foreground/40 font-mono">
          <div className="flex justify-between">
            <span>Selected</span>
            <span className="font-bold text-primary/60">{selectedSectionIds.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
