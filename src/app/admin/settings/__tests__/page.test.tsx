import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

jest.mock('lucide-react', () => ({
  Banknote: () => null,
  Building: () => null,
  Globe: () => null,
  Loader2: () => null,
  PlusCircle: () => null,
  Save: () => null,
  Settings: () => null,
  Smartphone: () => null,
  Trash2: () => null,
}));
jest.mock('@/context/LocalizationContext', () => ({
  useLocalization: jest.fn(() => ({ t: (key: string) => key })),
}));
jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/hooks', () => ({ useToast: jest.fn() }));
jest.mock('@/hooks/data/use-settings', () => ({ usePublicSettings: jest.fn() }));
jest.mock('@/hooks/data/authenticated-client-call', () => ({ runAuthenticatedResultCall: jest.fn() }));

const { useAuth } = jest.requireMock('@/context/AuthContext') as { useAuth: jest.Mock };
const { useToast } = jest.requireMock('@/hooks') as { useToast: jest.Mock };
const { usePublicSettings } = jest.requireMock('@/hooks/data/use-settings') as { usePublicSettings: jest.Mock };
const { runAuthenticatedResultCall } = jest.requireMock('@/hooks/data/authenticated-client-call') as { runAuthenticatedResultCall: jest.Mock };

import AdminSettingsPage from '../page';

describe('AdminSettingsPage', () => {
  const toast = jest.fn();
  const firebaseUser = { uid: 'admin-1' } as { uid: string };

  const renderPage = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <AdminSettingsPage />
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ firebaseUser });
    useToast.mockReturnValue({ toast });
    usePublicSettings.mockReturnValue({
      data: { newUserCredits: 10, paymentMethods: [] },
      isLoading: false,
    });
  });

  it('renders current settings and saves successfully', async () => {
    runAuthenticatedResultCall.mockResolvedValue({ newUserCredits: 25, paymentMethods: [] });

    renderPage();

    const creditsInput = screen.getByLabelText('adminSettings.newUserCreditsLabel');
    fireEvent.change(creditsInput, { target: { value: '25' } });
    fireEvent.click(screen.getByRole('button', { name: 'adminSettings.saveButton' }));

    await waitFor(() => expect(runAuthenticatedResultCall).toHaveBeenCalled());
    expect(toast).toHaveBeenCalledWith({
      title: 'adminSettings.successToastTitle',
      description: 'adminSettings.successToastDesc',
    });
  });

  it('shows a destructive toast when saving fails', async () => {
    runAuthenticatedResultCall.mockRejectedValue(new Error('Save failed'));

    renderPage();

    fireEvent.change(screen.getByLabelText('adminSettings.newUserCreditsLabel'), { target: { value: '12' } });
    fireEvent.click(screen.getByRole('button', { name: 'adminSettings.saveButton' }));

    await waitFor(() => expect(toast).toHaveBeenCalledWith({
      title: 'adminSettings.errorToastTitle',
      description: 'Save failed',
      variant: 'destructive',
    }));
  });

  it('shows an auth error toast when there is no admin user', async () => {
    useAuth.mockReturnValue({ firebaseUser: null });

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'adminSettings.saveButton' }));

    await waitFor(() => expect(toast).toHaveBeenCalledWith({
      title: 'adminSettings.errorToastTitle',
      description: 'Admin not authenticated.',
      variant: 'destructive',
    }));
    expect(runAuthenticatedResultCall).not.toHaveBeenCalled();
  });
});
