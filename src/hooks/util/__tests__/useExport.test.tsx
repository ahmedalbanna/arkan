import { act, renderHook } from '@testing-library/react';

jest.mock('file-saver', () => ({ saveAs: jest.fn() }));
jest.mock('@/hooks/util/use-toast', () => ({ toast: jest.fn() }));
jest.mock('@/infrastructure/api/ApiService', () => ({ apiService: jest.fn() }));
jest.mock('@/infrastructure/di/container', () => ({ container: { resolve: jest.fn() } }));

const { saveAs } = jest.requireMock('file-saver') as { saveAs: jest.Mock };
const { apiService } = jest.requireMock('@/infrastructure/api/ApiService') as { apiService: jest.Mock };
const { container } = jest.requireMock('@/infrastructure/di/container') as { container: { resolve: jest.Mock } };

const { useExport } = require('../useExport') as typeof import('../useExport');

describe('useExport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exports docx reports through apiService blob responses', async () => {
    apiService.mockResolvedValue(new Blob(['docx'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
    const project = { name: 'My Project', toStateObject: jest.fn(() => ({ id: 'p1', name: 'My Project' })) } as any;
    const selectedContent = [{ toStateObject: jest.fn(() => ({ id: 'c1' })) }] as any;

    const { result } = renderHook(() => useExport());

    await act(async () => {
      await result.current.exportReportDocx({ project, selectedContent, options: { template: 'modern', pageNumbers: true } });
    });

    expect(apiService).toHaveBeenCalledWith(expect.objectContaining({ endpoint: '/api/export/docx', method: 'POST', responseType: 'blob' }));
    expect(saveAs).toHaveBeenCalled();
  });

  it('exports pptx presentations through the client export service', async () => {
    container.resolve.mockReturnValue({ export: jest.fn().mockResolvedValue(new Blob(['pptx'])) });
    const project = { name: 'Slides' } as any;
    const selectedContent = [{ toStateObject: jest.fn(() => ({ id: 's1' })) }] as any;

    const { result } = renderHook(() => useExport());

    await act(async () => {
      await result.current.exportPresentationPptx({ project, selectedContent, options: { template: 'modern', isRtl: false, includeToc: true } });
    });

    expect(container.resolve).toHaveBeenCalled();
    expect(saveAs).toHaveBeenCalled();
  });
});
