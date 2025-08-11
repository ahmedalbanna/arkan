
'use client';

export default function SheetsFooter() {
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
