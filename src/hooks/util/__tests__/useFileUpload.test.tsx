import { act, renderHook, waitFor } from '@testing-library/react';

let capturedOnDrop: ((files: File[]) => Promise<void>) | undefined;

jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/hooks/util/use-toast', () => ({ useToast: jest.fn() }));
jest.mock('@/infrastructure/api/authenticated-client-call', () => ({ runAuthenticatedResultCall: jest.fn() }));
jest.mock('react-dropzone', () => ({
  useDropzone: jest.fn((options: { onDrop: (files: File[]) => Promise<void> }) => {
    capturedOnDrop = options.onDrop;
    return { getRootProps: jest.fn(), getInputProps: jest.fn(), isDragActive: false };
  }),
}));

const { useAuth } = jest.requireMock('@/context/AuthContext') as { useAuth: jest.Mock };
const { useToast } = jest.requireMock('@/hooks/util/use-toast') as { useToast: jest.Mock };
const { runAuthenticatedResultCall } = jest.requireMock('@/infrastructure/api/authenticated-client-call') as { runAuthenticatedResultCall: jest.Mock };

const { useFileUpload } = require('../useFileUpload') as typeof import('../useFileUpload');

describe('useFileUpload', () => {
  const firebaseUser = { uid: 'upload-user-1' } as { uid: string };
  const toast = jest.fn();
  const refetchUser = jest.fn();
  const setValue = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    capturedOnDrop = undefined;
    useAuth.mockReturnValue({ firebaseUser, refetchUser });
    useToast.mockReturnValue({ toast });
  });

  it('processes uploaded files through the authenticated helper and sets form text', async () => {
    runAuthenticatedResultCall.mockResolvedValue({ markdown: '# Extracted Markdown' });
    renderHook(() => useFileUpload(setValue as any));

    const file = new File(['hello'], 'notes.md', { type: 'text/markdown' });

    await act(async () => {
      await capturedOnDrop?.([file]);
    });

    await waitFor(() => expect(setValue).toHaveBeenCalledWith('text', '# Extracted Markdown', { shouldValidate: true }));
    expect(runAuthenticatedResultCall).toHaveBeenCalled();
    expect(refetchUser).toHaveBeenCalled();
  });
});
