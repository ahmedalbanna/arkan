
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

export default function AcademicSolverPage() {

  return (
    <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Feature Moved</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            The Academic Solver has been integrated into the main Builder page for a more unified experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            You can now access all the academic solving tools directly within the builder&apos;s tabbed interface.
          </p>
          <Button asChild className="mt-6">
            <Link href="/generate?tab=academic">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Go to Builder
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
