
"use client";

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  ChevronRight,
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
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';
import EditorPage from '@/app/editor/page';
import { useProjects } from '@/hooks/use-projects';
import { formatDistanceToNow } from 'date-fns';
import { SavedProject } from '@/lib/types';
import { useBuilderStore } from '@/hooks/useBuilderStore';


function WLogo() {
  return <div className="w-4 h-4 bg-[#2E68EB] text-white flex items-center justify-center rounded-sm text-xs font-bold">W</div>;
}
function PLogo() {
  return <div className="w-4 h-4 bg-[#D95F3B] text-white flex items-center justify-center rounded-sm text-xs font-bold">P</div>;
}
function SLogo() {
  return <div className="w-4 h-4 bg-[#308A5D] text-white flex items-center justify-center rounded-sm text-xs font-bold">S</div>;
}
function PDFLogo() {
    return <div className="w-4 h-4 bg-red-600 text-white flex items-center justify-center rounded-sm text-xs font-bold">P</div>;
}
function HomeLogo() {
    return <div className="w-4 h-4 bg-gray-600 text-white flex items-center justify-center rounded-sm text-xs font-bold">W</div>;
}
function PicsArtLogo() {
    return <div className="w-4 h-4 bg-purple-600 text-white flex items-center justify-center rounded-sm text-xs font-bold">M</div>;
}
function TxtLogo() {
    return <div className="w-4 h-4 bg-gray-500 text-white flex items-center justify-center rounded-sm text-xs font-bold">T</div>;
}
function WbkLogo() {
    return <div className="w-4 h-4 bg-gray-400 text-white flex items-center justify-center rounded-sm text-xs font-bold">?</div>;
}

const fileTypeIcons: { [key: string]: React.ReactNode } = {
  'home': <HomeLogo />,
  'word': <WLogo />,
  'powerpoint': <PLogo />,
  'excel': <SLogo />,
  'pdf': <PDFLogo />,
  'new': <Plus className="w-4 h-4" />,
};

type DocumentTab = {
  id: number;
  title: string;
  type: 'home' | 'word' | 'powerpoint' | 'excel' | 'pdf' | 'new';
  projectId?: string;
};


const initialTabs: DocumentTab[] = [
  { id: 1, title: 'Home', type: 'home' },
  { id: 2, title: 'WPS Docs Quick Start Guide.docx', type: 'word' },
  { id: 3, title: 'Co-op Final Report - Abdalbari Ba...', type: 'word' },
  { id: 4, title: 'Presentation1', type: 'powerpoint' },
  { id: 5, title: 'Budget Report', type: 'excel' },
  { id: 6, title: 'Document2', type: 'word' },
];

function NavItem({ icon, label, isActive, onClick, isVertical = true }: { icon: React.ReactNode, label: string, isActive?: boolean, onClick?: () => void, isVertical?: boolean }) {
  return (
    <button onClick={onClick} className={`flex items-center text-sm font-medium w-full text-left ${isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-slate-200'} ${isVertical ? 'flex-col h-16 justify-center text-center' : 'flex-row p-3 rounded-md'}`}>
      <div className={`flex items-center justify-center ${isVertical ? 'mb-1' : 'mr-3'}`}>{icon}</div>
      <span className="text-xs">{label}</span>
    </button>
  );
}

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

function ContentSidebar({ activeItem, setActiveItem }: { activeItem: string, setActiveItem: (item: string) => void }) {
    
    const createNavItem = (item: {label: string, icon: React.ReactNode}) => (
        <a
            key={item.label}
            href="#"
            onClick={(e) => {
                e.preventDefault();
                setActiveItem(item.label)
            }}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${activeItem === item.label ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-slate-200'}`}
        >
            {item.icon}
            <span>{item.label}</span>
        </a>
    );

    return (
        <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col p-2">
            <div className="flex-grow">
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
        </div>
    );
}

function RecentProjectsContent({ onProjectClick }: { onProjectClick: (project: SavedProject) => void }) {
    const { data: projects, isLoading, isError, error } = useProjects();
    const loadState = useBuilderStore(state => state.loadState);
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            </div>
        );
    }
    
    if (isError) {
        return (
            <div className="flex items-center justify-center h-full text-red-500">
                <AlertCircle className="w-8 h-8 mr-2" />
                <p>Error loading projects: {error.message}</p>
            </div>
        )
    }

    if (!projects || projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center text-slate-500 py-20">
                <Folder className="w-24 h-24 text-slate-300 mb-4"/>
                <h2 className="text-xl font-semibold text-slate-800">No Recent Projects</h2>
                <p className="mt-2">Your recently edited projects will appear here.</p>
            </div>
        )
    }
    
    // Group projects by date
    const groupedProjects = projects.reduce((acc, project) => {
        const date = new Date(project.updatedAt);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let groupName = formatDistanceToNow(date, { addSuffix: true });
        if (date.toDateString() === today.toDateString()) {
            groupName = 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            groupName = 'Yesterday';
        } else {
            groupName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
        }

        if (!acc[groupName]) {
            acc[groupName] = [];
        }
        acc[groupName].push(project);
        return acc;
    }, {} as Record<string, SavedProject[]>);

    const groupOrder = ['Today', 'Yesterday', ...Object.keys(groupedProjects).filter(g => g !== 'Today' && g !== 'Yesterday').sort((a,b) => new Date(b).getTime() - new Date(a).getTime())];


    return (
        <>
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold">Recent</h1>
                <RefreshCw className="w-5 h-5 text-slate-500 cursor-pointer" />
                </div>
                <div className="flex items-center gap-4 text-sm">
                <Eye className="w-5 h-5 text-slate-500" />
                <Settings className="w-5 h-5 text-slate-500" />
                <Info className="w-5 h-5 text-slate-500" />
                </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
                <Checkbox id="all-types" />
                <label
                htmlFor="all-types"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                All Types
                </label>
                <ChevronDown className="h-4 w-4" />
            </div>

            <div className="space-y-8">
                {groupOrder.map(group => (
                    groupedProjects[group] && (
                        <div key={group}>
                            <h3 className="text-sm font-medium text-slate-500 mb-2">{group}</h3>
                             <Table>
                                <TableHeader>
                                <TableRow className="hover:bg-transparent border-b-slate-200">
                                    <TableHead className="w-[50%]">Name</TableHead>
                                    <TableHead>Owner</TableHead>
                                    <TableHead>Last Modified</TableHead>
                                    <TableHead className="text-right">Size</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {groupedProjects[group].map((project) => (
                                    <TableRow key={project.id} className="cursor-pointer hover:bg-slate-50 border-b-slate-200" onClick={() => onProjectClick(project)}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                            <WLogo />
                                            <span className="font-medium text-slate-800 truncate">{project.name || 'Untitled Project'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-500">{project.userId.substring(0,8)}...</TableCell>
                                        <TableCell className="text-slate-500">{formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</TableCell>
                                        <TableCell className="text-right text-slate-500">--</TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </div>
                    )
                ))}
            </div>
        </>
    )
}

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

const TemplateCard = ({
  icon,
  title,
  imgSrc,
  imgAlt,
  tag,
  dataAiHint,
  size = 'small',
  onClick,
}: {
  icon?: React.ReactNode;
  title: string;
  imgSrc?: string;
  imgAlt?: string;
  tag?: 'NEW' | 'HOT';
  dataAiHint?: string;
  size?: 'small' | 'large';
  onClick?: () => void;
}) => {
  const sizeClasses = size === 'small' 
    ? 'w-32 h-40'
    : 'w-full';

  return (
    <div className="flex flex-col items-start gap-2 cursor-pointer group" onClick={onClick}>
      <div className={`${sizeClasses} bg-white rounded-lg border border-slate-200 flex items-center justify-center group-hover:border-blue-500 relative overflow-hidden`}>
        {imgSrc ? (
          <Image src={imgSrc} alt={imgAlt || title} layout="fill" objectFit="cover" className="rounded-lg" data-ai-hint={dataAiHint}/>
        ) : (
          icon
        )}
        {tag && (
          <Badge
            className={`absolute top-2 left-2 ${tag === 'NEW' ? 'bg-orange-400' : 'bg-red-400'} text-white`}
          >
            {tag}
          </Badge>
        )}
      </div>
      <span className="text-sm font-medium text-slate-700">{title}</span>
    </div>
  );
};

const templates = {
  all: {
    top: [
      { title: 'Docs', imgSrc: 'https://placehold.co/128x160.png', dataAiHint: 'document blank', type: 'word' as const },
      { title: 'Slides', imgSrc: 'https://placehold.co/128x160.png', dataAiHint: 'presentation slides', type: 'powerpoint' as const },
      { title: 'Sheets', imgSrc: 'https://placehold.co/128x160.png', dataAiHint: 'spreadsheet table', type: 'excel' as const },
      { title: 'PDF', imgSrc: 'https://placehold.co/128x160.png', dataAiHint: 'pdf document', type: 'pdf' as const },
      { title: 'Docs Smart Create', imgSrc: 'https://placehold.co/128x160.png', dataAiHint: 'ai document', type: 'word' as const },
      { title: 'Slides Smart Create', imgSrc: 'https://placehold.co/128x160.png', dataAiHint: 'ai slides', type: 'powerpoint' as const },
    ],
    recommended: [
      { title: 'Resume Master', imgSrc: 'https://placehold.co/240x320.png', tag: 'NEW' as const, dataAiHint: 'professional resume', type: 'word' as const, category: 'Resume' },
      { title: 'Energetic Resume', imgSrc: 'https://placehold.co/240x320.png', tag: 'HOT' as const, dataAiHint: 'creative resume', type: 'word' as const, category: 'Resume' },
      { title: 'Cartoon syllabus', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'syllabus education', type: 'word' as const, category: 'Education' },
      { title: 'Artistic resume', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'artistic resume', type: 'word' as const, category: 'Resume' },
      { title: 'Business Pitch Deck', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'business presentation', type: 'powerpoint' as const, category: 'Business' },
      { title: 'Monthly Budget', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'finance spreadsheet', type: 'excel' as const, category: 'Finance' },
    ]
  },
  docs: {
    top: [
      { title: 'Blank Document', icon: <FileIcon className="w-12 h-12 text-blue-500" />, type: 'word' as const },
      { title: 'Smart Create', imgSrc: 'https://placehold.co/128x160.png', dataAiHint: 'ai document', type: 'word' as const },
    ],
    recommended: [
      { title: 'Resume Master', imgSrc: 'https://placehold.co/240x320.png', tag: 'NEW' as const, dataAiHint: 'professional resume', category: 'Resume', type: 'word' as const },
      { title: 'Energetic Resume', imgSrc: 'https://placehold.co/240x320.png', tag: 'HOT' as const, dataAiHint: 'creative resume', category: 'Resume', type: 'word' as const },
      { title: 'Cartoon syllabus', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'syllabus education', category: 'Education', type: 'word' as const },
      { title: 'Artistic resume', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'artistic resume', category: 'Resume', type: 'word' as const },
      { title: 'Class Notes', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'notes education', category: 'Education', type: 'word' as const },
      { title: 'Formal Letter', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'formal letter', category: 'Letter', type: 'word' as const },
      { title: 'Business Letter', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'business letter', category: 'Letter', type: 'word' as const },
    ]
  },
  slides: {
    top: [
       { title: 'Blank Presentation', icon: <FileIcon className="w-12 h-12 text-orange-500" />, type: 'powerpoint' as const },
       { title: 'Smart Create', imgSrc: 'https://placehold.co/128x160.png', dataAiHint: 'ai slides', type: 'powerpoint' as const },
    ],
    recommended: [
      { title: 'Business Pitch Deck', imgSrc: 'https://placehold.co/240x320.png', tag: 'NEW' as const, dataAiHint: 'business presentation', category: 'Business', type: 'powerpoint' as const },
      { title: 'Photo Album', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'photo album', category: 'Album', type: 'powerpoint' as const },
      { title: 'Science Fair Project', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'science project', category: 'Education', type: 'powerpoint' as const },
      { title: 'Company Profile', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'company profile', category: 'Business', type: 'powerpoint' as const },
      { title: 'Minimalist Presentation', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'minimalist presentation', category: 'Business', type: 'powerpoint' as const },
      { title: 'Yearbook Slides', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'yearbook album', category: 'Album', type: 'powerpoint' as const },
      { title: 'Lecture Slides', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'lecture education', category: 'Education', type: 'powerpoint' as const },
    ]
  },
  sheets: {
    top: [
       { title: 'Blank Workbook', icon: <FileIcon className="w-12 h-12 text-green-500" />, type: 'excel' as const },
    ],
    recommended: [
      { title: 'Monthly Budget', imgSrc: 'https://placehold.co/240x320.png', tag: 'HOT' as const, dataAiHint: 'finance spreadsheet', type: 'excel' as const, category: 'Finance' },
      { title: 'Project Tracker', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'project management', type: 'excel' as const, category: 'Finance' },
      { title: 'Invoice Template', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'invoice form', type: 'excel' as const, category: 'Finance' },
      { title: 'Gantt Chart', imgSrc: 'https://placehold.co/240x320.png', dataAiHint: 'gantt chart', type: 'excel' as const, category: 'Finance' },
    ]
  },
  pdf: {
    top: [],
    recommended: []
  },
};

const myTemplatesData = {
  history: [
    { icon: <PLogo />, name: 'Universal Technology Style.pptx', permission: 'Free', time: '--' },
    { icon: <SLogo />, name: 'Budget report summary.xlsx', permission: 'Free', time: '--' },
    { icon: <WLogo />, name: 'Artistic resume.docx', permission: 'Free', time: '--' },
  ],
  favorite: [
    { icon: <PLogo />, name: 'Universal Technology Style.pptx', permission: 'Free', time: '--' },
    { icon: <SLogo />, name: 'Budget report summary.xlsx', permission: 'Free', time: '--' },
    { icon: <WLogo />, name: 'Artistic resume.docx', permission: 'Free', time: '--' },
  ],
  purchases: [],
};


function MyTemplatesPage() {
  const [activeTab, setActiveTab] = useState<'history' | 'favorite' | 'purchases'>('favorite');

  const templates = myTemplatesData[activeTab];

  return (
    <div className="bg-white p-6 rounded-lg h-full">
      <div className="flex border-b border-slate-200">
        <button onClick={() => setActiveTab('history')} className={`py-2 px-4 text-sm ${activeTab === 'history' ? 'border-b-2 border-blue-500 text-blue-500 font-semibold' : 'text-slate-500'}`}>History</button>
        <button onClick={() => setActiveTab('favorite')} className={`py-2 px-4 text-sm ${activeTab === 'favorite' ? 'border-b-2 border-blue-500 text-blue-500 font-semibold' : 'text-slate-500'}`}>Favorite</button>
        <button onClick={() => setActiveTab('purchases')} className={`py-2 px-4 text-sm ${activeTab === 'purchases' ? 'border-b-2 border-blue-500 text-blue-500 font-semibold' : 'text-slate-500'}`}>Purchases</button>
      </div>
      <div className="flex justify-between items-center my-4">
        <Button variant="outline" size="sm">
          All <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
        <span className="text-xs text-slate-500">Free users can only download 100 times per day</span>
      </div>
      {templates.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b-slate-200">
              <TableHead className="w-[60%]">All</TableHead>
              <TableHead>Permission</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template, index) => (
              <TableRow key={index} className="cursor-pointer hover:bg-slate-50 border-b-slate-200">
                <TableCell>
                  <div className="flex items-center gap-3">
                    {template.icon}
                    <span className="font-medium text-slate-800 truncate">{template.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-500">{template.permission}</TableCell>
                <TableCell className="text-slate-500">{template.time}</TableCell>
                <TableCell className="text-right">
                  <Button variant="link" size="sm">Use</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-20 text-slate-500">No templates found.</div>
      )}
    </div>
  );
}

const PdfActionCard = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex flex-col items-center justify-center text-center gap-2 cursor-pointer group p-4">
    <div className="w-full h-24 bg-white rounded-lg border border-slate-200 flex items-center justify-center group-hover:border-blue-500">
      {icon}
    </div>
    <span className="text-sm font-medium text-slate-700">{title}</span>
  </div>
);

const PdfToolButton = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <Button variant="outline" className="w-full justify-start h-auto py-3 bg-white">
        <div className="flex items-center gap-3">
            {icon}
            <span className="font-medium">{title}</span>
        </div>
    </Button>
)


function PdfPage() {
    const createActions = [
        { icon: <Folder className="w-10 h-10 text-red-500" />, title: 'Open' },
        { icon: <Plus className="w-10 h-10 text-red-500" />, title: 'Create Blank PDF' },
        { icon: <FileIcon className="w-10 h-10 text-red-500" />, title: 'From Word/Excel/PPT' },
    ];

    const editActions = [
        { icon: <FilePen className="w-6 h-6 text-red-500" />, title: 'Full Edit' },
        { icon: <Combine className="w-6 h-6 text-red-500" />, title: 'Combine' },
        { icon: <Split className="w-6 h-6 text-red-500" />, title: 'Split' },
        { icon: <Shrink className="w-6 h-6 text-red-500" />, title: 'Compress' },
    ];

    const convertActions = [
        { icon: <WLogo />, title: 'PDF to Word' },
        { icon: <SLogo />, title: 'PDF to Excel' },
        { icon: <PLogo />, title: 'PDF to PPT' },
        { icon: <FileImage className="w-6 h-6 text-red-500" />, title: 'PDF to Image' },
        { icon: <ImageIcon className="w-6 h-6 text-red-500" />, title: 'Image to PDF' },
    ];


    return (
        <div className="bg-white p-6 rounded-lg space-y-8">
            <div className="grid grid-cols-3 gap-6">
                {createActions.map(action => <PdfActionCard key={action.title} {...action} />)}
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-4">Edit</h3>
                <div className="grid grid-cols-4 gap-4">
                    {editActions.map(action => <PdfToolButton key={action.title} {...action} />)}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-4">Convert</h3>
                <div className="grid grid-cols-4 gap-4">
                     {convertActions.map(action => <PdfToolButton key={action.title} {...action} />)}
                </div>
            </div>
        </div>
    )
}

function CreateNewPage({ addTab }: { addTab: (type: DocumentTab['type'], title?: string, projectId?: string) => void }) {
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeSubCategory, setActiveSubCategory] = useState('Recommended');
    const [activeView, setActiveView] = useState('templates'); // 'templates' or 'my-templates'

    const categories = [
        { id: 'All', label: 'All', icon: <LayoutGrid className="w-5 h-5" /> },
        { id: 'Docs', label: 'Docs', icon: <WLogo /> },
        { id: 'Slides', label: 'Slides', icon: <PLogo /> },
        { id: 'Sheets', label: 'Sheets', icon: <SLogo /> },
        { id: 'PDF', label: 'PDF', icon: <PDFLogo /> },
    ];
    
    const categoryKey = activeCategory.toLowerCase() as keyof typeof templates;
    const currentTemplates = templates[categoryKey];
    
    const subCategories: Record<string, string[]> = {
      'All': ['Recommended', 'Docs', 'Slides', 'Sheets'],
      'Docs': ['Recommended', 'Resume', 'Education', 'Letter'],
      'Slides': ['Recommended', 'Business', 'Education', 'Album'],
      'Sheets': ['Recommended', 'Finance'],
      'PDF': [],
    }

    const getFilteredTemplates = () => {
        if (activeCategory === 'All') {
            switch (activeSubCategory) {
                case 'Docs':
                    return templates.docs.recommended;
                case 'Slides':
                    return templates.slides.recommended;
                case 'Sheets':
                    return templates.sheets.recommended;
                default:
                    return []; // 'Recommended' in 'All' shows grouped lists
            }
        }
    
        const templatesForCategory = currentTemplates.recommended;
        if (activeSubCategory === 'Recommended') {
            return templatesForCategory;
        }
        return templatesForCategory.filter(t => 'category' in t && t.category === activeSubCategory);
    };

    const filteredTemplates = getFilteredTemplates();

    const renderTemplateBrowser = () => {
      if (activeCategory === 'All' && activeSubCategory === 'Recommended') {
        return (
          <>
              <div className="flex items-center gap-2 mb-4">
                  <WLogo />
                  <h3 className="font-semibold text-slate-800">Docs Templates</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    {templates.docs.recommended.map(t => (
                      <TemplateCard key={t.title} {...t} size="large" onClick={() => addTab(t.type, t.title)} />
                    ))}
              </div>
              <div className="flex items-center gap-2 mb-4">
                  <PLogo />
                  <h3 className="font-semibold text-slate-800">Slides Templates</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    {templates.slides.recommended.map(t => (
                      <TemplateCard key={t.title} {...t} size="large" onClick={() => addTab(t.type, t.title)} />
                    ))}
              </div>
               <div className="flex items-center gap-2 mb-4">
                  <SLogo />
                  <h3 className="font-semibold text-slate-800">Sheets Templates</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {templates.sheets.recommended.map(t => (
                      <TemplateCard key={t.title} {...t} size="large" onClick={() => addTab(t.type, t.title)} />
                    ))}
              </div>
          </>
        )
      }

      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {filteredTemplates.map(t => (
                <TemplateCard key={t.title} {...t} size="large" onClick={() => addTab(t.type, t.title)} />
              ))}
        </div>
      )
    }

    const renderContent = () => {
        if (activeView === 'my-templates') {
            return <MyTemplatesPage />;
        }
        
        if (activeCategory === 'PDF') {
            return <PdfPage />;
        }

        return (
            <>
                <div className="bg-white p-6 rounded-lg">
                    <div className="flex gap-4 justify-start">
                        {currentTemplates.top.map(t => <TemplateCard key={t.title} {...t} onClick={() => addTab(t.type, t.title)} />)}
                    </div>
                </div>

                {currentTemplates.recommended.length > 0 && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex gap-6 border-b border-slate-200">
                               {subCategories[activeCategory].map(subCat => (
                                   <button 
                                      key={subCat}
                                      onClick={() => setActiveSubCategory(subCat)}
                                      className={`py-2 ${activeSubCategory === subCat ? 'border-b-2 border-blue-500 text-blue-500 font-semibold' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                      {subCat}
                                   </button>
                               ))}
                            </div>
                            <a href="#" className="text-sm text-blue-500 font-medium flex items-center gap-1">
                                See More Templates <ChevronRight className="w-4 h-4" />
                            </a>
                        </div>
                        {renderTemplateBrowser()}
                    </div>
                )}
            </>
        )
    }


    return (
        <div className="flex flex-1 bg-slate-50">
            <aside className="w-56 bg-white p-4 flex flex-col justify-between border-r border-slate-200">
                <div>
                    <h2 className="text-lg font-semibold mb-4 px-3">Create New</h2>
                    <nav className="space-y-1">
                        {categories.map(cat => (
                            <button key={cat.id}
                                onClick={() => {
                                  setActiveCategory(cat.id);
                                  setActiveSubCategory('Recommended');
                                  setActiveView('templates');
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${activeView === 'templates' && activeCategory === cat.id ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-slate-100'}`}>
                                {cat.icon}
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                <button
                    onClick={() => setActiveView('my-templates')}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md ${activeView === 'my-templates' ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-slate-100'}`}>
                    <File className="w-5 h-5" />
                    <span>My Templates</span>
                </button>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input placeholder="Search for templates" className="pl-10 w-full max-w-lg bg-white" />
                </div>

                {renderContent()}
            </main>
        </div>
    );
}

const AiToolCard = ({ icon, title, description, tags, actionText, actionLink }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tags?: string;
  actionText: string;
  actionLink?: string;
}) => (
  <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col justify-between hover:border-blue-500 cursor-pointer">
    <div>
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
          {icon}
        </div>
      </div>
      <h3 className="font-semibold text-base mt-3">{title}</h3>
      <p className="text-slate-500 text-sm mt-1">{description}</p>
    </div>
    <div className="flex justify-between items-center mt-4">
      {tags && <span className="text-xs text-slate-400">{tags}</span>}
      <a href={actionLink || "#"} className="text-sm text-blue-500 font-medium">
        {actionText}
      </a>
    </div>
  </div>
);

const ProductivityToolCard = ({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
    <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-4 hover:border-blue-500 cursor-pointer">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            {icon}
        </div>
        <div>
            <h3 className="font-semibold text-base">{title}</h3>
            <p className="text-slate-500 text-sm">{description}</p>
        </div>
    </div>
);

const aiTools = [
  { icon: <Sparkles className="w-6 h-6" />, title: 'Docs Smart Create', description: 'Input a simple prompt and instantly start writing with your AI writing assistant', tags: 'Docs', actionText: 'Try Now >' },
  { icon: <Palette className="w-6 h-6" />, title: 'Slides Smart Create', description: 'Create PPTs effortlessly with AI by inputting description or uploading files', tags: 'Slides', actionText: 'Try Now >' },
  { icon: <Wand2 className="w-6 h-6" />, title: 'Docs Smart Edit', description: 'Enhance, refine, and rewrite your content with AI writing assistant', tags: 'Docs', actionText: 'Choose File >' },
  { icon: <BookOpen className="w-6 h-6" />, title: 'AI Spell Check', description: 'Go beyond spelling and grammar. Make your writing clear, engaging, and polished', tags: 'Docs', actionText: 'Choose File >' },
  { icon: <BookText className="w-6 h-6" />, title: 'AI Refinements', description: 'Unleash the power of AI to perfect your writing', tags: 'Docs', actionText: 'Choose File >' },
  { icon: <Languages className="w-6 h-6" />, title: 'Parallel Translate', description: 'AI-powered translation tool with side-by-side bilingual reading', tags: 'Docs, Slides, PDF', actionText: 'Choose File >' },
  { icon: <FilePlus className="w-6 h-6" />, title: 'Create Slides from Doc', description: 'Intelligently analyze and create a presentation from a document with AI', tags: 'Slides', actionText: 'Choose File >' },
  { icon: <FileText className="w-6 h-6" />, title: 'AI Summarizer', description: 'Quickly generate a content summary', tags: 'Docs, PDF', actionText: 'Choose File >' },
  { icon: <MessageSquare className="w-6 h-6" />, title: 'Chat PDF', description: 'Reliable PDF AI Assistant with Summarizing and Inquiring', tags: 'PDF', actionText: 'Choose File >' },
];

const productivityTools = [
    { icon: <CloudUpload className="w-6 h-6" />, title: 'Auto backup', description: 'Automatic document backup' },
    { icon: <FileUp className="w-6 h-6" />, title: 'PDF to Word', description: 'Convert PDF files to Word, Excel and PPT' },
    { icon: <PictureInPicture2 className="w-6 h-6" />, title: 'Picture to PDF', description: 'Convert multiple pictures to PDF' },
    { icon: <Scan className="w-6 h-6" />, title: 'WPS Photos Editor', description: 'Crop images, beautify, remove backgrounds, annotate, and more' },
];

function WpsAiPage() {
    return (
        <main className="flex-1 p-8 overflow-y-auto bg-slate-50">
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input placeholder="Search files and tools" className="pl-10 w-full max-w-lg bg-white" />
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4">AI Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {aiTools.map(tool => <AiToolCard key={tool.title} {...tool} />)}
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-xl font-semibold mb-4">Productivity Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {productivityTools.map(tool => <ProductivityToolCard key={tool.title} {...tool} />)}
                </div>
            </div>
        </main>
    );
}

function DocsPageContent({addTab}: {addTab: (type: DocumentTab['type'], title?: string) => void}) {
  const { data: projects, isLoading, isError, error } = useProjects();

  const handleOpenProject = (project: SavedProject) => {
    addTab('word', project.name || 'Untitled Project');
  }

  const docFiles = projects?.filter(p => p.proposal?.category.includes('Document')) || [];
  
  return (
    <div className="flex flex-1">
      <main className="flex-1 p-6 bg-white overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => addTab('word', 'Blank Document')}><Plus className="w-4 h-4 mr-2" />Blank</Button>
                <Button variant="outline" size="sm"><Folder className="w-4 h-4 mr-2" />Open</Button>
                <Button variant="outline" size="sm"><LayoutGrid className="w-4 h-4 mr-2" />Create from Template</Button>
            </div>
             <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="bg-purple-50 border-purple-200 text-purple-700"><Sparkles className="w-4 h-4 mr-2" />Smart Create</Button>
                <Button variant="outline" size="sm"><Wand2 className="w-4 h-4 mr-2" />Smart Edit</Button>
                <Button variant="outline" size="sm"><BookOpen className="w-4 h-4 mr-2" />AI Spell Check</Button>
                <Button variant="outline" size="sm"><BookText className="w-4 h-4 mr-2" />AI Refinements</Button>
                <Button variant="outline" size="sm">More <ChevronDown className="w-4 h-4 ml-2" /></Button>
            </div>
        </div>

        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Recent</h2>
              <RefreshCw className="w-4 h-4 text-slate-500 cursor-pointer" />
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Settings className="w-5 h-5 text-slate-500" />
              <Info className="w-5 h-5 text-slate-500" />
            </div>
        </div>
        
        {isLoading && <Loader2 className="animate-spin" />}
        {isError && <p>Error loading projects</p>}
        {docFiles.length > 0 && (
            <Table>
                <TableHeader>
                <TableRow className="hover:bg-transparent border-b-slate-200">
                    <TableHead className="w-[50%]">File name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {docFiles.map((file) => (
                    <TableRow key={file.id} className="cursor-pointer hover:bg-slate-50 border-b-slate-200" onClick={() => handleOpenProject(file)}>
                    <TableCell>
                        <div className="flex items-center gap-3">
                        <WLogo />
                        <span className="font-medium text-slate-800 truncate">{file.name}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-slate-500">Cloud</TableCell>
                    <TableCell className="text-slate-500">{formatDistanceToNow(new Date(file.updatedAt), { addSuffix: true })}</TableCell>
                    <TableCell className="text-right text-slate-500">--</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        )}
      </main>
      <aside className="w-64 bg-white border-l border-slate-200 p-6 flex flex-col items-center justify-center">
        <FileIcon className="w-24 h-24 text-slate-300 mb-4" />
        <p className="text-sm text-slate-500 text-center">Select a file to view details</p>
      </aside>
    </div>
  );
}

function SlidesPageContent({addTab}: {addTab: (type: DocumentTab['type'], title?: string) => void}) {

  return (
    <div className="flex flex-1">
      <main className="flex-1 p-6 bg-white overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => addTab('powerpoint', 'Blank Presentation')}><Plus className="w-4 h-4 mr-2" />Blank</Button>
                <Button variant="outline" size="sm"><Folder className="w-4 h-4 mr-2" />Open</Button>
                <Button variant="outline" size="sm"><LayoutGrid className="w-4 h-4 mr-2" />Create from Template</Button>
            </div>
             <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="bg-purple-50 border-purple-200 text-purple-700"><Sparkles className="w-4 h-4 mr-2" />Smart Create</Button>
                <Button variant="outline" size="sm"><Languages className="w-4 h-4 mr-2" />Parallel Translate</Button>
            </div>
        </div>
      </main>
      <aside className="w-64 bg-white border-l border-slate-200 p-6 flex flex-col items-center justify-center">
        <FileIcon className="w-24 h-24 text-slate-300 mb-4" />
        <p className="text-sm text-slate-500 text-center">Select a file to view details</p>
      </aside>
    </div>
  );
}

function SheetsPageContent({addTab}: {addTab: (type: DocumentTab['type'], title?: string) => void}) {
  return (
    <div className="flex flex-1">
      <main className="flex-1 p-6 bg-white overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => addTab('excel', 'Blank Workbook')}><Plus className="w-4 h-4 mr-2" />Blank</Button>
                <Button variant="outline" size="sm"><Folder className="w-4 h-4 mr-2" />Open</Button>
                <Button variant="outline" size="sm"><LayoutGrid className="w-4 h-4 mr-2" />Create from Template</Button>
            </div>
        </div>
      </main>
      <aside className="w-64 bg-white border-l border-slate-200 p-6 flex flex-col items-center justify-center">
        <FileIcon className="w-24 h-24 text-slate-300 mb-4" />
        <p className="text-sm text-slate-500 text-center">Select a file to view details</p>
      </aside>
    </div>
  );
}

function PdfPageContent({addTab}: {addTab: (type: DocumentTab['type'], title?: string) => void}) {
  return (
    <div className="flex flex-1">
      <main className="flex-1 p-6 bg-white overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
                <Button size="sm"><Folder className="w-4 h-4 mr-2" />Open</Button>
                <Button variant="outline" size="sm"><FileUp className="w-4 h-4 mr-2" />From File</Button>
                <Button variant="outline" size="sm" onClick={() => addTab('pdf', 'Blank PDF')}><FilePlus className="w-4 h-4 mr-2" />Blank</Button>
                <Button variant="outline" size="sm"><FilePen className="w-4 h-4 mr-2" />PDF Edit</Button>
                <Button variant="outline" size="sm"><File className="w-4 h-4 mr-2" />PDF to Word</Button>
                <Button variant="outline" size="sm"><PenSquare className="w-4 h-4 mr-2" />Request E-signatures</Button>
                <Button variant="outline" size="sm"><FileText className="w-4 h-4 mr-2" />Extract Text</Button>
                <Button variant="outline" size="sm">More <ChevronDown className="w-4 h-4 ml-2" /></Button>
            </div>
        </div>
      </main>
      <aside className="w-64 bg-white border-l border-slate-200 p-6 flex flex-col items-center justify-center">
        <FileIcon className="w-24 h-24 text-slate-300 mb-4" />
        <p className="text-sm text-slate-500 text-center">Select a file to view details</p>
      </aside>
    </div>
  );
}


function DocumentTabs({ tabs, activeTab, setActiveTab, addTab, removeTab }: {
  tabs: DocumentTab[];
  activeTab: number;
  setActiveTab: (id: number) => void;
  addTab: (type: DocumentTab['type'], title?: string, projectId?: string) => void;
  removeTab: (id: number) => void;
}) {
  return (
    <div className="flex items-center bg-slate-100 border-b border-slate-200 pl-20">
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
    
    // If opening an existing project, check if it's already open
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
        setActiveNavItem('Home'); // Switch back to home to not have 'new' be a sticky nav state
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
    newSession(); // Clear any existing state
    loadState(project);
    addTab('word', project.name || 'Untitled Project', project.id);
  }

  const currentTab = tabs.find(t => t.id === activeTab);
  
  const renderMainContent = () => {
    if (!currentTab) return null;

    if (['word', 'powerpoint', 'excel', 'pdf'].includes(currentTab.type)) {
      return <EditorPage fileType={currentTab.type} />;
    }

    if (currentTab.type === 'new') {
        return <CreateNewPage addTab={addTab} />;
    }

    // Home Tab logic
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
          {/* Top document tabs */}
          <DocumentTabs
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            addTab={addTab}
            removeTab={removeTab}
          />
           {/* Navigation Rail */}
          <div className="absolute top-0 left-0 w-20 h-full bg-slate-200 border-r border-slate-300 flex flex-col items-center py-4 space-y-4 z-10">
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
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex flex-1 pl-20 bg-slate-100">
             {renderMainContent()}
        </div>
      </div>
    </div>
  );
}
