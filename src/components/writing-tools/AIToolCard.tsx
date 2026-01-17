'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import Link from 'next/link';

interface AIToolCardProps {
  name: string;
  icon: string; // Changed from LucideIcon to string
  href: string;
}

export function AIToolCard({ name, icon, href }: AIToolCardProps) {
  // Dynamically get the icon component from lucide-react
  const Icon = (LucideIcons as any)[icon] || LucideIcons.Wand2; // Fallback to a default icon

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
