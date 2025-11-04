
'use client';

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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Project } from '@/lib/models';
import { cn } from '@/lib/utils/cn';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Loader2, Trash2 } from 'lucide-react';
import { useLocalization } from "@/context/LocalizationContext";


interface ProjectCardProps {
    project: Project;
    onLoad: () => void;
    onDelete: () => void;
    isDeleting: boolean;
}

export function ProjectCard({ project, onLoad, onDelete, isDeleting }: ProjectCardProps) {
    const { t } = useLocalization();
    const projectTitle = project.name || t('projects.untitled');

    return (
        <Card className={cn(
            "flex flex-col group transition-all duration-300 ease-in-out",
            "hover:shadow-lg hover:-translate-y-1"
        )}>
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="font-headline text-lg truncate" title={projectTitle as string}>
                        {projectTitle}
                    </CardTitle>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
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
                                <AlertDialogAction onClick={onDelete}>{t('projects.deleteButton')}</AlertDialogAction>
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
                    {project.projectIdea || t('projects.noDescription')}
                </p>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={onLoad}>
                    <FileText className="me-2 h-4 w-4" />
                    {t('projects.loadProjectButton')}
                </Button>
            </CardFooter>
        </Card>
    );
}
