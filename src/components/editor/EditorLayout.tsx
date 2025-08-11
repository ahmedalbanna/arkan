
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import EditorToolbar from './EditorToolbar';
import PresentationEditor from './PresentationEditor';
import SheetsEditor from './SheetsEditor';
import ParallelTranslatePanel from './ParallelTranslatePanel';
import { EditorFileMenu } from './EditorFileMenu';

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
    ssr: false,
});


interface EditorLayoutProps {
  fileType: 'word' | 'powerpoint' | 'excel' | 'pdf';
}

const editorRecentFiles = [
    { icon: 'word', name: 'Co-op Final Report - ... -Osaimi - Report.wps', location: 'Desktop/', modified: 'Today 0:41:45' },
    { icon: 'word', name: 'Co-op Final Report - ... -Osaimi - Report.docx', location: 'Downloads/', modified: 'Yesterday 23:58:47' },
    { icon: 'word', name: 'WPS Docs Quick Start Guide.docx', location: 'C:/Users/ahmed/AppData/Roaming/kingso...', modified: 'Yesterday 23:56:23' },
];

export default function EditorLayout({ fileType }: EditorLayoutProps) {
    const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
    const [isTranslatePanelOpen, setIsTranslatePanelOpen] = useState(false);
    const [isCreateWithAiOpen, setIsCreateWithAiOpen] = useState(false);

    const editorContentForTranslate = 'Automated report generation involves the use of software to compile and present data in a structured format without the need for manual intervention. This process can significantly save time and reduce errors associated with manual reporting. Typical features of automated reporting tools include data extraction, template creation, and real time data analzsis, allowing users to generate reports quickly and efficiently. Organizations often use these tools to enhance their decision-making processes based on timely insights from their data.';
    
    if (isTranslatePanelOpen) {
        return <ParallelTranslatePanel content={editorContentForTranslate} onClose={() => setIsTranslatePanelOpen(false)} />
    }

    const renderEditor = () => {
        switch(fileType) {
            case 'excel':
                return <SheetsEditor />;
            case 'powerpoint':
                return <PresentationEditor isCreateWithAiOpen={isCreateWithAiOpen} onCreateWithAiOpenChange={setIsCreateWithAiOpen} />;
            case 'word':
            default:
                return <RichTextEditor onTranslateClick={() => setIsTranslatePanelOpen(true)} />;
        }
    }

    return (
        <div className="relative flex flex-col h-full w-full bg-slate-200">
            {isFileMenuOpen && <EditorFileMenu onClose={() => setIsFileMenuOpen(false)} recentFiles={editorRecentFiles}/>}
             <EditorToolbar 
                onFileMenuClick={() => setIsFileMenuOpen(true)}
                onTranslateClick={() => setIsTranslatePanelOpen(true)}
                onCreateWithAiClick={() => setIsCreateWithAiOpen(true)}
                fileType={fileType}
            />
            {renderEditor()}
        </div>
    )
}
