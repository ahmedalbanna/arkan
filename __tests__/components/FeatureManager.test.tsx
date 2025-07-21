
import { render, screen, waitFor } from '@testing-library/react';
import FeatureManager from '@/components/admin/FeatureManager';
import { useFeatures } from '@/hooks/use-features';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type Feature } from '@/hooks/use-features';

// Mock the useFeatures hook
jest.mock('@/hooks/use-features');
const mockedUseFeatures = useFeatures as jest.Mock;

const queryClient = new QueryClient();

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const mockFeatures: Feature[] = [
  { id: 'proposal', name: 'Proposal Mode', description: 'Allows users to generate proposals.', isEnabled: true },
  { id: 'report', name: 'Report Generator', description: 'Allows users to generate reports.', isEnabled: false },
];

describe('FeatureManager', () => {
  it('renders loading skeletons when features are being fetched', () => {
    mockedUseFeatures.mockReturnValue({ features: [], isLoaded: false, isError: false });
    render(<Wrapper><FeatureManager /></Wrapper>);
    
    const skeletons = screen.getAllByRole('listitem');
    expect(skeletons.length).toBeGreaterThan(0);
     skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('animate-pulse');
    });
  });

  it('renders an error message when fetching fails', () => {
    mockedUseFeatures.mockReturnValue({ features: [], isLoaded: true, isError: true });
    render(<Wrapper><FeatureManager /></Wrapper>);
    
    expect(screen.getByText(/Failed to load features/i)).toBeInTheDocument();
  });

  it('renders a list of feature cards when data is fetched successfully', async () => {
    mockedUseFeatures.mockReturnValue({ features: mockFeatures, isLoaded: true, isError: false });
    render(<Wrapper><FeatureManager /></Wrapper>);

    await waitFor(() => {
        expect(screen.getByText('Proposal Mode')).toBeInTheDocument();
        expect(screen.getByText('Allows users to generate proposals.')).toBeInTheDocument();
        expect(screen.getByText('Report Generator')).toBeInTheDocument();
        expect(screen.getByText('Allows users to generate reports.')).toBeInTheDocument();
    });
    
    const proposalSwitch = screen.getByRole('switch', { name: /Enable Proposal Mode/i });
    const reportSwitch = screen.getByRole('switch', { name: /Enable Report Generator/i });

    expect(proposalSwitch).toBeChecked();
    expect(reportSwitch).not.toBeChecked();
  });
});
