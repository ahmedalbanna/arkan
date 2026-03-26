import { fireEvent, render, screen, waitFor } from '@testing-library/react';

jest.mock('lucide-react', () => ({ Calendar: () => null, Download: () => null, Loader2: () => null }));
jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/hooks', () => ({ useToast: jest.fn() }));
jest.mock('@/context/LocalizationContext', () => ({ useLocalization: jest.fn() }));
jest.mock('@/infrastructure/api/authenticated-client-call', () => ({ runAuthenticatedResultCall: jest.fn() }));
jest.mock('@/lib/utils/pdf-utils', () => ({ convertMarkdownToPdf: jest.fn() }));
jest.mock('@/components/ui/calendar', () => ({ Calendar: () => <div data-testid="calendar" /> }));

const { useAuth } = jest.requireMock('@/context/AuthContext') as { useAuth: jest.Mock };
const { useToast } = jest.requireMock('@/hooks') as { useToast: jest.Mock };
const { useLocalization } = jest.requireMock('@/context/LocalizationContext') as { useLocalization: jest.Mock };

import { FinancialReportExporter } from '../FinancialReportExporter';

describe('FinancialReportExporter', () => {
  const toast = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ firebaseUser: { uid: 'admin-1' } });
    useToast.mockReturnValue({ toast });
    useLocalization.mockReturnValue({ t: (key: string) => key });
  });

  it('shows an error toast when date range is missing', async () => {
    render(<FinancialReportExporter />);
    fireEvent.click(screen.getByRole('button', { name: 'adminFinancialReport.exportButton' }));
    await waitFor(() => expect(toast).toHaveBeenCalled());
  });
});
