
'use client';

import { useProjects } from '@/hooks/use-projects';
import { Button } from '@/components/ui/button';
import { SavedProject } from '@/lib/types';
import { WLogo } from './NavItem';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Folder,
  LayoutGrid,
  Sparkles,
  Wand2,
  BookOpen,
  BookText,
  ChevronDown,
  RefreshCw,
  Settings,
  Info,
  File as FileIcon,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DocumentTab } from './DocumentTabs';

export function DocsPageContent({addTab}: {addTab: (type: DocumentTab['type'], title?: string) => void}) {
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
