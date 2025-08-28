
'use client';

import { useLocalization } from "@/context/LocalizationContext";
import { FileText } from "lucide-react";
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const ConverterSkeleton = () => (
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-10 w-full" />
            </CardContent>
            <CardFooter>
                 <Skeleton className="h-10 w-48" />
            </CardFooter>
        </Card>
    </div>
);


const PdfToMarkdownConverter = dynamic(() => import("@/components/tools/PdfToMarkdownConverter"), {
    ssr: false,
    loading: () => <ConverterSkeleton />
});

export default function PdfToMarkdownPage() {
  const { t } = useLocalization();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <FileText className="w-10 h-10" />
          {t('pdfToMarkdown.pageTitle')}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {t('pdfToMarkdown.pageSubtitle')}
        </p>
      </div>
      <PdfToMarkdownConverter />
    </div>
  );
}
