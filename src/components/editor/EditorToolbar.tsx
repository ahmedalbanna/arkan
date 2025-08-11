
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { File as FileIcon, Save, Undo, Redo, Printer, Search, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DocumentToolbar } from './toolbars/DocumentToolbar';
import { PresentationToolbar } from './toolbars/PresentationToolbar';
import { SheetsToolbar } from './toolbars/SheetsToolbar';

export default function EditorToolbar({
    onFileMenuClick,
    onTranslateClick,
    fileType,
    onCreateWithAiClick
}: {
    onFileMenuClick: () => void;
    onTranslateClick: () => void;
    fileType: string;
    onCreateWithAiClick: () => void;
}) {
    const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);

    const renderToolbarContent = () => {
        switch(fileType) {
            case 'powerpoint':
                return <PresentationToolbar onTranslateClick={onTranslateClick} onCreateWithAiClick={onCreateWithAiClick} />;
            case 'excel':
                return <SheetsToolbar />;
            case 'word':
            default:
                return <DocumentToolbar onTranslateClick={onTranslateClick} />;
        }
    }

    return (
        <div className="bg-slate-50 p-2 rounded-t-lg border-b border-slate-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onFileMenuClick}><FileIcon className="w-4 h-4" /></Button>
                    <Separator orientation="vertical" className="h-6" />
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Save className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Undo className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Redo className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Printer className="w-4 h-4" /></Button>
                </div>
                <div className="flex items-center gap-2">
                    <Input placeholder="Search" className="h-8 w-40 text-xs hidden md:block" />
                    <Button>Share <ChevronDown className="w-4 h-4"/></Button>
                    <Button variant="ghost" size="icon" onClick={() => setIsToolbarCollapsed(!isToolbarCollapsed)}>
                        {isToolbarCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            {!isToolbarCollapsed && (
                <>
                    <Separator className="my-2" />
                    {renderToolbarContent()}
                </>
            )}
        </div>
    )
}
