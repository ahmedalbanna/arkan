
'use client';

import { CreateProjectDialog } from '@/components/project/CreateProjectDialog';
import { ProjectCard } from '@/components/project/ProjectCard';
import { UploadProjectButton } from '@/components/project/UploadProjectButton';
import { AnimatedContainer, StaggeredAnimation } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalization } from '@/context/LocalizationContext';
import { useProjects } from '@/hooks';
import { cn } from '@/lib/utils';
import { AlertCircle, Filter, FolderOpen, Grid, List, RefreshCw, Search, SortAsc, SortDesc } from 'lucide-react';
import { useMemo, useState } from 'react';

function ProjectsPageSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-lg animate-pulse" />
            ))}
        </div>
    );
}

type SortOption = 'name' | 'createdAt' | 'updatedAt';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

export default function MyProjectsPage() {
    const { t } = useLocalization();
    const { projects, isLoading, isError, error, refetch, isRefetching } = useProjects();

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('updatedAt');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [selectedType, setSelectedType] = useState<string>('all');

    // Filter and sort projects
    const filteredAndSortedProjects = useMemo(() => {
        if (!projects) return [];

        let filtered = projects.filter(project => {
            const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = selectedType === 'all' || project.type === selectedType;
            return matchesSearch && matchesType;
        });

        filtered.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'name':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'createdAt':
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    break;
                case 'updatedAt':
                    comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [projects, searchQuery, sortBy, sortOrder, selectedType]);

    const projectTypes = useMemo(() => {
        if (!projects) return [];
        const types = [...new Set(projects.map(p => p.type))];
        return types;
    }, [projects]);

    const handleSortToggle = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    return (
        <div className="container mx-auto max-w-7xl px-4 py-12">
            {/* Header */}
            <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
                <div className="text-center sm:text-left">
                    <AnimatedContainer animation="fade-in-up" delay={100}>
                        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center gap-4">
                            <FolderOpen className="w-10 h-10" />
                            {t('projects.pageTitle')}
                        </h1>
                    </AnimatedContainer>
                    <AnimatedContainer animation="fade-in-up" delay={200}>
                        <p className="text-lg text-muted-foreground mt-2">
                            {t('projects.pageSubtitle')}
                        </p>
                    </AnimatedContainer>
                </div>
                <AnimatedContainer animation="fade-in-up" delay={300}>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
                            <RefreshCw className={cn("me-2 h-4 w-4", isRefetching && "animate-spin")} />
                            {t('projects.refreshButton')}
                        </Button>
                        <UploadProjectButton />
                        <CreateProjectDialog />
                    </div>
                </AnimatedContainer>
            </div>

            {/* Filters and Controls */}
            {projects && projects.length > 0 && (
                <AnimatedContainer animation="fade-in-up" delay={400}>
                    <div className="mb-8 space-y-4">
                        {/* Search and Filters Row */}
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full sm:w-auto">
                                {/* Search */}
                                <div className="relative flex-1 sm:flex-none sm:w-80">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <Input
                                        placeholder="Search projects..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                {/* Type Filter */}
                                <Select value={selectedType} onValueChange={setSelectedType}>
                                    <SelectTrigger className="w-full sm:w-48">
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Filter by type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {projectTypes.map(type => (
                                            <SelectItem key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Sort */}
                                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                                    <SelectTrigger className="w-full sm:w-48">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name">Name</SelectItem>
                                        <SelectItem value="createdAt">Created Date</SelectItem>
                                        <SelectItem value="updatedAt">Last Modified</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Sort Order Toggle */}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleSortToggle}
                                    className="shrink-0"
                                >
                                    {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                                </Button>
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    size="icon"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'outline'}
                                    size="icon"
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Results Summary */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                                Showing {filteredAndSortedProjects.length} of {projects.length} projects
                            </span>
                            {searchQuery && (
                                <Badge variant="secondary">
                                    Search: "{searchQuery}"
                                </Badge>
                            )}
                            {selectedType !== 'all' && (
                                <Badge variant="outline">
                                    Type: {selectedType}
                                </Badge>
                            )}
                        </div>
                    </div>
                </AnimatedContainer>
            )}

            {/* Content */}
            {isLoading ? (
                <ProjectsPageSkeleton />
            ) : isError ? (
                <div className="text-center py-10 px-4 border rounded-lg bg-card text-destructive animate-fade-in-up">
                    <AlertCircle className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-semibold">{t('projects.errorLoading')}</h3>
                    <p className="mt-2 text-sm">{error.message}</p>
                </div>
            ) : projects && projects.length > 0 ? (
                <StaggeredAnimation
                    staggerDelay={50}
                    animation="fade-in-up"
                    className={cn(
                        "gap-6",
                        viewMode === 'grid'
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            : "space-y-4"
                    )}
                >
                    {filteredAndSortedProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            viewMode={viewMode}
                        />
                    ))}
                </StaggeredAnimation>
            ) : (
                <AnimatedContainer animation="fade-in-up" delay={500}>
                    <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg bg-card">
                        <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">{t('projects.noProjectsTitle')}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {t('projects.noProjectsDescription')}
                        </p>
                    </div>
                </AnimatedContainer>
            )}
        </div>
    );
}
