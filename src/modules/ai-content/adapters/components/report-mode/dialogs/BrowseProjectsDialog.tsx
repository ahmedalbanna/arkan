
'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, Loader2, AlertCircle, FileText, FolderOpen } from "lucide-react";
import { useProjectsPage } from "@/modules/projects/adapters/hooks/useProjectsPage";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { useBuilderStore } from "@/modules/projects/adapters/state/useBuilderStore";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Project } from '@/modules/projects/domain/entities/Project';

function ProjectListSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-lg" />
            ))}
        </div>
    )
}

interface ProjectCardProps {
    project: Project;
    onLoad: (project: Project) => void;
    isLoading: boolean;
}

import { Badge } from "@/components/ui/badge";
import { Clock, GraduationCap, Globe } from "lucide-react";
import { cn } from "@/infrastructure/utils/cn";

function ProjectCard({ project, onLoad, isLoading }: ProjectCardProps) {
    return (
        <Card className="group flex flex-col hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md bg-card overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                        <CardTitle className="text-base font-bold tracking-tight truncate group-hover:text-primary transition-colors">
                            {project.name || "Untitled Project"}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            <Clock className="h-3 w-3 text-primary/60" />
                            {project.meta.updated ? formatDistanceToNow(new Date(project.meta.updated), { addSuffix: true }) : 'N/A'}
                        </div>
                    </div>
                    {project.educationalLevel && (
                        <Badge variant="secondary" className="h-5 text-[9px] px-1.5 font-bold bg-primary/5 text-primary border-none">
                            {project.educationalLevel}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed italic">
                    {project.projectDescription || "No project description provided."}
                </p>
                
                <div className="flex flex-wrap gap-2">
                    {project.projectType && (
                        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-tighter text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
                            <FileText className="h-2.5 w-2.5" />
                            {project.projectType}
                        </div>
                    )}
                    {project.specialization && (
                        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-tighter text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
                            <GraduationCap className="h-2.5 w-2.5" />
                            {project.specialization}
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="pt-2">
                <Button 
                    className="w-full font-bold h-9 gap-2 shadow-lg shadow-primary/10 transition-all active:scale-[0.98]" 
                    onClick={() => onLoad(project)} 
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FolderOpen className="h-3.5 w-3.5" />}
                    {isLoading ? "Synchronizing..." : "Restore Project"}
                </Button>
            </CardFooter>
        </Card>
    );
}

export function BrowseProjectsDialog({ disabled }: { disabled?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null);
    const { projects, isLoading, isError, error } = useProjectsPage();
    const { loadProject } = useBuilderStore();
    const router = useRouter();

    const filteredProjects = useMemo(() => {
        if (!projects) return [];
        if (!searchQuery) return projects;
        return projects.filter((p: Project) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.projectDescription?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [projects, searchQuery]);

    async function handleLoadProject(project: Project) {
        setLoadingProjectId(project.id);
        await new Promise(resolve => setTimeout(resolve, 500));
        loadProject(project.toStateObject());
        setIsOpen(false);
        setLoadingProjectId(null);
        router.push('/builder');
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all duration-300"
                    disabled={disabled}
                >
                    <Globe className="h-3.5 w-3.5" />
                    <span className="hidden xl:inline">Library</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl h-[90vh] p-0 overflow-hidden flex flex-col gap-0 border-none shadow-2xl">
                <header className="px-8 py-6 border-b bg-muted/10">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" />
                            <DialogTitle className="text-xl font-bold font-headline tracking-tight">Project Library Manifest</DialogTitle>
                        </div>
                        <DialogDescription className="text-xs text-muted-foreground italic max-w-2xl leading-relaxed">
                            Search your secure repository for existing intelligence projects. Restore your session to continue document production.
                        </DialogDescription>
                    </div>
                </header>

                <div className="px-8 py-4 border-b bg-background flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Filter project library by name or context..."
                            value={searchQuery}
                            onChange={(e: any) => setSearchQuery(e.target.value)}
                            className="pl-9 h-10 text-xs bg-muted/5 focus-visible:ring-1 border-none shadow-inner"
                        />
                    </div>
                    <Badge variant="outline" className="h-6 text-[10px] px-2 font-bold uppercase tracking-widest text-muted-foreground border-border/60">
                        {filteredProjects.length} Projects Total
                    </Badge>
                </div>

                <div className="flex-1 overflow-hidden relative min-h-0 bg-[#f8fafc] dark:bg-black/20">
                    <ScrollArea className="h-full">
                        <div className="p-8 pb-20">
                            {isLoading ? (
                                <ProjectListSkeleton />
                            ) : isError ? (
                                <div className="text-center py-12 px-6 border-2 border-dashed rounded-xl bg-destructive/5 text-destructive border-destructive/20">
                                    <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider">Sync Error</h3>
                                    <p className="mt-1 text-[11px] leading-relaxed italic">{error?.message}</p>
                                </div>
                            ) : filteredProjects.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredProjects.map((project: Project) => (
                                        <ProjectCard
                                            key={project.id}
                                            project={project}
                                            onLoad={handleLoadProject}
                                            isLoading={loadingProjectId === project.id}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 px-8 border-2 border-dashed rounded-2xl bg-muted/10 max-w-md mx-auto">
                                    <div className="relative mx-auto h-16 w-16 mb-6">
                                        <FolderOpen className="h-16 w-16 text-muted-foreground/20" />
                                        <Search className="absolute -bottom-1 -right-1 h-6 w-6 text-primary/40 bg-background rounded-full p-1.5 border shadow-sm" />
                                    </div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Manifest Empty</h3>
                                    <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed italic">
                                        {searchQuery ? `No records match the filter criteria "${searchQuery}".` : `No projects found in your local or remote repository.`}
                                    </p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#f8fafc] dark:from-black/40 to-transparent pointer-events-none" />
                </div>

                <footer className="px-8 py-4 border-t bg-muted/5 flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                        Intelligence Repository • V1.0 Stable
                    </p>
                    <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-[10px] font-bold uppercase tracking-wider h-8">
                        Return to Workspace
                    </Button>
                </footer>
            </DialogContent>
        </Dialog>
    )
}
