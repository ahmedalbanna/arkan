
'use client';

import { useLocalization } from '@/context/LocalizationContext';
import { SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ManageGenerationTemplatesPage() {
  const { t } = useLocalization();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-destructive flex items-center justify-center gap-4">
          <SlidersHorizontal className="w-10 h-10" />
          Feature Removed
        </h1>
        <p className="text-lg text-muted-foreground mt-4">
          The concept of 'Generation Templates' has been removed to simplify the user experience. Agent and style configurations are now managed separately.
        </p>
         <Button asChild className="mt-6">
            <Link href="/admin/dashboard">
              Go to Dashboard
            </Link>
          </Button>
    </div>
  );
}
