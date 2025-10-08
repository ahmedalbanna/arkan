
'use client';

import {
  PlusCircle, Folder, Save, Copy, FileUp, ImageIcon, Printer, Share, Shield, RefreshCw, HelpCircle,
  Settings, LogOut, ChevronRight, File as FileIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const menuItems = [
    { icon: <PlusCircle className="w-5 h-5" />, label: "New", hasArrow: true },
    { icon: <Folder className="w-5 h-5" />, label: "Open", active: true },
    { icon: <Save className="w-5 h-5" />, label: "Save" },
    { icon: <Copy className="w-5 h-5" />, label: "Save As", hasArrow: true },
    { icon: <FileUp className="w-5 h-5" />, label: "Export to PDF" },
    { icon: <ImageIcon className="w-5 h-5" />, label: "Export to Picture" },
    { icon: <Printer className="w-5 h-5" />, label: "Print", hasArrow: true },
    { icon: <Share className="w-5 h-5" />, label: "Share", hasArrow: true },
    { icon: <Shield className="w-5 h-5" />, label: "Document Encryption", hasArrow: true },
    { icon: <RefreshCw className="w-5 h-5" />, label: "Backup and Recovery", hasArrow: true },
    { icon: <HelpCircle className="w-5 h-5" />, label: "Help", hasArrow: true },
    { icon: <Settings className="w-5 h-5" />, label: "Options" },
    { icon: <LogOut className="w-5 h-5" />, label: "Exit" },
];

function getFileIcon(type: string) {
    if (type.includes('word')) return <div className="w-6 h-6 bg-[#2E68EB] text-white flex items-center justify-center rounded-sm text-xs font-bold">W</div>;
    return <FileIcon className="w-6 h-6 text-slate-500" />;
}

export const EditorFileMenu = ({ onClose, recentFiles }: { onClose: () => void, recentFiles: any[] }) => {
    return (
        <div className="absolute top-0 left-0 h-full w-full bg-black/30 z-40" onClick={onClose}>
            <div className="absolute top-0 left-0 h-auto bg-white shadow-lg z-50 flex" onClick={(e) => e.stopPropagation()}>
                <div className="w-64 bg-slate-50 p-2">
                    <nav className="space-y-1">
                        {menuItems.map((item, index) => (
                            <Button
                                key={index}
                                variant={item.active ? 'secondary' : 'ghost'}
                                className={`w-full justify-start text-base font-normal h-11 ${item.active ? 'bg-blue-100 text-blue-700' : ''}`}
                            >
                                {item.icon}
                                <span className="grow text-left">{item.label}</span>
                                {item.hasArrow && <ChevronRight className="w-4 h-4" />}
                            </Button>
                        ))}
                    </nav>
                </div>
                <div className="w-96 p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-slate-800">Recent list</h3>
                        <RefreshCw className="w-4 h-4 text-slate-500 cursor-pointer" />
                    </div>
                    <div className="space-y-2">
                        {recentFiles.map((file, index) => (
                            <button key={index} className="w-full text-left p-2 rounded-md hover:bg-slate-100 flex items-start gap-3">
                                <div className="mt-1">{getFileIcon(file.icon)}</div>
                                <div>
                                    <p className="font-medium text-slate-800 text-sm">{file.name.split(' - ')[0]}</p>
                                    <p className="text-xs text-slate-500">{file.location}</p>
                                </div>
                                <span className="text-xs text-slate-400 ml-auto shrink-0">{file.modified.split(' ')[1]}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
