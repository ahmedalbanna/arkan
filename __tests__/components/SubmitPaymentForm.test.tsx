import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';
import SubmitPaymentForm from '@/components/SubmitPaymentForm';
import { toast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useSearchParams: jest.fn(),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useMutation: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));


const mockedUseSearchParams = useSearchParams as jest.Mock;
const mockedUseAuth = useAuth as jest.Mock;
const mockedUseMutation = useMutation as jest.Mock;
const mockedToast = toast as jest.Mock;

describe('SubmitPaymentForm', () => {
  let mockMutate: jest.Mock;

  beforeEach(() => {
    mockMutate = jest.fn();
    mockedUseMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
    mockedUseSearchParams.mockReturnValue(new URLSearchParams('planId=pro&planName=Professional&credits=200&price=15'));
    mockedUseAuth.mockReturnValue({
      firebaseUser: {
        uid: 'test-user-id',
        displayName: 'Test User',
        email: 'test@example.com',
        getIdToken: jest.fn().mockResolvedValue('fake-token'),
      },
    });
    mockedToast.mockClear();
  });

  it('renders the form with bank details', () => {
    render(<SubmitPaymentForm />);
    expect(screen.getByText('Bank Transfer Details')).toBeInTheDocument();
    expect(screen.getByText(/Arkan National Bank/i)).toBeInTheDocument();
    expect(screen.getByText(/SA03 8000 0000 6080 1016 7519/i)).toBeInTheDocument();
    expect(screen.getByText('Upload Receipt')).toBeInTheDocument();
  });

  it('allows file selection and shows an error for invalid file type', async () => {
    render(<SubmitPaymentForm />);
    const fileInput = screen.getByLabelText(/Proof of Payment/i);
    const badFile = new File(['hello'], 'hello.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [badFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument();
    });
  });

  it('submits the form with correct data on valid file upload', async () => {
    render(<SubmitPaymentForm />);
    const fileInput = screen.getByLabelText(/Proof of Payment/i);
    const goodFile = new File(['proof'], 'proof.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [goodFile] } });
    
    await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Submit for Verification/i });
        fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
      const formData = mockMutate.mock.calls[0][0] as FormData;
      expect(formData.get('file')).toBe(goodFile);
      expect(formData.get('userId')).toBe('test-user-id');
      expect(formData.get('planName')).toBe('Professional');
      expect(formData.get('credits')).toBe('200');
    });
  });

  it('shows a loading state when the mutation is pending', () => {
    mockedUseMutation.mockReturnValue({
        mutate: mockMutate,
        isPending: true,
      });
    render(<SubmitPaymentForm />);
    const submitButton = screen.getByRole('button', { name: /Submit for Verification/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
