


'use client';

import { useState, useEffect } from 'react';
import { useProjects } from '@/hooks/use-projects'; // Changed from useQuery
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, FolderOpen, PlusCircle, RefreshCw } from 'lucide-react';
import { ProjectCard } from '@/components/project/ProjectCard';
import { Button } from '@/components/ui/button';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { UploadManager } from '@/components/UploadManager';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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

function CreateProjectDialog() {
    const { t } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const newSession = useBuilderStore(state => state.newSession);
    const setProjectName = useBuilderStore(state => state.setProjectName);
    const setProjectIdea = useBuilderStore(state => state.setProjectIdea);
    
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleStartBuilding = () => {
        setProjectName(name);
        setProjectIdea(description);
        router.push('/generate');
        setIsOpen(false);
    }
    
    // This is a proxy for the main button's action
    const handleCreateNewProject = () => {
        newSession();
        setName('');
        setDescription('');
        setIsOpen(true);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button onClick={handleCreateNewProject} className="animate-fade-in-up"  style={{ animationDelay: '0.3s' }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t('projects.createButton')}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{t('projects.createDialogTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('projects.createDialogDescription')}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="project-name">{t('projects.projectNameLabel')}</Label>
                        <Input id="project-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('projects.projectNamePlaceholder')} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="project-description">{t('projects.projectIdeaLabel')}</Label>
                        <Textarea id="project-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('projects.projectIdeaPlaceholder')} />
                    </div>
                </div>
                <div className="py-4 max-h-[40vh] overflow-y-auto">
                   <UploadManager />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">{t('projects.cancelButton')}</Button>
                    </DialogClose>
                    <Button onClick={handleStartBuilding} disabled={!name || !description}>
                        {t('projects.startBuildingButton')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function MyProjectsPage() {
    const { t } = useLocalization();
    const { isLoading: authLoading } = useAuth();
    
    const { projects, isLoading, isError, error, refetch, isRefetching } = useProjects();


    return (
        <div className="container mx-auto max-w-7xl px-4 py-12">
            <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
                <div className="text-center sm:text-left">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center gap-4 animate-fade-in-up"  style={{ animationDelay: '0.1s' }}>
                        <FolderOpen className="w-10 h-10" />
                        {t('projects.pageTitle')}
                    </h1>
                    <p className="text-lg text-muted-foreground mt-2 animate-fade-in-up"  style={{ animationDelay: '0.2s' }}>
                        {t('projects.pageSubtitle')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => refetch()} disabled={isRefetching} className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <RefreshCw className={cn("mr-2 h-4 w-4", isRefetching && "animate-spin")} />
                        {t('projects.refreshButton')}
                    </Button>
                    <CreateProjectDialog />
                </div>
            </div>
            
            {isLoading || authLoading ? (
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
