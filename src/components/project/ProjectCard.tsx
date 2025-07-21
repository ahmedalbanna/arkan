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

interface ProjectCardProps {
    project: SavedProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const router = useRouter();
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
    
    const projectTitle = project.name || project.proposal?.title || 'Untitled Project';

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="font-headline text-lg truncate" title={projectTitle}>
                        {projectTitle}
                    </CardTitle>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" disabled={deleteProjectMutation.isPending && deleteProjectMutation.variables === project.id}>
                               {deleteProjectMutation.isPending && deleteProjectMutation.variables === project.id ? <Loader2 className="h-4 w-4 animate-spin" /> :  <Trash2 className="h-4 w-4 text-destructive" />}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your project
                                    "{projectTitle}".
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteProject}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                <CardDescription>
                    Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {project.projectIdea || project.proposal?.objective || 'No description available.'}
                </p>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleLoadProject}>
                    <FileText className="mr-2 h-4 w-4" />
                    Load Project
                </Button>
            </CardFooter>
        </Card>
    );
}
