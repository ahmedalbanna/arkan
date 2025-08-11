
'use client';

import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, File as FileIcon } from 'lucide-react';
import { DocumentTab } from './DocumentTabs';
import { TemplateCard } from './TemplateCard';
import { templates } from './CreateNewPage';

export function DocsPageContent({addTab}: {addTab: (type: DocumentTab['type'], title?: string) => void}) {
  
  const docTemplates = templates.docs;

  return (
    <div className="flex flex-1">
      <main className="flex-1 p-6 bg-white overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => addTab('word', 'Blank Document')}><Plus className="w-4 h-4 mr-2" />Blank</Button>
                <Button variant="outline" size="sm"><LayoutGrid className="w-4 h-4 mr-2" />Create from Template</Button>
            </div>
        </div>
        <div className="bg-slate-50 p-6 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {docTemplates.recommended.map(t => (
                    <TemplateCard key={t.title} {...t} size="large" onClick={() => addTab(t.type, t.title)} />
                ))}
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
