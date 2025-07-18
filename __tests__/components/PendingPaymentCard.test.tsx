import { render, screen, fireEvent } from '@testing-library/react';
import { PendingPaymentCard } from '@/components/admin/PendingPaymentCard';
import { useVerifyPayment } from '@/hooks/use-transactions';
import type { TransactionData } from '@/lib/db/queries';

// Mock the useVerifyPayment hook
jest.mock('@/hooks/use-transactions', () => ({
  useVerifyPayment: jest.fn(),
}));

// Cast the mocked hook for TypeScript
const mockedUseVerifyPayment = useVerifyPayment as jest.Mock;

const mockTransaction: TransactionData = {
  id: 'txn_1',
  userId: 'user_1',
  planId: 'pro',
  planName: 'Professional Plan',
  credits: 200,
  price: 15,
  userName: 'Test User',
  userEmail: 'test@example.com',
  status: 'pending',
  proofUrl: 'http://example.com/proof.png',
  createdAt: new Date().toISOString(),
};

describe('PendingPaymentCard', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockedUseVerifyPayment.mockClear();
  });

  it('renders transaction details correctly', () => {
    mockedUseVerifyPayment.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });

    render(<PendingPaymentCard transaction={mockTransaction} />);

    expect(screen.getByText('Professional Plan')).toBeInTheDocument();
    expect(screen.getByText('User:')).toHaveTextContent('User: Test User (test@example.com)');
    expect(screen.getByText('Amount:')).toHaveTextContent('Amount: $15.00');
    expect(screen.getByText('Credits:')).toHaveTextContent('Credits: 200');
    expect(screen.getByRole('link', { name: /View Proof/i })).toHaveAttribute('href', 'http://example.com/proof.png');
  });

  it('calls the mutate function with "verified" status when Approve is clicked', () => {
    const mockMutate = jest.fn();
    mockedUseVerifyPayment.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<PendingPaymentCard transaction={mockTransaction} />);

    const approveButton = screen.getByRole('button', { name: /Approve/i });
    fireEvent.click(approveButton);

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith({
      transactionId: 'txn_1',
      userId: 'user_1',
      creditsToGrant: 200,
      status: 'verified',
      adminNotes: 'Payment approved.',
    });
  });

  it('calls the mutate function with "rejected" status when Decline is clicked', () => {
    const mockMutate = jest.fn();
    mockedUseVerifyPayment.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<PendingPaymentCard transaction={mockTransaction} />);

    const declineButton = screen.getByRole('button', { name: /Decline/i });
    fireEvent.click(declineButton);

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith({
      transactionId: 'txn_1',
      userId: 'user_1',
      creditsToGrant: 200,
      status: 'rejected',
      adminNotes: 'Payment rejected.',
    });
  });

  it('disables buttons and shows a loader when the mutation is pending', () => {
    mockedUseVerifyPayment.mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
    });

    render(<PendingPaymentCard transaction={mockTransaction} />);

    expect(screen.getByRole('button', { name: /Approve/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Decline/i })).toBeDisabled();
    // Check for the presence of the loader icon (we can't see it directly, but its presence disables buttons)
    expect(screen.getAllByRole('button').some(btn => btn.querySelector('.animate-spin'))).toBe(true);
  });
});
