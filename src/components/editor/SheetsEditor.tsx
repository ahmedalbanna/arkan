
'use client';

import Image from 'next/image';
import SheetsFooter from './SheetsFooter';

export default function SheetsEditor() {
    return (
        <div className="grow flex flex-col bg-slate-200 overflow-auto">
            <div className="shrink-0 bg-slate-50 border-b border-slate-200 p-1 flex items-center gap-2">
                <input defaultValue="A1" className="w-24 h-8 text-center border rounded-md" />
                <button className="p-1">fx</button>
                <input className="grow h-8 bg-white border rounded-md p-2" />
            </div>
            <div className="grow p-4">
                 <Image src="https://placehold.co/1200x600.png" alt="Budget Report" width={1200} height={600} data-ai-hint="budget report" />
            </div>
            <SheetsFooter />
        </div>
    )
}
