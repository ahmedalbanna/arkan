import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@/infrastructure/di/container';
import { ProjectApiClient } from '../api-client/ProjectApiClient';
import { Project } from '../../domain/entities/Project';
import { toast } from '@/hooks/util/use-toast';
import { type ProjectProperties } from '../../domain/entities/Project';

export function useSnapshots(projectId: string | undefined) {
    const queryClient = useQueryClient();
    const apiClient = container.resolve(ProjectApiClient);

    const snapshotsQuery = useQuery({
        queryKey: ['projects', projectId, 'snapshots'],
        queryFn: async () => {
            if (!projectId) return [];
            const result = await apiClient.fetchSnapshots(projectId);
            if (result.isFailure) throw result.error;
            return result.getValue();
        },
        enabled: !!projectId,
    });

    const createSnapshotMutation = useMutation({
        mutationFn: async ({ name, snapshotData }: { name: string; snapshotData: ProjectProperties }) => {
            if (!projectId) throw new Error('Project ID is required');
            const result = await apiClient.createSnapshot(projectId, name, snapshotData);
            if (result.isFailure) throw result.error;
            return result.getValue();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'snapshots'] });
            toast({ title: 'Snapshot Created', description: 'Your project state has been saved.' });
        },
        onError: (error: any) => {
            toast({ title: 'Snapshot Failed', description: error.message, variant: 'destructive' });
        }
    });

    const deleteSnapshotMutation = useMutation({
        mutationFn: async (snapshotId: string) => {
            const result = await apiClient.deleteSnapshot(snapshotId);
            if (result.isFailure) throw result.error;
            return result.getValue();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'snapshots'] });
            toast({ title: 'Snapshot Deleted', description: 'The snapshot has been removed.' });
        },
        onError: (error: any) => {
            toast({ title: 'Delete Failed', description: error.message, variant: 'destructive' });
        }
    });

    return {
        snapshots: snapshotsQuery.data || [],
        isLoading: snapshotsQuery.isLoading,
        createSnapshot: createSnapshotMutation.mutate,
        isCreating: createSnapshotMutation.isPending,
        deleteSnapshot: deleteSnapshotMutation.mutate,
        isDeleting: deleteSnapshotMutation.isPending,
    };
}
