import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/util/use-toast', () => ({
  toast: jest.fn(),
}));

jest.mock('@/infrastructure/api/authenticated-client-call', () => ({
  runAuthenticatedResultCall: jest.fn(),
  unwrapResult: jest.fn(),
}));

jest.mock('../use-sections', () => ({
  useSections: jest.fn(() => ({ data: [] })),
}));

jest.mock('../../core/useBuilderStore', () => ({
  useBuilderStore: jest.fn(() => ({
    project: null,
    updateProject: jest.fn(),
  })),
}));

jest.mock('@/lib/project/template', () => ({
  applyReportTemplate: jest.fn(),
}));

const { useAuth } = jest.requireMock('@/context/AuthContext') as {
  useAuth: jest.Mock;
};

const { runAuthenticatedResultCall } = jest.requireMock('@/infrastructure/api/authenticated-client-call') as {
  runAuthenticatedResultCall: jest.Mock;
};

const { templateKeys } = require('@/lib/query-keys') as {
  templateKeys: {
    report: () => readonly unknown[];
    presentation: () => readonly unknown[];
    pptx: () => readonly unknown[];
  };
};

const { useSaveTemplate, useDeleteTemplate } = require('../use-templates');
const useUpdateReportTemplate = () => useSaveTemplate('report');
const useDeletePresentationTemplate = () => useDeleteTemplate('pptx');

describe('use-templates mutations', () => {
  const firebaseUser = { uid: 'admin-1' } as { uid: string };

  const createWrapper = (queryClient: QueryClient) => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    Wrapper.displayName = 'TemplateQueryClientWrapper';
    return Wrapper;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ firebaseUser });
  });

  it('invalidates report template queries after updating a report template', async () => {
    runAuthenticatedResultCall.mockResolvedValue({ id: 'report-1' });

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateReportTemplate(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: 'report-1',
        data: {
          name: 'Updated Report Template',
          description: 'Updated description',
          content: [],
        },
      });
    });

    expect(runAuthenticatedResultCall).toHaveBeenCalled();
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: templateKeys.report() });
  });

  it('invalidates presentation and pptx template queries after deleting a presentation template', async () => {
    runAuthenticatedResultCall.mockResolvedValue({});

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeletePresentationTemplate(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync('presentation-1');
    });

    expect(runAuthenticatedResultCall).toHaveBeenCalled();
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: templateKeys.presentation() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: templateKeys.pptx() });
  });
});
