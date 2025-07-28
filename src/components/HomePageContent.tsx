
'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, BrainCircuit, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useLocalization } from '@/context/LocalizationContext';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';
import { cn } from '@/lib/utils';

// The 'featuredProjects' prop is no longer used but kept to avoid breaking changes if the page is rendered from different places.
export default function HomePageContent({ featuredProjects }: { featuredProjects: any[] }) {
    const { t, locale } = useLocalization();

    const features = [
      {
        icon: FileSpreadsheet,
        title: t('home.feature1Title'),
        description: t('home.feature1Desc'),
      },
      {
        icon: BrainCircuit,
        title: t('home.feature2Title'),
        description: t('home.feature2Desc'),
      },
      {
        icon: ShieldCheck,
        title: t('home.feature3Title'),
        description: t('home.feature3Desc'),
      },
    ];

    return (
        <div className="flex flex-col">
            <section className="py-20 md:py-32 bg-background overflow-hidden">
                <div className="container mx-auto px-4 text-center">
                    <div className="inline-block mb-4">
                        <div className="text-6xl font-headline font-bold text-primary animate-fade-in-up">
                            {t('header.title')}
                        </div>
                    </div>
                    <div className="inline-block">
                         <h1 
                          className={cn(
                            "text-2xl sm:text-3xl md:text-4xl font-headline font-semibold text-muted-foreground mb-4 overflow-hidden border-r-4 border-r-primary whitespace-nowrap mx-auto animate-typing",
                            locale === 'ar' && "border-r-0 border-l-4 border-l-primary"
                          )}
                         >
                            {t('home.heroTitle.animated')}
                        </h1>
                    </div>
                    <p 
                      className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in-up"
                      style={{ animationDelay: '2.6s' }}
                    >
                        {t('home.heroSubtitle')}
                    </p>
                    <div 
                      className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in-up"
                      style={{ animationDelay: '2.7s' }}
                    >
                        <Button asChild size="lg" className="font-headline w-full sm:w-auto">
                            <Link href="/generate">
                                {t('home.exploreProjects')} <ArrowRight className="ml-2 rtl:ml-0 rtl:mr-2" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="secondary" className="font-headline w-full sm:w-auto">
                            <Link href="/generate?tab=code">{t('home.trySummarizer')}</Link>
                        </Button>
                    </div>
                </div>
            </section>

            <section className="py-16 md:py-24 bg-muted/20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        {features.map((feature, index) => (
                           <Card 
                            key={index} 
                            className="p-8 flex flex-col items-center group hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-in-up bg-card"
                            style={{ animationDelay: `${2.8 + index * 0.1}s` }}
                           >
                              <div className="p-5 bg-primary/10 rounded-full mb-6 transition-colors group-hover:bg-primary">
                                  <feature.icon className="w-12 h-12 text-primary transition-colors group-hover:text-primary-foreground" />
                              </div>
                              <h3 className="text-2xl font-headline font-semibold mb-3">{feature.title}</h3>
                              <p className="text-muted-foreground leading-relaxed">
                                  {feature.description}
                              </p>
                           </Card>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
