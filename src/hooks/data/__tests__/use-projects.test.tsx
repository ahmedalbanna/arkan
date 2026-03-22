import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/data/authenticated-client-call', () => ({
  runAuthenticatedResultCall: jest.fn(),
}));

jest.mock('@/infrastructure/di/container', () => ({
  container: {
    resolve: jest.fn(),
  },
}));

jest.mock('@/hooks/util/use-toast', () => ({
  toast: jest.fn(),
}));

jest.mock('@/modules/projects/domain/entities/Project', () => {
  class MockProject {
    id?: string;
    name?: string;
    content?: unknown[];

    constructor(props: { id?: string; name?: string; content?: unknown[] }) {
      this.id = props.id;
      this.name = props.name;
      this.content = props.content ?? [];
    }

    toStateObject() {
      return {
        id: this.id,
        name: this.name,
        content: this.content ?? [],
      };
    }
  }

  return {
    Project: MockProject,
    ProjectProperties: {},
  };
});

const { useAuth } = jest.requireMock('@/context/AuthContext') as {
  useAuth: jest.Mock;
};

const { runAuthenticatedResultCall } = jest.requireMock('@/hooks/data/authenticated-client-call') as {
  runAuthenticatedResultCall: jest.Mock;
};

const { container } = jest.requireMock('@/infrastructure/di/container') as {
  container: { resolve: jest.Mock };
};

const { Project } = require('@/modules/projects/domain/entities/Project') as {
  Project: new (...args: unknown[]) => { id?: string; name?: string; toStateObject: () => unknown };
};

const { LocalProjectService } = require('@/modules/projects/adapters/local-storage/LocalProjectService') as {
  LocalProjectService: unknown;
};

const { projectKeys } = require('@/lib/query-keys') as {
  projectKeys: {
    detail: (userId: string, projectId: string) => readonly unknown[];
    lists: (userId: string) => readonly unknown[];
  };
};

const { useDeleteProject, useProjects } = require('../use-projects') as {
  useProjects: typeof import('../use-projects').useProjects;
  useDeleteProject: typeof import('../use-projects').useDeleteProject;
};

describe('use-projects hooks', () => {
  const firebaseUser = { uid: 'project-user-1' } as { uid: string };
  const localService = {
    saveProject: jest.fn(),
    getAllProjects: jest.fn(),
    deleteProject: jest.fn(),
  };

  const createWrapper = (queryClient: QueryClient) => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    Wrapper.displayName = 'ProjectQueryClientWrapper';
    return Wrapper;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ firebaseUser });
    container.resolve.mockImplementation((token: unknown) => {
      if (token === LocalProjectService) {
        return localService;
      }
      return localService;
    });
    localService.getAllProjects.mockResolvedValue([]);
    localService.deleteProject.mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true,
    });
  });

  it('hydrates projects from the authenticated server result and normalizes them into Project entities', async () => {
    runAuthenticatedResultCall.mockResolvedValue([
      {
        id: 'project-1',
        name: 'Capstone',
        content: [],
      },
    ]);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.projects?.[0]).toBeInstanceOf(Project));

    expect(localService.saveProject).toHaveBeenCalledTimes(1);
    expect(result.current.projectScope).toBe('project-user-1');
  });

  it('removes the scoped project detail cache entry after deleting a project', async () => {
    runAuthenticatedResultCall.mockResolvedValue({ message: 'deleted' });

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const removeQueriesSpy = jest.spyOn(queryClient, 'removeQueries');
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');
    queryClient.setQueryData(projectKeys.detail('project-user-1', 'project-1'), { id: 'project-1' });

    const { result } = renderHook(() => useDeleteProject(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync('project-1');
    });

    expect(localService.deleteProject).toHaveBeenCalledWith('project-1');
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: projectKeys.lists('project-user-1') });
    expect(removeQueriesSpy).toHaveBeenCalledWith({ queryKey: projectKeys.detail('project-user-1', 'project-1') });
  });
});
