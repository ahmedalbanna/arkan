
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
import { useProjectsPage } from "@/hooks/core/useProjectsPage";
import { Input } from "../ui/input";
import { useState, useMemo } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { formatDistanceToNow } from "date-fns";
import { useBuilderStore } from "@/hooks";
import { useRouter } from "next/navigation";
import { Skeleton } from "../ui/skeleton";

function ProjectListSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-lg" />
            ))}
        </div>
    )
}

export function BrowseProjectsDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { projects, isLoading, isError, error } = useProjectsPage();
    const { loadProject } = useBuilderStore();
    const router = useRouter();

    const filteredProjects = useMemo(() => {
        if (!projects) return [];
        if (!searchQuery) return projects;
        return projects.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.projectDescription?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [projects, searchQuery]);

    const handleLoadProject = (project: any) => {
        loadProject(project.toStateObject());
        setIsOpen(false);
        router.push('/builder');
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 md:w-auto md:px-3">
                    <Search className="h-4 w-4" />
                    <span className="hidden md:inline ms-2">Browse</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Browse Projects</DialogTitle>
                    <DialogDescription>
                        Search for and load one of your existing projects.
                    </DialogDescription>
                </DialogHeader>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex-grow overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="pr-4">
                            {isLoading ? (
                                <ProjectListSkeleton />
                            ) : isError ? (
                                <div className="text-center py-10 px-4 border rounded-lg bg-card text-destructive">
                                    <AlertCircle className="mx-auto h-12 w-12" />
                                    <h3 className="mt-4 text-lg font-semibold">Failed to load projects</h3>
                                    <p className="mt-2 text-sm">{error?.message}</p>
                                </div>
                            ) : filteredProjects.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {filteredProjects.map(project => (
                                        <Card key={project.id} className="flex flex-col">
                                            <CardHeader>
                                                <CardTitle className="truncate">{project.name || "Untitled Project"}</CardTitle>
                                                <CardDescription>
                                                    Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex-grow">
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {project.projectDescription || "No description."}
                                                </p>
                                            </CardContent>
                                            <CardFooter>
                                                <Button className="w-full" onClick={() => handleLoadProject(project)}>
                                                    <FileText className="me-2 h-4 w-4" />
                                                    Load Project
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg bg-card">
                                    <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">No Projects Found</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Your search for "{searchQuery}" did not match any projects.
                                    </p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
}
