
import { renderHook, waitFor } from '@testing-library/react';
import { useFeatures } from '@/hooks/use-features';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type Feature } from '@/hooks/use-features';
import { useAuth } from '@/context/AuthContext';


jest.mock('@/context/AuthContext');
const mockedUseAuth = useAuth as jest.Mock;

const mockFeatures: Feature[] = [
  { id: 'proposal', name: 'Proposal Mode', description: 'Generate proposals', isEnabled: true },
  { id: 'report', name: 'Report Generator', description: 'Generate reports', isEnabled: false },
];


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Turn off retries for tests
    },
  },
});


const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('useFeatures', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
        mockedUseAuth.mockReturnValue({
            firebaseUser: {
                getIdToken: async () => 'test-token',
            },
        });
    });

  it('should return a list of features on successful fetch', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(mockFeatures));
    
    const { result } = renderHook(() => useFeatures(), { wrapper });

    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    
    expect(result.current.features).toEqual(mockFeatures);
    expect(result.current.isError).toBe(false);
  });

  it('should return an error state when fetch fails', async () => {
    fetchMock.mockRejectOnce(new Error('API Error'));
    
    const { result } = renderHook(() => useFeatures(), { wrapper });

    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    
    expect(result.current.features).toEqual([]);
    expect(result.current.isError).toBe(true);
  });
});
