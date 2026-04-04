'use client';

import React from 'react';
import { cn } from '@/infrastructure/utils/cn';

interface BuilderLayoutProps {
    header: React.ReactNode;
    leftSidebar?: React.ReactNode;
    rightSidebar?: React.ReactNode;
    canvas: React.ReactNode;
    className?: string;
}

export const BuilderLayout: React.FC<BuilderLayoutProps> = ({
    header,
    leftSidebar,
    rightSidebar,
    canvas,
    className,
}) => {
    return (
        <div className={cn("relative flex-grow flex flex-col bg-background h-[calc(100vh-64px)] overflow-hidden", className)}>
            {header && (
                <div className="flex-shrink-0 px-6 pt-6">
                    {header}
                </div>
            )}
            <main className="flex-1 flex min-h-0 gap-6 px-6 pb-6">
                {leftSidebar && (
                    <div className="flex-shrink-0 h-full">
                        {leftSidebar}
                    </div>
                )}
                <div className="flex-1 min-w-0 h-full">
                    {canvas}
                </div>
                {rightSidebar && (
                    <div className="flex-shrink-0 h-full">
                        {rightSidebar}
                    </div>
                )}
            </main>
        </div>
    );
};
