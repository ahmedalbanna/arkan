'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchProjects } from '@/services/project-service';
import { projectKeys } from '@/lib/query-keys';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, FolderOpen, PlusCircle } from 'lucide-react';
import { ProjectCard } from '@/components/project/ProjectCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useRouter } from 'next/navigation';

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
    const { firebaseUser, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const newSession = useBuilderStore(state => state.newSession);
    
    const { data: projects, isLoading, isError, error } = useQuery({
        queryKey: projectKeys.lists(),
        queryFn: async () => {
            if (!firebaseUser) throw new Error("User not authenticated");
            const token = await firebaseUser.getIdToken();
            return fetchProjects(token);
        },
        enabled: !authLoading && !!firebaseUser,
    });

    const handleCreateNewProject = () => {
        newSession();
        router.push('/generate');
    }

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
                <Button onClick={handleCreateNewProject} className="animate-fade-in-up"  style={{ animationDelay: '0.3s' }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Project
                </Button>
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
                        You haven't saved any projects yet. Go to the builder to get started.
                    </p>
                </div>
            )}
        </div>
    );
}
