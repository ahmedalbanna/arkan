'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { cn } from '@/lib/utils';
import React from 'react';

interface A4PageProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const A4Page = ({ children, title, className }: A4PageProps) => (
    <AnimatedContainer animation="fade-in-up" delay={200}>
        <div className={cn(
            "bg-gradient-to-br from-background via-background to-primary/5 backdrop-blur-sm shadow-soft hover:shadow-glow border rounded-lg p-8 md:p-12 mx-auto my-4 w-full max-w-[210mm] transition-all duration-200",
            title ? "min-h-[297mm]" : "",
            className,
        )}>
            {title && (
                <AnimatedContainer animation="fade-in-up" delay={300}>
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gradient-to-r from-primary/20 to-blue-500/20">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-600 shadow-soft">
                            <div className="w-4 h-4 bg-white rounded-sm"></div>
                        </div>
                        <h2 className="text-2xl font-bold font-headline text-primary">{title}</h2>
                    </div>
                </AnimatedContainer>
            )}
            <AnimatedContainer animation="fade-in-up" delay={400}>
                <div className="prose dark:prose-invert max-w-none text-sm">{children}</div>
            </AnimatedContainer>
        </div>
    </AnimatedContainer>
);

export default A4Page;
