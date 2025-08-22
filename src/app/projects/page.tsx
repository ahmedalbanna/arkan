
'use client';

import { useState } from 'react';
import { useProjects } from '@/hooks/use-projects';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, FolderOpen, RefreshCw } from 'lucide-react';
import { ProjectCard } from '@/components/project/ProjectCard';
import { Button } from '@/components/ui/button';
import { CreateProjectDialog } from '@/components/project/CreateProjectDialog';
import { UploadProjectButton } from '@/components/project/UploadProjectButton';
import { cn } from '@/lib/utils';
import { useLocalization } from '@/context/LocalizationContext';

function ProjectsPageSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
        </div>
    );
}

export default function MyProjectsPage() {
    const { t } = useLocalization();
    const { projects, isLoading, isError, error, refetch, isRefetching } = useProjects();

    return (
        <div className="container mx-auto max-w-7xl px-4 py-12">
            <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
                <div className="text-center sm:text-left">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <FolderOpen className="w-10 h-10" />
                        {t('projects.pageTitle')}
                    </h1>
                    <p className="text-lg text-muted-foreground mt-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        {t('projects.pageSubtitle')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => refetch()} disabled={isRefetching} className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <RefreshCw className={cn("me-2 h-4 w-4", isRefetching && "animate-spin")} />
                        {t('projects.refreshButton')}
                    </Button>
                    <UploadProjectButton />
                    <CreateProjectDialog />
                </div>
            </div>

            {isLoading ? (
                <ProjectsPageSkeleton />
            ) : isError ? (
                <div className="text-center py-10 px-4 border rounded-lg bg-card text-destructive">
                    <AlertCircle className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-semibold">{t('projects.errorLoading')}</h3>
                    <p className="mt-2 text-sm">{error.message}</p>
                </div>
            ) : projects && projects.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {projects.map((project, index) => (
                        <div key={project.id} className="animate-fade-in-up" style={{ animationDelay: `${0.3 + index * 0.05}s` }}>
                            <ProjectCard project={project} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg bg-card">
                    <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">{t('projects.noProjectsTitle')}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t('projects.noProjectsDescription')}
                    </p>
                </div>
            )}
        </div>
    );
}
