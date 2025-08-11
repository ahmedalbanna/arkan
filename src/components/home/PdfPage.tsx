
'use client';

import {
  FilePen,
  Combine,
  Split,
  Shrink,
  FileImage,
  ImageIcon,
  Folder,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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

export function PdfPage() {
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

function WLogo() {
  return <div className="w-4 h-4 bg-[#2E68EB] text-white flex items-center justify-center rounded-sm text-xs font-bold">W</div>;
}
function PLogo() {
  return <div className="w-4 h-4 bg-[#D95F3B] text-white flex items-center justify-center rounded-sm text-xs font-bold">P</div>;
}
function SLogo() {
  return <div className="w-4 h-4 bg-[#308A5D] text-white flex items-center justify-center rounded-sm text-xs font-bold">S</div>;
}
function FileIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
}
