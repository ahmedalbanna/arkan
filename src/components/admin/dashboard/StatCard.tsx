
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value?: string;
    icon: LucideIcon;
}

export function StatCard({ title, value, icon: Icon }: StatCardProps) {
    return (
        <AnimatedContainer animation="fade-in-up" delay={100}>
            <Card variant="glass" className="backdrop-blur-md shadow-soft hover:shadow-glow hover:-translate-y-1 transition-all duration-200 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-primary/5 to-blue-500/5">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-blue-500/10 group-hover:from-primary/20 group-hover:to-blue-500/20 transition-all duration-200">
                        <Icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-200" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        {value ?? '...'}
                    </div>
                </CardContent>
            </Card>
        </AnimatedContainer>
    );
}
