import { PdfPreview } from '@/components/PdfPreview';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';


// Mock PDF.js
const mockPdfJs = {
    GlobalWorkerOptions: { workerSrc: '' },
    getDocument: jest.fn(),
};

// Mock dynamic import
jest.mock('pdfjs-dist', () => mockPdfJs, { virtual: true });
jest.mock('pdfjs-dist/build/pdf', () => mockPdfJs, { virtual: true });

// Mock canvas context
const mockCanvasContext = {
    clearRect: jest.fn(),
};

const mockCanvas = {
    getContext: jest.fn(() => mockCanvasContext),
    height: 0,
    width: 0,
};

// Mock canvas ref
jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useRef: () => ({ current: mockCanvas }),
}));

describe('PdfPreview Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPdfJs.getDocument.mockClear();
    });

    test('renders loading state initially', () => {
        render(<PdfPreview fileUri="/test.pdf" />);

        expect(screen.getByText('Loading PDF...')).toBeInTheDocument();
        expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
    });

    test('handles PDF loading success', async () => {
        const mockPdf = {
            numPages: 5,
            getPage: jest.fn().mockResolvedValue({
                getViewport: jest.fn().mockReturnValue({ width: 800, height: 600 }),
                render: jest.fn().mockReturnValue({ promise: Promise.resolve() }),
            }),
        };

        mockPdfJs.getDocument.mockReturnValue({
            promise: Promise.resolve(mockPdf),
            onProgress: jest.fn(),
        });

        render(<PdfPreview fileUri="/test.pdf" />);

        await waitFor(() => {
            expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
        });

        expect(screen.getByTitle('Previous page')).toBeDisabled();
        expect(screen.getByTitle('Next page')).not.toBeDisabled();
    });

    test('handles PDF loading error with retry option', async () => {
        const error = new Error('Failed to load PDF');
        error.name = 'InvalidPDFException';

        mockPdfJs.getDocument.mockReturnValue({
            promise: Promise.reject(error),
            onProgress: jest.fn(),
        });

        render(<PdfPreview fileUri="/test.pdf" />);

        await waitFor(() => {
            expect(screen.getByText('Invalid PDF file format')).toBeInTheDocument();
        });

        expect(screen.getByText(/Retry \(0\/3\)/)).toBeInTheDocument();
        expect(screen.getByText('Download PDF')).toBeInTheDocument();
    });

    test('handles navigation between pages', async () => {
        const mockPdf = {
            numPages: 3,
            getPage: jest.fn().mockResolvedValue({
                getViewport: jest.fn().mockReturnValue({ width: 800, height: 600 }),
                render: jest.fn().mockReturnValue({ promise: Promise.resolve() }),
            }),
        };

        mockPdfJs.getDocument.mockReturnValue({
            promise: Promise.resolve(mockPdf),
            onProgress: jest.fn(),
        });

        render(<PdfPreview fileUri="/test.pdf" />);

        await waitFor(() => {
            expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
        });

        // Click next page
        fireEvent.click(screen.getByTitle('Next page'));

        await waitFor(() => {
            expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
        });

        // Click previous page
        fireEvent.click(screen.getByTitle('Previous page'));

        await waitFor(() => {
            expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
        });
    });

    test('handles zoom controls', async () => {
        const mockPdf = {
            numPages: 1,
            getPage: jest.fn().mockResolvedValue({
                getViewport: jest.fn().mockReturnValue({ width: 800, height: 600 }),
                render: jest.fn().mockReturnValue({ promise: Promise.resolve() }),
            }),
        };

        mockPdfJs.getDocument.mockReturnValue({
            promise: Promise.resolve(mockPdf),
            onProgress: jest.fn(),
        });

        render(<PdfPreview fileUri="/test.pdf" />);

        await waitFor(() => {
            expect(screen.getByText('150%')).toBeInTheDocument(); // Initial scale
        });

        // Test zoom in
        fireEvent.click(screen.getByTitle('Zoom in'));
        await waitFor(() => {
            expect(screen.getByText('170%')).toBeInTheDocument();
        });

        // Test zoom out
        fireEvent.click(screen.getByTitle('Zoom out'));
        await waitFor(() => {
            expect(screen.getByText('150%')).toBeInTheDocument();
        });

        // Test reset zoom
        fireEvent.click(screen.getByText('Reset'));
        await waitFor(() => {
            expect(screen.getByText('150%')).toBeInTheDocument();
        });
    });

    test('calls onError callback when provided', async () => {
        const onErrorMock = jest.fn();
        const error = new Error('Network error');
        error.name = 'UnexpectedResponseException';

        mockPdfJs.getDocument.mockReturnValue({
            promise: Promise.reject(error),
            onProgress: jest.fn(),
        });

        render(<PdfPreview fileUri="/test.pdf" onError={onErrorMock} />);

        await waitFor(() => {
            expect(onErrorMock).toHaveBeenCalledWith('Network error while loading PDF');
        });
    });

    test('renders fallback component when provided', async () => {
        const error = new Error('Test error');
        mockPdfJs.getDocument.mockReturnValue({
            promise: Promise.reject(error),
            onProgress: jest.fn(),
        });

        const fallbackComponent = <div data-testid="fallback">PDF unavailable</div>;

        render(
            <PdfPreview
                fileUri="/test.pdf"
                fallbackComponent={fallbackComponent}
            />
        );

        await waitFor(() => {
            expect(screen.getByTestId('fallback')).toBeInTheDocument();
        });
    });

    test('handles download functionality', async () => {
        const mockPdf = {
            numPages: 1,
            getPage: jest.fn().mockResolvedValue({
                getViewport: jest.fn().mockReturnValue({ width: 800, height: 600 }),
                render: jest.fn().mockReturnValue({ promise: Promise.resolve() }),
            }),
        };

        mockPdfJs.getDocument.mockReturnValue({
            promise: Promise.resolve(mockPdf),
            onProgress: jest.fn(),
        });

        // Mock createElement and click
        const mockClick = jest.fn();
        const mockAppendChild = jest.fn();
        const mockRemoveChild = jest.fn();

        Object.defineProperty(document, 'createElement', {
            value: jest.fn(() => ({
                click: mockClick,
                href: '',
                download: '',
                target: '',
            })),
        });

        Object.defineProperty(document.body, 'appendChild', {
            value: mockAppendChild,
        });

        Object.defineProperty(document.body, 'removeChild', {
            value: mockRemoveChild,
        });

        render(<PdfPreview fileUri="/test.pdf" fileName="test-document.pdf" />);

        await waitFor(() => {
            expect(screen.getByTitle('Download PDF')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTitle('Download PDF'));

        expect(mockClick).toHaveBeenCalled();
        expect(mockAppendChild).toHaveBeenCalled();
        expect(mockRemoveChild).toHaveBeenCalled();
    });
});
