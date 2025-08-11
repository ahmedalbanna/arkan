
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { WLogo, PLogo, SLogo } from './NavItem';

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

export function MyTemplatesPage() {
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
