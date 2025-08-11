
'use client';

import Image from 'next/image';
import SheetsFooter from './SheetsFooter';

export default function SheetsEditor() {
    return (
        <div className="flex-grow flex flex-col bg-slate-200 overflow-auto">
            <div className="flex-shrink-0 bg-slate-50 border-b border-slate-200 p-1 flex items-center gap-2">
                <input defaultValue="A1" className="w-24 h-8 text-center border rounded-md" />
                <button className="p-1">fx</button>
                <input className="flex-grow h-8 bg-white border rounded-md p-2" />
            </div>
            <div className="flex-grow p-4">
                 <Image src="https://placehold.co/1200x600.png" alt="Budget Report" width={1200} height={600} data-ai-hint="budget report" />
            </div>
            <SheetsFooter />
        </div>
    )
}

function SheetsFooter() {
    return (
        <div className="bg-slate-100 p-1 flex justify-between items-center text-xs text-slate-600 border-t border-slate-200">
            <div className="flex items-center">
                <button className="px-3 py-1 font-semibold bg-white border-r border-slate-200">Template</button>
                <button className="px-3 py-1">Instructions</button>
                <button className="p-1">+</button>
            </div>
            <div className="flex items-center gap-2">
                <span>Ready</span>
            </div>
        </div>
    )
}
