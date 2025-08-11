
'use client';

import Image from 'next/image';
import { CreateWithAiPanel } from './CreateWithAiPanel';

export default function PresentationEditor({ isCreateWithAiOpen, onCreateWithAiOpenChange }: { isCreateWithAiOpen: boolean, onCreateWithAiOpenChange: (isOpen: boolean) => void }) {
    return (
        <div className="flex-grow flex bg-slate-200 overflow-hidden">
            <aside className="w-48 bg-white p-2 overflow-y-auto border-r border-slate-200">
                <div className="space-y-2">
                    <div className="w-full h-24 bg-slate-100 rounded-md border-2 border-blue-500 flex items-center justify-center text-slate-400">
                        1
                    </div>
                    <div className="w-full h-24 bg-slate-100 rounded-md flex items-center justify-center text-slate-400">
                        2
                    </div>
                </div>
            </aside>
            <main className="flex-grow p-8 flex items-center justify-center">
                <div className="w-full h-full bg-white shadow-md">
                    {/* Placeholder for slide content */}
                </div>
            </main>
            {isCreateWithAiOpen && <CreateWithAiPanel isOpen={isCreateWithAiOpen} onOpenChange={onCreateWithAiOpenChange} />}
        </div>
    )
}
