
'use client';

import { cn } from "@/infrastructure/utils/cn";
import type { DiffPart } from "@/modules/projects/domain/utils/diff";

export const DiffView = ({ diff }: { diff: DiffPart[] }) => {
    return (
        <div className="whitespace-pre-wrap text-[13px] leading-relaxed font-mono p-4 rounded-xl bg-muted/5 border shadow-inner">
            {diff.map((part, index) => (
                <span key={index} className={cn(
                    "transition-colors duration-300 rounded-sm px-0.5",
                    {
                        'bg-green-500/10 text-green-600 dark:text-green-400 font-bold border-b border-green-500/20': part.type === 'added',
                        'bg-destructive/10 text-destructive/60 line-through decoration-destructive/40': part.type === 'removed',
                        'text-muted-foreground/80': !part.type || part.type === 'unchanged'
                    }
                )}>
                    {part.value}
                </span>
            ))}
        </div>
    )
}
