
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

const initialTabs: DocumentTab[] = [
  { id: 1, title: 'Home', type: 'home' },
  { id: 2, title: 'WPS Docs Quick Start Guide.docx', type: 'word' },
  { id: 3, title: 'Co-op Final Report - Abdalbari Ba...', type: 'word' },
  { id: 4, title: 'Presentation1', type: 'powerpoint' },
  { id: 5, title: 'Budget Report', type: 'excel' },
  { id: 6, title: 'Document2', type: 'word' },
];

function HomePageContent({activeSidebarItem, onProjectClick}: {activeSidebarItem: string, onProjectClick: (project: SavedProject) => void}) {
  
  if (activeSidebarItem === 'Recent') {
      return <RecentProjectsContent onProjectClick={onProjectClick} />;
  }
  
  return (
    <>
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
    </>
  );
}


export default function WPSOfficePage() {
  const [activeNavItem, setActiveNavItem] = useState('Home');
  const [tabs, setTabs] = useState<DocumentTab[]>(initialTabs);
  const [activeTab, setActiveTab] = useState<number>(1);
  const [nextId, setNextId] = useState(initialTabs.length + 1);
  const [activeSidebarItem, setActiveSidebarItem] = useState('Recent');
  const loadState = useBuilderStore(state => state.loadState);
  const newSession = useBuilderStore(state => state.newSession);

  const addTab = (type: DocumentTab['type'], title?: string, projectId?: string) => {
    if (type === 'new') {
        const existingNewTab = tabs.find(tab => tab.type === 'new');
        if (existingNewTab) {
            setActiveTab(existingNewTab.id);
            return;
        }
    }
    
    if(projectId) {
        const existingTab = tabs.find(tab => tab.projectId === projectId);
        if(existingTab) {
            setActiveTab(existingTab.id);
            return;
        }
    }

    const getNewTitle = () => {
        if (title) return title;
        switch (type) {
            case 'word':
                return `Document${tabs.filter(t => t.type === 'word').length + 1}`;
            case 'powerpoint':
                return `Presentation${tabs.filter(t => t.type === 'powerpoint').length + 1}`;
            case 'excel':
                return `Sheet${tabs.filter(t => t.type === 'excel').length + 1}`;
            case 'pdf':
                return `PDF${tabs.filter(t => t.type === 'pdf').length + 1}`;
            case 'new':
                return 'New';
            default:
                return 'Untitled';
        }
    }

    const newTab: DocumentTab = {
      id: nextId,
      title: getNewTitle(),
      type: type,
      projectId: projectId
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id);
    setNextId(nextId + 1);
  };
  
  const handleNavClick = (itemName: string) => {
      setActiveNavItem(itemName);

      if (itemName === 'New') {
        addTab('new');
        setActiveNavItem('Home');
        return;
      }

      const homeTab = tabs.find(tab => tab.type === 'home');
      if (homeTab) {
        setActiveTab(homeTab.id);
      }
  };

  const removeTab = (id: number) => {
    if (tabs.length === 1 && tabs[0].type === 'home') return;

    const tabIndex = tabs.findIndex(tab => tab.id === id);
    if (tabIndex === -1) return;

    let newTabs = tabs.filter(tab => tab.id !== id);
    
    if (newTabs.length === 0) {
        const homeTab = { id: 1, title: 'Home', type: 'home' as const };
        newTabs = [homeTab];
        setTabs(newTabs);
        setActiveTab(1);
        setNextId(2);
        return;
    }

    setTabs(newTabs);

    if (activeTab === id) {
        const newActiveIndex = Math.max(0, tabIndex - 1);
        setActiveTab(newTabs[newActiveIndex].id);
    }
  };

  const handleOpenProjectInNewTab = (project: SavedProject) => {
    newSession(); 
    loadState(project);
    addTab('word', project.name || 'Untitled Project', project.id);
  }

  const currentTab = tabs.find(t => t.id === activeTab);
  
  const renderMainContent = () => {
    if (!currentTab) return null;

    if (['word', 'powerpoint', 'excel', 'pdf'].includes(currentTab.type)) {
      return <EditorPage fileType={currentTab.type as 'word' | 'powerpoint' | 'excel' | 'pdf'} />;
    }

    if (currentTab.type === 'new') {
        return <CreateNewPage addTab={addTab} />;
    }

    if (currentTab.type === 'home') {
        if (activeNavItem === 'Home') {
            return (
                <div className="flex flex-1">
                    <ContentSidebar activeItem={activeSidebarItem} setActiveItem={setActiveSidebarItem} />
                    <main className="flex-1 p-6 bg-white overflow-y-auto">
                        <HomePageContent activeSidebarItem={activeSidebarItem} onProjectClick={handleOpenProjectInNewTab} />
                    </main>
                     <aside className="w-64 bg-white border-l border-slate-200 p-6 flex flex-col items-center justify-center text-slate-400">
                        <FileIcon className="w-24 h-24 text-slate-300 mb-4" />
                        <p className="text-sm text-slate-500 text-center">Select a file to view details</p>
                    </aside>
                </div>
            )
        }
        if (activeNavItem === 'WPS AI') {
          return <WpsAiPage />;
        }
        if (activeNavItem === 'Docs') {
          return <DocsPageContent addTab={addTab}/>;
        }
        if (activeNavItem === 'Slides') {
          return <SlidesPageContent addTab={addTab}/>;
        }
        if (activeNavItem === 'Sheets') {
          return <SheetsPageContent addTab={addTab}/>;
        }
        if (activeNavItem === 'PDF') {
          return <PdfPageContent addTab={addTab}/>;
        }
    }
    
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-white text-slate-900">
      <div className="relative bg-slate-100">
          <DocumentTabs
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            addTab={addTab}
            removeTab={removeTab}
            onNavClick={handleNavClick}
            activeNavItem={activeNavItem}
          />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 pl-20 bg-slate-100">
             {renderMainContent()}
        </div>
      </div>
    </div>
  );
}
