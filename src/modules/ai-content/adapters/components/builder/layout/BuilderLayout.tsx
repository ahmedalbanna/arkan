'use client';

import React from 'react';
import { cn } from '@/infrastructure/utils/cn';

interface BuilderLayoutProps {
    header: React.ReactNode;
    leftSidebar?: React.ReactNode;
    rightSidebar?: React.ReactNode;
    canvas: React.ReactNode;
    floatingElements?: React.ReactNode;
    className?: string;
}

export const BuilderLayout: React.FC<BuilderLayoutProps> = ({
    header,
    leftSidebar,
    rightSidebar,
    canvas,
    floatingElements,
    className,
}) => {
    return (
        <div className={cn("relative flex-grow flex flex-col bg-background h-[calc(100vh-64px)] overflow-hidden", className)}>
            <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
                {/* Floating Global Header HUD */}
                {header && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[95vw] pointer-events-none">
                        {header}
                    </div>
                )}

                {/* Base Canvas Layer */}
                <div className="absolute inset-0 z-10">
                    {canvas}
                </div>

                {/* Floating Sidebar Controls */}
                <div className="absolute inset-0 z-30 pointer-events-none flex items-stretch justify-between p-6">
                    {/* Left Sidebar HUD */}
                    {leftSidebar && (
                        <div className="pointer-events-auto h-full flex flex-col">
                            {leftSidebar}
                        </div>
                    )}

                    {/* Right Sidebar HUD */}
                    {rightSidebar && (
                        <div className="pointer-events-auto h-full flex flex-col">
                            {rightSidebar}
                        </div>
                    )}
                </div>

                {/* Additional Global Floating Layers (Outline, Chat, etc.) */}
                {floatingElements}
            </main>
        </div>
    );
};
