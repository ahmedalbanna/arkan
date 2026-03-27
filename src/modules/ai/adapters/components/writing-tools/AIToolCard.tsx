'use client';

import { Card } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

interface AIToolCardProps {
  name: string;
  icon: string;
  href: string;
}

export function AIToolCard({ name, icon, href }: AIToolCardProps) {
  const Icon = (LucideIcons as any)[icon] || LucideIcons.Wand2;

  return (
    <Link href={href}>
      <Card className="group relative bg-card p-8 rounded-[24px] border border-border/40 hover:border-primary/40 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 h-full">
        {/* Ghost Icon Backdrop */}
        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-all duration-700 rotate-12">
            <Icon className="w-24 h-24 text-primary" />
        </div>

        <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-inner">
                    <Icon className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="text-[8px] uppercase tracking-widest font-bold opacity-40 group-hover:opacity-100 transition-opacity border-primary/20 bg-background">
                    Tool
                </Badge>
            </div>
            
            <h3 className="text-lg font-bold font-headline mb-2 tracking-tight group-hover:text-primary transition-colors leading-tight">{name}</h3>
            
            <div className="mt-auto pt-4 flex items-center text-[9px] font-bold uppercase tracking-[0.2em] text-primary opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                Initialize Tool <ChevronRight className="h-3 w-3 ml-1" />
            </div>
        </div>
      </Card>
    </Link>
  );
}
