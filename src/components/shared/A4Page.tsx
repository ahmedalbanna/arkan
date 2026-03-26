
'use client';

import { cn } from '@/infrastructure/utils/cn';
import React from 'react';

interface A4PageProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
    viewMode?: 'single' | 'continuous' | 'carousel';
}

export const A4Page = ({ children, title, className, viewMode = 'single' }: A4PageProps) => {
    return (
        <div
            className={cn(
                "relative group bg-background p-8 md:p-12 mx-auto flex flex-col",
                viewMode !== 'carousel' && 'shadow-lg my-4',
                viewMode === 'single' && 'w-full max-w-[210mm] min-h-[297mm] box-border border border-border/50 dark:border-border/30',
                viewMode === 'continuous' && 'w-full max-w-4xl shadow-none border-none',
                viewMode === 'carousel' && 'w-full h-full shadow-lg box-border border border-border/50 dark:border-border/30',
                className
            )}
        >
            {title && <h2 className="text-2xl font-bold font-headline text-primary border-b pb-2 mb-6">{title}</h2>}
            <div className="prose dark:prose-invert max-w-none text-sm flex-grow">{children}</div>
        </div>
    );
}

export default A4Page;
