// C:\Users\ahmed\source\repos\arkan\src\app\admin\manage-sections\page.tsx
'use client';

import { useSections } from '@/hooks/use-sections';
import { SectionDataTable } from '@/components/admin/sections/SectionDataTable';
import { columns } from '@/components/admin/sections/columns';
import { Skeleton } from '@/components/ui/skeleton';
import { SectionFormDialog } from '@/components/admin/sections/SectionFormDialog';
import { useLocalization } from '@/context/LocalizationContext';

export default function ManageSectionsPage() {
    const { t } = useLocalization();
    const { data: sections, isLoading, isError } = useSections();

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-10 w-1/4" />
                    <Skeleton className="h-10 w-24" />
                </div>
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    if (isError) {
        return <div className="p-6 text-destructive">Error loading sections. Please try again.</div>;
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold font-headline">{t('admin.manageSections.title')}</h1>
                <SectionFormDialog />
            </div>
            <SectionDataTable columns={columns} data={sections || []} />
        </div>
    );
}
