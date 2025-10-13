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
import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjectCardLogic } from '@/hooks/use-project-card-logic';
import type { Project } from '@/lib/models/project';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Clock, FileText, Loader2, Sparkles, Trash2 } from 'lucide-react';

interface ProjectCardProps {
    project: Project; // Use the Project class instance
    viewMode: 'grid' | 'list';
}

export function ProjectCard({ project, viewMode }: ProjectCardProps) {
    const {
        handleLoadProject,
        handleDeleteProject,
        projectTitle,
        isDeletingThisProject,
        t
    } = useProjectCardLogic(project);

    return (
        viewMode === 'grid' ? (
            <AnimatedContainer animation="fade-in-up" delay={200}>
                <Card
                    variant="glass"
                    className={cn(
                        "flex flex-col group transition-all duration-300 ease-in-out relative overflow-hidden",
                        "hover:shadow-glow hover:-translate-y-2"
                    )}
                >
                    {/* Background Effects */}
                    <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-primary/5 opacity-50 pointer-events-none"></div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-float pointer-events-none"></div>

                    <CardHeader className="relative z-10 pb-4">
                        <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1 rounded-md bg-gradient-to-br from-primary to-primary-600">
                                        <FileText className="h-4 w-4 text-white" />
                                    </div>
                                    <CardTitle className="font-headline text-lg truncate group-hover:text-primary transition-colors" title={projectTitle as string}>
                                        {projectTitle as string}
                                    </CardTitle>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {t('projects.updated', { time: formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true }) })}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        AI-Powered
                                    </Badge>
                                </div>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 shrink-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                                        disabled={isDeletingThisProject}
                                    >
                                        {isDeletingThisProject ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="backdrop-blur-md">
                                    <AlertDialogHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-gradient-to-br from-destructive to-red-600">
                                                <Trash2 className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <AlertDialogTitle className="font-headline">{t('projects.deleteDialogTitle')}</AlertDialogTitle>
                                                <AlertDialogDescription className="mt-1">
                                                    {t('projects.deleteDialogDescription').replace('{projectTitle}', projectTitle as string)}
                                                </AlertDialogDescription>
                                            </div>
                                        </div>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t('projects.cancelButton')}</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteProject}
                                            className="bg-destructive hover:bg-destructive/90"
                                        >
                                            {t('projects.deleteButton')}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-grow relative z-10">
                        <div className="p-3 rounded-lg bg-gradient-to-r from-background/50 to-primary/5 border border-border/50">
                            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                {project.proposal?.executiveSummary as string || project.projectIdea || t('projects.noDescription')}
                            </p>
                        </div>
                    </CardContent>

                    <CardFooter className="relative z-10 pt-4">
                        <Button
                            className="w-full hover:shadow-glow transition-all duration-200 group-hover:scale-105"
                            onClick={handleLoadProject}
                            variant="gradient"
                        >
                            <FileText className="me-2 h-4 w-4" />
                            {t('projects.loadProjectButton')}
                        </Button>
                    </CardFooter>
                </Card>
            </AnimatedContainer>
        ) : (
            <AnimatedContainer animation="fade-in-up" delay={200}>
                <div className="flex flex-col group transition-all duration-300 ease-in-out p-4 rounded-lg bg-gradient-to-r from-background/50 to-primary/5 border border-border/50 hover:shadow-soft hover:bg-primary/5">
                    <div className="flex justify-between items-start gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="p-1 rounded-md bg-gradient-to-br from-primary to-primary-600">
                                <FileText className="h-4 w-4 text-white" />
                            </div>
                            <CardTitle className="font-headline text-lg truncate group-hover:text-primary transition-colors" title={projectTitle as string}>
                                {projectTitle as string}
                            </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {t('projects.updated', { time: formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true }) })}
                            </Badge>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
                                        disabled={isDeletingThisProject}
                                    >
                                        {isDeletingThisProject ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="backdrop-blur-md">
                                    <AlertDialogHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-gradient-to-br from-destructive to-red-600">
                                                <Trash2 className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <AlertDialogTitle className="font-headline">{t('projects.deleteDialogTitle')}</AlertDialogTitle>
                                                <AlertDialogDescription className="mt-1">
                                                    {t('projects.deleteDialogDescription').replace('{projectTitle}', projectTitle as string)}
                                                </AlertDialogDescription>
                                            </div>
                                        </div>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t('projects.cancelButton')}</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteProject}
                                            className="bg-destructive hover:bg-destructive/90"
                                        >
                                            {t('projects.deleteButton')}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>

                    <div className="mb-4">
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {project.proposal?.executiveSummary as string || project.projectIdea || t('projects.noDescription')}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            className="flex-1 hover:shadow-glow transition-all duration-200"
                            onClick={handleLoadProject}
                            variant="gradient"
                        >
                            <FileText className="me-2 h-4 w-4" />
                            {t('projects.loadProjectButton')}
                        </Button>
                    </div>
                </div>
            </AnimatedContainer>
        )
    );
}
