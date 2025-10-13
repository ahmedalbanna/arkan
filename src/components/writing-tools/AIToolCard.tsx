
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
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
    <AnimatedContainer animation="fade-in-up">
      <Link href={href}>
        <Card className="group h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-glow backdrop-blur-md bg-gradient-to-br from-background/70 to-primary/5 border border-primary/10">
          <CardHeader className="flex flex-row items-center gap-4 rounded-t-lg bg-gradient-to-r from-background/60 to-primary/5">
            <div className="p-4 rounded-lg transition-all shadow-soft bg-gradient-to-br from-primary to-primary-600 text-white group-hover:shadow-glow">
              <Icon className="w-8 h-8" />
            </div>
            <CardTitle className="font-headline text-xl">{name}</CardTitle>
          </CardHeader>
        </Card>
      </Link>
    </AnimatedContainer>
  );
}
