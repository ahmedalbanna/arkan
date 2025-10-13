'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import type { DiffPart } from "@/lib/diff";
import { cn } from "@/lib/utils";

export const DiffView = ({ diff }: { diff: DiffPart[] }) => {
    return (
        <AnimatedContainer animation="fade-in-up" delay={200}>
            <div className="rounded-lg border bg-gradient-to-r from-muted/30 to-primary/5 backdrop-blur-sm shadow-soft p-4">
                <p className="whitespace-pre-wrap text-sm">
                    {diff.map((part, index) => (
                        <AnimatedContainer key={index} animation="fade-in-up" delay={100 + (index * 50)}>
                            <span className={cn("px-1 py-0.5 rounded-sm transition-all duration-200", {
                                'bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 text-green-800 dark:text-green-300 shadow-soft': part.type === 'added',
                                'bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50 text-red-800 dark:text-red-300 line-through shadow-soft': part.type === 'removed',
                            })}>
                                {part.value}
                            </span>
                        </AnimatedContainer>
                    ))}
                </p>
            </div>
        </AnimatedContainer>
    )
}
