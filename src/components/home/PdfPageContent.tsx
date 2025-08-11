
'use client';

import { Button } from '@/components/ui/button';
import {
  Plus,
  Folder,
  FilePen,
  ChevronDown,
  FileUp,
  FilePlus,
  PenSquare,
  FileText
} from 'lucide-react';
import { DocumentTab } from './DocumentTabs';

export function PdfPageContent({addTab}: {addTab: (type: DocumentTab['type'], title?: string) => void}) {
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

function FileIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
}
