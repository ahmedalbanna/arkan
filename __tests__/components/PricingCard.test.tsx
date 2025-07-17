import { render, screen, fireEvent } from '@testing-library/react';
import { PricingCard } from '@/components/PricingCard';
import { usePurchaseCredits } from '@/hooks/use-user';
import type { PricingPlan } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// Mock the entire custom hook module
jest.mock('@/hooks/use-user', () => ({
  usePurchaseCredits: jest.fn(),
}));

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('PricingCard', () => {
  const mockPlan: PricingPlan = {
    id: 'test-plan',
    name: 'Test Plan',
    price: 10,
    credits: 100,
    features: ['Feature 1', 'Feature 2'],
    isPopular: true,
  };

  // Cast the mocked hook for TypeScript
  const mockedUsePurchaseCredits = usePurchaseCredits as jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    mockedUsePurchaseCredits.mockClear();
  });

  it('should render plan details correctly', () => {
    mockedUsePurchaseCredits.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
    
    render(<PricingCard plan={mockPlan} />);

    expect(screen.getByText('Most Popular')).toBeInTheDocument();
    expect(screen.getByText('Test Plan')).toBeInTheDocument();
    expect(screen.getByText('$10')).toBeInTheDocument();
    expect(screen.getByText('Feature 1')).toBeInTheDocument();
    expect(screen.getByText('Feature 2')).toBeInTheDocument();
  });

  it('should call the mutate function with the correct plan when the button is clicked', () => {
    const mockMutate = jest.fn();
    mockedUsePurchaseCredits.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<PricingCard plan={mockPlan} />);

    const purchaseButton = screen.getByRole('button', { name: /Purchase Test Plan/i });
    fireEvent.click(purchaseButton);

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith(mockPlan);
  });

  it('should display a loading state and be disabled when the mutation is pending', () => {
    mockedUsePurchaseCredits.mockReturnValue({
      mutate: jest.fn(),
      isPending: true, // Simulate loading state
    });

    render(<PricingCard plan={mockPlan} />);

    const purchaseButton = screen.getByRole('button', { name: /Processing.../i });
    
    expect(purchaseButton).toBeDisabled();
    expect(screen.getByText(/Processing.../i)).toBeInTheDocument();
  });
});
