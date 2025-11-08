
'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface AIToolCardProps {
  name: string;
  icon: LucideIcon;
  href: string;
}

export function AIToolCard({ name, icon: Icon, href }: AIToolCardProps) {
  return (
    <Link href={href}>
      <Card className="group hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-lg transition-colors group-hover:bg-primary">
            <Icon className="w-8 h-8 text-primary transition-colors group-hover:text-primary-foreground" />
          </div>
          <CardTitle className="font-headline text-xl">{name}</CardTitle>
        </CardHeader>
      </Card>
    </Link>
  );
}
