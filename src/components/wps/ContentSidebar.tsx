
'use client';

import { NavItem } from './NavItem';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  Star,
  Share2,
  Inbox,
  HardDrive,
  Cloud,
  Laptop,
  Folder,
  FileText
} from 'lucide-react';

const mainNavItems = [
    { label: 'Recent', icon: <Clock className="w-5 h-5" /> },
    { label: 'Starred', icon: <Star className="w-5 h-5" /> },
    { label: 'Share', icon: <Share2 className="w-5 h-5" /> },
    { label: 'Received', icon: <Inbox className="w-5 h-5" /> },
];

const driveNavItems = [
    { label: 'WPS Drive', icon: <HardDrive className="w-5 h-5" /> },
    { label: 'Google Drive', icon: <Cloud className="w-5 h-5" /> },
    { label: 'Dropbox', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.013 2.001L6.006 6.008 12.013 10.014 18.02 6.008 12.013 2.001zM6.006 18.02l6.007 4.007 6.007-4.007-6.007-4.006-6.007 4.006zM2 12.013l4.006-4.007 6.007 4.007-4.006 4.006L2 12.013zm20.026 0l-4.006 4.006-6.007-4.006 4.006-4.007 6.007 4.007z" /></svg> },
];

const localNavItems = [
    { label: 'My Computer', icon: <Laptop className="w-5 h-5" /> },
    { label: 'My Desktop', icon: <Folder className="w-5 h-5" /> },
    { label: 'My Documents', icon: <FileText className="w-5 h-5" /> },
];

const frequentlyUsedNavItems = [
    { label: 'My Computer', icon: <Folder className="w-5 h-5" /> },
]

export function ContentSidebar({ activeItem, setActiveItem }: { activeItem: string, setActiveItem: (item: string) => void }) {
    
    const createNavItem = (item: {label: string, icon: React.ReactNode}) => (
        <NavItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            isActive={activeItem === item.label}
            onClick={() => setActiveItem(item.label)}
            isVertical={false}
        />
    );

    return (
        <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col p-2">
            <div className="grow">
                <nav className="space-y-1">
                    {mainNavItems.map(createNavItem)}
                </nav>
                <div className="mt-4">
                    <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Drive</h3>
                    <nav className="space-y-1">
                        {driveNavItems.map(createNavItem)}
                    </nav>
                </div>
                 <div className="mt-4">
                    <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Local</h3>
                    <nav className="space-y-1">
                        {localNavItems.map(createNavItem)}
                    </nav>
                </div>
                <div className="mt-4">
                    <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Frequently Used</h3>
                     <nav className="space-y-1">
                        {frequentlyUsedNavItems.map(createNavItem)}
                    </nav>
                </div>
            </div>
            <div className="mt-auto p-2">
                <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Storage</h3>
                <div className="px-2">
                    <Progress value={59} className="h-1.5" />
                    <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                        <span>0K of 20G used</span>
                        <span>59%</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
