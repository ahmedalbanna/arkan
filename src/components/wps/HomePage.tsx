
'use client';

import React, { useState } from 'react';
import {
  Home,
  PlusCircle,
} from 'lucide-react';
import { useBuilderStore } from '@/hooks';
import { useRouter } from 'next/navigation';

import EditorPage from '@/app/editor/page';
import { DocumentTabs } from '@/components/wps/DocumentTabs';
import { ContentSidebar } from '@/components/wps/ContentSidebar';
import { RecentProjectsContent } from '@/components/wps/RecentProjectsContent';
import { CreateNewPage } from '@/components/wps/CreateNewPage';
import { WpsAiPage } from '@/components/wps/WpsAiPage';
import { DocsPageContent } from '@/components/wps/DocsPageContent';
import { SlidesPageContent } from '@/components/wps/SlidesPageContent';
import { SheetsPageContent } from '@/components/wps/SheetsPageContent';
import { PdfPageContent } from '@/components/wps/PdfPageContent';
import type { DocumentTab } from '@/components/wps/DocumentTabs';
import { NavItem, WLogo, PLogo, SLogo, PDFLogo } from '@/components/wps/NavItem';

const initialTabs: DocumentTab[] = [
  { id: 1, title: 'Home', type: 'home' },
];


const navRailItems = [
    { name: 'Home', icon: <Home className="w-5 h-5" />, label: 'Home' },
    { name: 'New', icon: <PlusCircle className="w-5 h-5" />, label: 'New' },
    { name: 'WPS AI', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.25 15.6667L8 12.4167L4.75 15.6667" /><path d="M8 12.4167V4.75" /><path d="M12.75 4.75H16.25" /><path d="M14.5 4.75V8.25" /><path d="M19.25 8.33333L16 11.5833L12.75 8.33333" /><path d="M16 11.5833V19.25" /></svg>, label: 'WPS AI' },
];

const appItems = [
    { name: 'Docs', icon: <WLogo />, label: 'Docs' },
    { name: 'Slides', icon: <PLogo />, label: 'Slides' },
    { name: 'Sheets', icon: <SLogo />, label: 'Sheets' },
    { name: 'PDF', icon: <PDFLogo />, label: 'PDF' }
];

export default function HomePage() {
  const [activeNavItem, setActiveNavItem] = useState('Home');
  const [tabs, setTabs] = useState<DocumentTab[]>(initialTabs);
  const [activeTab, setActiveTab] = useState<number>(1);
  const [nextId, setNextId] = useState(initialTabs.length + 1);
  const [activeSidebarItem, setActiveSidebarItem] = useState('Recent');
  const loadState = useBuilderStore(state => state.loadState);
  const newSession = useBuilderStore(state => state.newSession);
  const router = useRouter();


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

  const handleOpenProjectInNewTab = (project: any) => {
    newSession();
    loadState(project);
    addTab('word', project.name || 'Untitled Project', project.id);
  }

  const currentTab = tabs.find(t => t.id === activeTab);

  const renderMainContent = () => {
    if (!currentTab) return null;

    if (['word', 'powerpoint', 'excel', 'pdf'].includes(currentTab.type)) {
 return <EditorPage />;
    }

    if (currentTab.type === 'new') {
        return <CreateNewPage addTab={addTab} />;
    }

    if (currentTab.type === 'home') {
        if (activeNavItem === 'Home') {
            return (
                <div className="flex flex-1">
                    <ContentSidebar activeItem={activeSidebarItem} setActiveItem={setActiveSidebarItem} />
                    <RecentProjectsContent onProjectClick={handleOpenProjectInNewTab} />
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
    <div className="flex h-screen bg-slate-100 text-slate-900">
       <div className="w-20 bg-slate-200 border-r border-slate-300 flex flex-col items-center py-4 space-y-4 z-10">
          <div className="w-8 h-8 bg-[#2E68EB] rounded" />
          <nav className="flex flex-col items-center space-y-1 flex-grow w-full">
              {navRailItems.map(item => <NavItem key={item.label} icon={item.icon} label={item.label} isActive={activeNavItem === item.name} onClick={() => handleNavClick(item.name)} />)}
              <div className="flex-grow" />
              <div className="w-full px-2">
                <hr className="border-slate-300 my-2" />
              </div>
              {appItems.map(item => <NavItem key={item.label} icon={item.icon} label={item.label} isActive={activeNavItem === item.name} onClick={() => handleNavClick(item.name)} />)}
          </nav>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
          <DocumentTabs
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            addTab={addTab}
            removeTab={removeTab}
          />
        <div className="flex-1 overflow-auto">
             {renderMainContent()}
        </div>
      </div>
    </div>
  );
}
