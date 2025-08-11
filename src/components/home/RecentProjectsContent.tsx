
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProjects } from '@/hooks/use-projects';
import { SavedProject } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import {
  RefreshCw,
  Eye,
  Settings,
  Info,
  ChevronDown,
  Loader2,
  AlertCircle,
  Folder
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { WLogo } from './NavItem';


export function RecentProjectsContent({ onProjectClick }: { onProjectClick: (project: SavedProject) => void }) {
    const { data: projects, isLoading, isError, error } = useProjects();

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
