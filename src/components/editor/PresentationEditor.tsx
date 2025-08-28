
'use client';

import Image from 'next/image';
import { CreateWithAiPanel } from './CreateWithAiPanel';
import { usePresentationStore } from '@/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PresentationViewer } from './PresentationViewer';

export default function PresentationEditor({ isCreateWithAiOpen, onCreateWithAiOpenChange }: { isCreateWithAiOpen: boolean, onCreateWithAiOpenChange: (isOpen: boolean) => void }) {
    const { activePresentationId, presentation } = usePresentationStore();
    const activePresentation = presentation?.history.find(p => p.id === activePresentationId);

    return (
        <div className="flex-grow flex bg-slate-200 overflow-hidden">
            <aside className="w-48 bg-white p-2 overflow-y-auto border-r border-slate-200">
                <div className="space-y-2">
                    {activePresentation?.slides.map((slide, index) => (
                        <div key={index} className="w-full h-24 bg-slate-100 rounded-md border-2 border-blue-500 flex items-center justify-center text-slate-400 relative">
                           <span className="absolute top-1 left-1 text-xs">{index + 1}</span>
                           <p className="text-xs p-1 text-center truncate">{slide.title}</p>
                        </div>
                    ))}
                    {!activePresentation && (
                         <div className="w-full h-24 bg-slate-100 rounded-md flex items-center justify-center text-slate-400">
                           1
                        </div>
                    )}
                </div>
            </aside>
            <main className="flex-grow p-8 flex items-center justify-center">
                 <div className="w-full h-full bg-white shadow-md">
                    {activePresentation ? (
                        <PresentationViewer activePresentation={activePresentation} />
                    ) : (
                         <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <p>Select a presentation or create a new one.</p>
                        </div>
                    )}
                </div>
            </main>
            {isCreateWithAiOpen && <CreateWithAiPanel isOpen={isCreateWithAiOpen} onOpenChange={onCreateWithAiOpenChange} />}
        </div>
    )
}
