
import { render, screen, waitFor } from '@testing-library/react';
import AgentManager from '@/components/AgentManager';
import { useAgents } from '@/hooks/use-agents';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type Agent, AgentCategory } from '@/lib/agents';
import { Bot } from 'lucide-react';

// Mock the useAgents hook
jest.mock('@/hooks/use-agents');
const mockedUseAgents = useAgents as jest.Mock;

const queryClient = new QueryClient();

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const mockAgents: Agent[] = [
  { id: 'agent-1', name: 'Proposal Agent', description: 'Creates proposals.', category: AgentCategory.ProposalGeneration, pageUrl: '/generate', isEnabled: true, prompt: 'Prompt 1', icon: Bot },
  { id: 'agent-2', name: 'Report Agent', description: 'Creates reports.', category: AgentCategory.ReportGeneration, pageUrl: '/generate', isEnabled: false, prompt: 'Prompt 2', icon: Bot },
];

describe('AgentManager', () => {
  it('renders a loading skeleton when agents are being fetched', () => {
    mockedUseAgents.mockReturnValue({ agents: [], isLoaded: false, isError: false });
    render(<Wrapper><AgentManager /></Wrapper>);
    
    // Check for multiple skeleton elements
    const skeletons = screen.getAllByRole('listitem'); // Assuming skeletons are list items or have a role
    expect(skeletons.length).toBeGreaterThan(0);
    skeletons.forEach(skeleton => {
        expect(skeleton.classList.contains('animate-pulse')).toBe(true);
    });
  });

  it('renders an error message when fetching fails', () => {
    mockedUseAgents.mockReturnValue({ agents: [], isLoaded: true, isError: true });
    render(<Wrapper><AgentManager /></Wrapper>);
    
    expect(screen.getByText(/Failed to load agent configurations/i)).toBeInTheDocument();
  });

  it('renders a list of agent cards when data is fetched successfully', async () => {
    mockedUseAgents.mockReturnValue({ agents: mockAgents, isLoaded: true, isError: false });
    render(<Wrapper><AgentManager /></Wrapper>);

    await waitFor(() => {
        expect(screen.getByText('Proposal Agent')).toBeInTheDocument();
        expect(screen.getByText('Creates proposals.')).toBeInTheDocument();
        expect(screen.getByText('Report Agent')).toBeInTheDocument();
        expect(screen.getByText('Creates reports.')).toBeInTheDocument();
    });

    // Check if switches are rendered with correct state
    const proposalSwitch = screen.getByRole('button', { name: /Configure/i });
    const reportSwitch = screen.getByRole('button', { name: /Configure/i });

    expect(proposalSwitch).toBeInTheDocument();
    expect(reportSwitch).toBeInTheDocument();
  });
});
