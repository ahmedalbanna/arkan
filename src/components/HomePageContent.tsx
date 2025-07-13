'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, BrainCircuit, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useLocalization } from '@/context/LocalizationContext';

// The 'featuredProjects' prop is no longer used but kept to avoid breaking changes if the page is rendered from different places.
export default function HomePageContent({ featuredProjects }: { featuredProjects: any[] }) {
    const { t, locale } = useLocalization();

    return (
        <div className="flex flex-col">
            <section className="py-20 md:py-32 bg-card">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary mb-4">
                        {t('home.heroTitle')}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                        {t('home.heroSubtitle')}
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button asChild size="lg" className="font-headline">
                            <Link href="/generate-report">
                                {t('home.exploreProjects')} <ArrowLeft className="mr-2 rtl:mr-0 rtl:ml-2" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="secondary" className="font-headline">
                            <Link href="/generate-code">{t('home.trySummarizer')}</Link>
                        </Button>
                    </div>
                </div>
            </section>

            <section className="py-16 md:py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        <div className="flex flex-col items-center">
                            <div className="p-4 bg-primary/10 rounded-full mb-4">
                                <FileSpreadsheet className="w-12 h-12 text-primary" />
                            </div>
                            <h3 className="text-xl font-headline font-semibold mb-2">{t('home.feature1Title')}</h3>
                            <p className="text-muted-foreground">
                                {t('home.feature1Desc')}
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="p-4 bg-primary/10 rounded-full mb-4">
                                <BrainCircuit className="w-12 h-12 text-primary" />
                            </div>
                            <h3 className="text-xl font-headline font-semibold mb-2">{t('home.feature2Title')}</h3>
                            <p className="text-muted-foreground">
                                {t('home.feature2Desc')}
                            </p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="p-4 bg-primary/10 rounded-full mb-4">
                                <ShieldCheck className="w-12 h-12 text-primary" />
                            </div>
                            <h3 className="text-xl font-headline font-semibold mb-2">{t('home.feature3Title')}</h3>
                            <p className="text-muted-foreground">
                                {t('home.feature3Desc')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
