
'use client';

import { useSections } from '@/hooks';
import { SectionDataTable } from '@/modules/ai-content/adapters/components/admin/sections/SectionDataTable';
import { columns } from '@/modules/ai-content/adapters/components/admin/sections/columns';
import { SectionProperties } from '@/modules/ai-content/domain/entities/Section';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionFormDialog } from '@/modules/ai-content/adapters/components/admin/sections/SectionFormDialog';
import { useLocalization } from '@/context/LocalizationContext';

import { Badge } from '@/components/ui/badge';
import { Layers, Database, ShieldCheck, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function ManageSectionsPage() {
    const { t } = useLocalization();
    const { data: sections, isLoading, isError } = useSections();

    if (isLoading) {
        return (
            <div className="flex flex-col space-y-10">
                <div className="space-y-4">
                    <Skeleton className="h-6 w-32 rounded-full" />
                    <Skeleton className="h-12 w-64" />
                </div>
                <Skeleton className="h-[500px] w-full rounded-[32px]" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-destructive/5 text-destructive border-destructive/20 max-w-md mx-auto">
                 <Activity className="mx-auto h-10 w-10 mb-4 opacity-40" />
                 <h4 className="text-xs font-bold uppercase tracking-wider mb-1">Matrix Error</h4>
                 <p className="text-[11px] italic leading-relaxed px-8 opacity-80">Failed to synchronize section schema. Please verify system connectivity.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                        <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-background">Content Schema</Badge>
                        <div className="h-3 w-px bg-primary/20" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80 flex items-center gap-1.5">
                            <Layers className="h-3 w-3 fill-primary" />
                            Section Architecture
                        </span>
                    </div>

                    <div className="space-y-1">
                        <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter text-foreground flex items-center gap-4">
                            <Database className="w-10 h-10 text-primary animate-pulse" />
                            {t('admin.manageSections.title')}
                        </h1>
                        <p className="text-lg text-muted-foreground italic font-serif opacity-80 max-w-2xl leading-relaxed">
                            Configure and maintain the global section registry used across all Arkan intelligence workflows.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-background border shadow-sm flex flex-col items-end">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Registry Node</span>
                        <span className="text-xs font-bold text-primary flex items-center gap-1.5 mt-1 uppercase tracking-tighter">
                            Active Inventory
                        </span>
                    </div>
                    <SectionFormDialog />
                </div>
            </div>

            <div className="relative">
                <div className="absolute -top-6 inset-x-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

                <Card className="border-none shadow-2xl shadow-primary/5 bg-card overflow-hidden rounded-[32px]">
                    <header className="px-8 py-6 border-b bg-muted/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                                Global Section Matrix
                            </h3>
                        </div>
                        <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-primary/5">
                            {sections?.length || 0} Entities Indexed
                        </Badge>
                    </header>

                    <CardContent className="p-8 md:p-10">
                        <div className="rounded-2xl border bg-background overflow-hidden shadow-sm shadow-black/[0.02]">
                            <SectionDataTable columns={columns as any} data={(sections || []) as SectionProperties[]} />
                        </div>
                    </CardContent>

                    <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
                        <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
                            Arkan Content Engine • Registry Node V1.0
                        </p>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-3.5 w-3.5 text-primary/40" />
                            <span className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-tighter">
                                Schema Verified
                            </span>
                        </div>
                    </footer>
                </Card>
            </div>
        </div>
    );
}
