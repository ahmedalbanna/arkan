
'use client';

import { cn } from '@/lib/utils/cn';
import React from 'react';

interface A4PageProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
}

const A4Page = ({ children, title, className }: A4PageProps) => {
    return (
        <div
            className={cn(
                "relative group bg-background shadow-lg p-8 md:p-12 mx-auto my-4 w-full max-w-[210mm]",
                title ? "min-h-[297mm]" : "",
                className,
            )}
        >
            {title && <h2 className="text-2xl font-bold font-headline text-primary border-b pb-2 mb-6">{title}</h2>}
            <div className="prose dark:prose-invert max-w-none text-sm">{children}</div>
        </div>
    );
}

export default A4Page;
