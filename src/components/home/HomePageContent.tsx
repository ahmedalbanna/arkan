
'use client';

import React, { useState } from 'react';
import {
  Home,
  Star,
  Share2,
  Inbox,
  HardDrive,
  Cloud,
  PlusCircle,
  Clock,
  Laptop,
  FileText,
  RefreshCw,
  Search,
  Settings,
  Info,
  Eye,
  ChevronDown,
  File as FileIcon,
  Folder,
  Plus,
  X,
  Minus,
  Copy,
  LayoutGrid,
  File,
  FilePen,
  Combine,
  Split,
  Shrink,
  FileImage,
  Image as ImageIcon,
  BookText,
  Sparkles,
  Palette,
  Languages,
  FilePlus,
  MessageSquare,
  Wand2,
  BookOpen,
  CloudUpload,
  FileUp,
  PictureInPicture2,
  Scan,
  PenSquare,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Trash2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/hooks/use-projects';
import { formatDistanceToNow } from 'date-fns';
import { SavedProject } from '@/lib/types';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useRouter } from 'next/navigation';

import EditorPage from '@/app/editor/page';
import { DocumentTabs } from '@/components/home/DocumentTabs';
import { ContentSidebar } from '@/components/home/ContentSidebar';
import { RecentProjectsContent } from '@/components/home/RecentProjectsContent';
import { CreateNewPage } from '@/components/home/CreateNewPage';
import { WpsAiPage } from '@/components/home/WpsAiPage';
import { DocsPageContent } from '@/components/home/DocsPageContent';
import { SlidesPageContent } from '@/components/home/SlidesPageContent';
import { SheetsPageContent } from '@/components/home/SheetsPageContent';
import { PdfPageContent } from '@/components/home/PdfPageContent';
import type { DocumentTab } from '@/components/home/DocumentTabs';

function HomePageContent({activeSidebarItem, onProjectClick}: {activeSidebarItem: string, onProjectClick: (project: SavedProject) => void}) {
  
  if (activeSidebarItem === 'Recent') {
      return <RecentProjectsContent onProjectClick={onProjectClick} />;
  }
  
  return (
    <main className="flex-1 p-6 bg-white overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">{activeSidebarItem}</h1>
          <RefreshCw className="w-5 h-5 text-slate-500 cursor-pointer" />
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Eye className="w-5 h-5 text-slate-500" />
          <Settings className="w-5 h-5 text-slate-500" />
          <Info className="w-5 h-5 text-slate-500" />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center text-center text-slate-500 py-20">
         <div className="p-3 bg-white rounded-full shadow-lg mb-2">
            <Folder className="w-16 h-16 text-slate-300" />
         </div>
        <h2 className="text-xl font-semibold text-slate-800 mt-8">Coming Soon</h2>
        <p className="mt-2">This section is under construction.</p>
      </div>
    </main>
  );
}


export default HomePageContent;
