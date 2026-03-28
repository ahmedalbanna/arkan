
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value?: string;
    icon: LucideIcon;
}

import { Badge } from '@/components/ui/badge';
import { cn } from '@/infrastructure/utils/cn';

export function StatCard({ title, value, icon: Icon }: StatCardProps) {
    return (
        <Card className="group relative flex flex-col p-6 rounded-3xl border border-border/40 hover:border-primary/40 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 bg-card overflow-hidden">
            {/* Ghost Icon Backdrop */}
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-all duration-700 rotate-12">
                <Icon className="w-32 h-32 text-primary" />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner">
                        <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="h-4.5 text-[8px] uppercase tracking-tighter px-1.5 rounded-sm font-bold border-none bg-primary/5 text-primary opacity-40 group-hover:opacity-100 transition-opacity">
                        Metric Node
                    </Badge>
                </div>
                
                <div className="space-y-1">
                    <div className="text-3xl font-black tracking-tight tabular-nums transition-all duration-500 group-hover:text-primary">
                        {value ?? '...'}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 transition-colors group-hover:text-muted-foreground">
                        {title}
                    </p>
                </div>
            </div>
            
            {/* Animated Bottom Progress Strip */}
            <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-0 group-hover:w-full transition-all duration-700 ease-in-out" />
        </Card>
    );
}
