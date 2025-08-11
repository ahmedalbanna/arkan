
'use client';

import { Button } from '@/components/ui/button';
import {
  Plus,
  Folder,
  LayoutGrid,
} from 'lucide-react';
import { DocumentTab } from './DocumentTabs';

export function SheetsPageContent({addTab}: {addTab: (type: DocumentTab['type'], title?: string) => void}) {
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
        <div className="w-24 h-24 text-slate-300 mb-4" />
        <p className="text-sm text-slate-500 text-center">Select a file to view details</p>
      </aside>
    </div>
  );
}
