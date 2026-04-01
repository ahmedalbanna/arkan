'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, FolderOpen, Map, MoreHorizontal } from 'lucide-react';
import { cn } from '@/infrastructure/utils/cn';
import { SidebarOutlineManager } from './outline/SidebarOutlineManager';
import { SidebarFileManager } from './file-manager/SidebarFileManager';

// ---------------------------------------------------------------------------
// CollapsibleSection — VSCode-style header + animated body
// ---------------------------------------------------------------------------
interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="flex flex-col">
      {/* Section header — VSCode style */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={cn(
          'flex w-full items-center gap-2 px-3 py-2 text-start transition-colors duration-200',
          'border-b border-primary/10 bg-muted/10 hover:bg-primary/[0.04]',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30'
        )}
      >
        <ChevronRight
          className={cn(
            'h-3 w-3 shrink-0 text-muted-foreground/60 transition-transform duration-300',
            isOpen && 'rotate-90'
          )}
        />
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/80 flex-1">
          {title}
        </span>
        <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground/30 hover:text-primary transition-colors" />
      </button>

      {/* Collapsible body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SidebarNavigator
// ---------------------------------------------------------------------------
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
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar -mx-6 -my-6">

      {/* FILES section */}
      <CollapsibleSection title="Files" defaultOpen={true}>
        <SidebarFileManager />
      </CollapsibleSection>

      {/* OUTLINE section */}
      <CollapsibleSection title="Outline" defaultOpen={true}>
        <SidebarOutlineManager
          activeChapterId={activeChapterId}
          selectedSectionIds={selectedSectionIds}
          onActiveChapterChange={onActiveChapterChange}
          onActiveSectionChange={onActiveSectionChange}
        />
      </CollapsibleSection>

    </div>
  );
}
