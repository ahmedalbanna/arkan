import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useProjectPlanGenerator } from '../use-project-plan-generator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useGenerateProjectPlan } from '@/hooks/use-project-plan';
import { summarizeProposalForPlanApi } from '@/services/project-plan-service';

// Mock dependencies
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));
jest.mock('@/context/AuthContext');
jest.mock('@/hooks/useBuilderStore');
jest.mock('@/hooks/use-project-plan');
jest.mock('@/services/project-plan-service');
jest.mock('@/lib/authUtils', () => ({
  getAuthenticatedToken: jest.fn().mockResolvedValue('mock-token'),
}));

const mockUseAuth = useAuth as jest.Mock;
const mockUseBuilderStore = useBuilderStore as unknown as jest.Mock;
const mockUseGenerateProjectPlan = useGenerateProjectPlan as jest.Mock;
const mockSummarizeProposalForPlanApi = summarizeProposalForPlanApi as jest.Mock;
const mockToast = jest.fn();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useProjectPlanGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    mockUseAuth.mockReturnValue({
      firebaseUser: { uid: 'test-user' },
      userProfile: { credits: 10 },
    });
    mockUseGenerateProjectPlan.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
    mockUseBuilderStore.mockReturnValue({ proposal: null, projectIdea: '' });
  });

  it('should initialize with data from proposal', () => {
    const mockProposal = {
      objective: 'Test Objective',
      expected_outcome: ['Deliverable 1', 'Deliverable 2'],
    };
    mockUseBuilderStore.mockReturnValue({ proposal: mockProposal, projectIdea: '' });

    const { result } = renderHook(() => useProjectPlanGenerator(), { wrapper: createWrapper() });

    expect(result.current.description).toBe('Test Objective');
    expect(result.current.deliverables).toBe('Deliverable 1\nDeliverable 2');
  });

  it('should initialize with data from projectIdea if proposal is absent', () => {
    mockUseBuilderStore.mockReturnValue({ proposal: null, projectIdea: 'Test Project Idea' });

    const { result } = renderHook(() => useProjectPlanGenerator(), { wrapper: createWrapper() });

    expect(result.current.description).toBe('Test Project Idea');
    expect(result.current.deliverables).toBe('');
  });

  it('handleGetSuggestion should update fields on success', async () => {
    mockUseBuilderStore.mockReturnValue({ proposal: { objective: 'old' }, projectIdea: '' });
    mockSummarizeProposalForPlanApi.mockResolvedValue({
      summary: 'Project Summary: New Description. Key Deliverables: New Deliverables.',
    });

    const { result } = renderHook(() => useProjectPlanGenerator(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.handleGetSuggestion();
    });

    expect(result.current.description).toBe('New Description.');
    expect(result.current.deliverables).toBe('New Deliverables.');
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Suggestion Applied',
      description: 'The AI has filled in the details from your proposal.',
    });
  });

  it('handleGetSuggestion should show error toast on failure', async () => {
    mockUseBuilderStore.mockReturnValue({ proposal: { objective: 'old' }, projectIdea: '' });
    const errorMessage = 'AI failed';
    mockSummarizeProposalForPlanApi.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useProjectPlanGenerator(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.handleGetSuggestion();
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Suggestion Failed',
      description: errorMessage,
      variant: 'destructive',
    });
  });

  it('handleGeneratePlan should call mutation when inputs are valid', async () => {
    const mutate = jest.fn();
    mockUseGenerateProjectPlan.mockReturnValue({ mutate, isPending: false });

    const { result } = renderHook(() => useProjectPlanGenerator(), { wrapper: createWrapper() });

    act(() => {
      result.current.setDescription('A valid description');
      result.current.setDeliverables('A valid deliverable');
    });

    await act(async () => {
      await result.current.handleGeneratePlan();
    });

    expect(mutate).toHaveBeenCalledWith({
      projectDescription: 'A valid description',
      keyDeliverables: 'A valid deliverable',
    });
  });

  it('handleGeneratePlan should show toast if inputs are missing', async () => {
    const { result } = renderHook(() => useProjectPlanGenerator(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.handleGeneratePlan();
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Cannot Generate Plan',
      description: 'Please provide a project description and at least one deliverable.',
      variant: 'destructive',
    });
  });

  it('handleGeneratePlan should show toast if user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({ firebaseUser: null, userProfile: null });
    const { result } = renderHook(() => useProjectPlanGenerator(), { wrapper: createWrapper() });

    act(() => {
        result.current.setDescription('A valid description');
        result.current.setDeliverables('A valid deliverable');
    });

    await act(async () => {
        await result.current.handleGeneratePlan();
    });

    expect(mockToast).toHaveBeenCalledWith({
        title: "Authentication Required",
        variant: 'destructive',
    });
  });

  describe('canGenerate logic', () => {
    it('should be true when conditions are met', () => {
      const { result } = renderHook(() => useProjectPlanGenerator(), { wrapper: createWrapper() });

      expect(result.current.canGenerate).toBe(false);

      act(() => {
        result.current.setDescription('A valid description');
        result.current.setDeliverables('A valid deliverable');
      });

      expect(result.current.canGenerate).toBe(true);
    });

    it('should be false if user has insufficient credits', () => {
      mockUseAuth.mockReturnValue({
        firebaseUser: { uid: 'test-user' },
        userProfile: { credits: 1 }, // creditCost is 2
      });
      const { result } = renderHook(() => useProjectPlanGenerator(), { wrapper: createWrapper() });

      act(() => {
        result.current.setDescription('A valid description');
        result.current.setDeliverables('A valid deliverable');
      });

      expect(result.current.canGenerate).toBe(false);
    });

    it('should be false if processing', () => {
      mockUseGenerateProjectPlan.mockReturnValue({ mutate: jest.fn(), isPending: true });
      const { result } = renderHook(() => useProjectPlanGenerator(), { wrapper: createWrapper() });

      act(() => {
        result.current.setDescription('A valid description');
        result.current.setDeliverables('A valid deliverable');
      });

      expect(result.current.canGenerate).toBe(false);
    });
  });
});
