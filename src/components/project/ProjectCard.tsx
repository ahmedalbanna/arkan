

'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { SavedProject } from '@/lib/types';
import { Button } from '../ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { FileText, Trash2, Loader2 } from 'lucide-react';
import { useDeleteProject } from '@/hooks/use-projects';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import React from 'react'; // Import React for React.ReactNode type
import { useLocalization } from '@/context/LocalizationContext';

interface ProjectCardProps {
    project: SavedProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const router = useRouter();
    const { t } = useLocalization();
    const loadState = useBuilderStore(state => state.loadState);
    const deleteProjectMutation = useDeleteProject();

    const handleLoadProject = () => {
        // The project object already contains the full state
        loadState(project);
        router.push('/generate');
    };

    const handleDeleteProject = () => {
        deleteProjectMutation.mutate(project.id);
    }
    
    const projectTitle = project.name || project.proposal?.title || t('projects.untitled');

    const isDeletingThisProject = deleteProjectMutation.isPending && deleteProjectMutation.variables === project.id;

    return (
        <Card className={cn(
            "flex flex-col group transition-all duration-300 ease-in-out",
            "hover:shadow-lg hover:-translate-y-1"
        )}>
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="font-headline text-lg truncate" title={projectTitle as string}>
                        {projectTitle as React.ReactNode}
                    </CardTitle>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" disabled={isDeletingThisProject}>
                               {isDeletingThisProject ? <Loader2 className="h-4 w-4 animate-spin" /> :  <Trash2 className="h-4 w-4 text-destructive" />}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{t('projects.deleteDialogTitle')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t('projects.deleteDialogDescription').replace('{projectTitle}', projectTitle as string)}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{t('projects.cancelButton')}</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteProject}>{t('projects.deleteButton')}</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                <CardDescription>
                    {t('projects.updated', { time: formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true }) })}
                </CardDescription>
            </CardHeader>
            <CardContent className="grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {(project.proposal?.objective || t('projects.noDescription')) as React.ReactNode}
                </p>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleLoadProject}>
                    <FileText className="me-2 h-4 w-4" />
                    {t('projects.loadProjectButton')}
                </Button>
            </CardFooter>
        </Card>
    );
}
