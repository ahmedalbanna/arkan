'use client';

import React from 'react';

export const A4Page = ({ children, title }: { children: React.ReactNode, title?: string }) => (
    <div className="bg-background shadow-lg p-8 md:p-12 mx-auto my-4 max-w-[210mm] w-full overflow-hidden" style={{ minHeight: '297mm' }}>
        {title && <h2 className="text-2xl font-bold font-headline text-primary border-b pb-2 mb-6">{title}</h2>}
        <div className="prose dark:prose-invert max-w-none text-sm">{children}</div>
    </div>
);
