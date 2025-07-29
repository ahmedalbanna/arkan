
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchProjects } from '@/services/project-service';
import { projectKeys } from '@/lib/query-keys';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, FolderOpen, PlusCircle } from 'lucide-react';
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
                    Create New Project
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                        Give your new project a name and a brief description to get started. You can also add context files below.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="project-name">Project Name</Label>
                        <Input id="project-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Q4 Marketing Campaign" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="project-description">Project Description / Idea</Label>
                        <Textarea id="project-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., A mobile app for tracking personal fitness goals..." />
                    </div>
                </div>
                <div className="py-4 max-h-[40vh] overflow-y-auto">
                   <UploadManager />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleStartBuilding} disabled={!name || !description}>
                        Start Building
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function MyProjectsPage() {
    const { firebaseUser, isLoading: authLoading } = useAuth();
    
    const { data: projects, isLoading, isError, error } = useQuery({
        queryKey: projectKeys.lists(),
        queryFn: async () => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            return fetchProjects(token);
        },
        enabled: !authLoading && !!firebaseUser,
    });


    return (
        <div className="container mx-auto max-w-7xl px-4 py-12">
            <div className="flex justify-between items-center mb-12">
                <div className="text-center sm:text-left">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center gap-4 animate-fade-in-up"  style={{ animationDelay: '0.1s' }}>
                        <FolderOpen className="w-10 h-10" />
                        My Projects
                    </h1>
                    <p className="text-lg text-muted-foreground mt-2 animate-fade-in-up"  style={{ animationDelay: '0.2s' }}>
                        Load, manage, and continue working on your saved projects.
                    </p>
                </div>
                <CreateProjectDialog />
            </div>
            
            {isLoading || authLoading ? (
                <ProjectsPageSkeleton />
            ) : isError ? (
                <div className="text-center py-10 px-4 border rounded-lg bg-card text-destructive">
                    <AlertCircle className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-semibold">Failed to load projects</h3>
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
                    <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        You haven't saved any projects yet. Get started by creating a new one.
                    </p>
                </div>
            )}
        </div>
    );
}
