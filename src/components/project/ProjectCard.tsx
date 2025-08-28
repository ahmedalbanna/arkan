

'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { SavedProject } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Trash2, Loader2 } from 'lucide-react';
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
import React from 'react';
import { useProjectCardLogic } from '@/hooks/use-project-card-logic';

interface ProjectCardProps {
    project: SavedProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const {
        handleLoadProject,
        handleDeleteProject,
        projectTitle,
        isDeletingThisProject,
        t
    } = useProjectCardLogic(project);

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
            <CardContent className="flex-grow">
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
