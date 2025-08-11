
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    X, Plus, Minus, Copy, Home as HomeIcon
} from 'lucide-react';
import { NavItem, WLogo, PLogo, SLogo, PDFLogo } from './NavItem';

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

export function DocumentTabs({ tabs, activeTab, setActiveTab, addTab, removeTab }: {
  tabs: DocumentTab[];
  activeTab: number;
  setActiveTab: (id: number) => void;
  addTab: (type: DocumentTab['type'], title?: string, projectId?: string) => void;
  removeTab: (id: number) => void;
}) {
  return (
    <div className="flex items-center bg-slate-100 border-b border-slate-200">
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
