
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    X, Plus, Minus, Copy, Home as HomeIcon, PlusCircle
} from 'lucide-react';
import { NavItem, WLogo, PLogo, SLogo, PDFLogo } from './NavItem';


const navRailItems = [
    { name: 'Home', icon: <HomeIcon className="w-5 h-5" />, label: 'Home' },
    { name: 'New', icon: <PlusCircle className="w-5 h-5" />, label: 'New' },
    { name: 'WPS AI', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.25 15.6667L8 12.4167L4.75 15.6667" /><path d="M8 12.4167V4.75" /><path d="M12.75 4.75H16.25" /><path d="M14.5 4.75V8.25" /><path d="M19.25 8.33333L16 11.5833L12.75 8.33333" /><path d="M16 11.5833V19.25" /></svg>, label: 'WPS AI' },
];

const appItems = [
    { name: 'Docs', icon: <WLogo />, label: 'Docs' },
    { name: 'Slides', icon: <PLogo />, label: 'Slides' },
    { name: 'Sheets', icon: <SLogo />, label: 'Sheets' },
    { name: 'PDF', icon: <PDFLogo />, label: 'PDF' }
];

export type DocumentTab = {
  id: number;
  title: string;
  type: 'home' | 'word' | 'powerpoint' | 'excel' | 'pdf' | 'new';
  projectId?: string;
};

const fileTypeIcons: { [key: string]: React.ReactNode } = {
  'home': <HomeIcon className="w-4 h-4" />,
  'word': <WLogo />,
  'powerpoint': <PLogo />,
  'excel': <SLogo />,
  'pdf': <PDFLogo />,
  'new': <Plus className="w-4 h-4" />,
};

export function DocumentTabs({ tabs, activeTab, setActiveTab, addTab, removeTab, onNavClick, activeNavItem }: {
  tabs: DocumentTab[];
  activeTab: number;
  setActiveTab: (id: number) => void;
  addTab: (type: DocumentTab['type'], title?: string, projectId?: string) => void;
  removeTab: (id: number) => void;
  onNavClick: (itemName: string) => void;
  activeNavItem: string;
}) {
  return (
    <div className="flex items-center bg-slate-100 border-b border-slate-200 pl-20">
      <div className="absolute top-0 left-0 w-20 h-full bg-slate-200 border-r border-slate-300 flex flex-col items-center py-4 space-y-4 z-10">
          <div className="w-8 h-8 bg-[#2E68EB] rounded" />
          <nav className="flex flex-col items-center space-y-1 flex-grow w-full">
              {navRailItems.map(item => <NavItem key={item.label} icon={item.icon} label={item.label} isActive={activeNavItem === item.name} onClick={() => onNavClick(item.name)} />)}
              <div className="flex-grow" />
              <div className="w-full px-2">
                <hr className="border-slate-300 my-2" />
              </div>
              {appItems.map(item => <NavItem key={item.label} icon={item.icon} label={item.label} isActive={activeNavItem === item.name} onClick={() => onNavClick(item.name)} />)}
          </nav>
      </div>
      <div className="flex items-center overflow-x-auto">
        {tabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`flex items-center gap-2 px-4 py-2 text-sm border-r border-slate-200 cursor-pointer ${activeTab === tab.id ? 'bg-white' : 'bg-slate-100 hover:bg-slate-200'}`}
          >
            {fileTypeIcons[tab.type]}
            <span className="truncate max-w-48">{tab.title}</span>
            {tab.type !== 'home' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTab(tab.id);
                }}
                className="ml-2 p-0.5 rounded-full hover:bg-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
       <Button variant="ghost" size="icon" onClick={() => addTab('new')} className="ml-2 h-8 w-8">
        <Plus className="w-4 h-4" />
      </Button>
      <div className="flex-grow" />
      <div className="flex items-center gap-1 px-2">
          <Avatar className="h-6 w-6">
              <AvatarImage src="https://placehold.co/24x24.png" alt="User" data-ai-hint="person" />
              <AvatarFallback>A</AvatarFallback>
          </Avatar>
        <Button variant="ghost" size="icon" className="h-8 w-8"><Minus className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8"><Copy className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8"><X className="w-4 h-4" /></Button>
      </div>
    </div>
  )
}
