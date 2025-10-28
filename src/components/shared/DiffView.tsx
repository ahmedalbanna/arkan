
'use client';

import { cn } from "@/lib/utils";
import type { DiffPart } from "@/lib/utils/diff";

export const DiffView = ({ diff }: { diff: DiffPart[] }) => {
    return (
        <p className="whitespace-pre-wrap text-sm">
            {diff.map((part, index) => (
                <span key={index} className={cn({
                    'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-sm': part.type === 'added',
                    'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 line-through rounded-sm': part.type === 'removed',
                })}>
                    {part.value}
                </span>
            ))}
        </p>
    )
}
