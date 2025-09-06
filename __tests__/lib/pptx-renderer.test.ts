import PptxGenJS from 'pptxgenjs';
import { transformInlinesToPptxText, renderNodeOnSlide } from '@/lib/pptx-renderer';
import { getProxiedImageBuffer, arrayBufferToBase64 } from '@/lib/utils';
import type { Paragraph, Image } from 'mdast';
import type { PptxStyleOptions } from '@/lib/types';

// 1. Mock external dependencies to isolate the test
jest.mock('@/lib/utils', () => ({
    getProxiedImageBuffer: jest.fn(),
    arrayBufferToBase64: jest.fn(),
}));

// Type assertion for mocked functions
const mockedGetProxiedImageBuffer = getProxiedImageBuffer as jest.Mock;
const mockedArrayBufferToBase64 = arrayBufferToBase64 as jest.Mock;

// 2. Create a helper function to generate a mock slide object
const createMockSlide = () => ({
    addText: jest.fn(),
    addImage: jest.fn(),
    addTable: jest.fn(),
    addShape: jest.fn(),
    addNotes: jest.fn(),
});

// A minimal style object for testing purposes
const mockStyles: PptxStyleOptions = {
    body: {
        fontSize: 18, fontFace: 'Arial',
        color: '',
        align: 'left',
        valign: 'top',
        lineSpacing: 0
    },
    link: { color: '0000FF', underline: true },
    title: {
        color: '',
        fontFace: '',
        fontSize: 0,
        bold: false,
        align: 'left'
    },
    subtitle: {
        color: '',
        fontSize: 0,
        italic: false
    },
    bullet: {
        type: 'bullet'
    },
    code: {
        fill: { color: 'F2F2F2' },
        fontFace: 'Courier New',
        fontSize: 12,
        margin: 0.1
    },
    background: {
        color: 'FFFFFF'
    },
    blockquote: {
        color: '666666',
        fontFace: 'Arial',
        fontSize: 16,
        italic: true,
        indent: 0
    },
    table: {
        align: 'left',
        valign: 'top',
        border: {
            type: 'solid',
            color: '000000',
            pt: 1
        },
        color: '',
        fontFace: '',
        fontSize: 0
    },
    border: { type: 'solid', color: '000000', pt: 1 },
    tableHeaderStyle: {
        color: '000000',
        fontFace: 'Arial',
        fontSize: 14,
        align: 'center',
        valign: 'middle',
        fill: { color: 'F2F2F2' },
        bold: false
    },
    tableCellStyle: {
        color: '000000',
        fontFace: 'Arial',
        fontSize: 12,
        align: 'left',
        valign: 'top'
    },
    inlineCode: {
        fontFace: 'Courier New',
        fontSize: 12,
        color: '',
        highlight: ''
    }
};

describe('pptx-renderer', () => {
    let mockSlide: any;

    beforeEach(() => {
        // Reset all mocks and create a fresh mock slide before each test
        jest.clearAllMocks();
        mockSlide = createMockSlide();
    });

    describe('transformInlinesToPptxText', () => {
        it('should transform a simple text node into a PptxGenJS run', async () => {
            const nodes: Paragraph['children'] = [{ type: 'text', value: 'Hello' }];
            const runs = await transformInlinesToPptxText(nodes, {}, mockStyles);

            expect(runs).toHaveLength(1);
            expect(runs[0].text).toBe('Hello');
            expect(runs[0].options).toEqual({ rtlMode: false });
        });

        it('should transform a strong (bold) node', async () => {
            const nodes: Paragraph['children'] = [
                { type: 'strong', children: [{ type: 'text', value: 'Bold Text' }] },
            ];
            const runs = await transformInlinesToPptxText(nodes, {}, mockStyles);

            expect(runs).toHaveLength(1);
            expect(runs[0].text).toBe('Bold Text');
            expect(runs[0].options).toHaveProperty('bold', true);
        });

        it('should transform a link node with hyperlink options', async () => {
            const nodes: Paragraph['children'] = [
                {
                    type: 'link',
                    url: 'https://example.com',
                    title: 'Example',
                    children: [{ type: 'text', value: 'Click here' }],
                },
            ];
            const runs = await transformInlinesToPptxText(nodes, {}, mockStyles);

            expect(runs).toHaveLength(1);
            expect(runs[0].text).toBe('Click here');
            expect(runs[0].options).toHaveProperty('hyperlink', {
                url: 'https://example.com',
                tooltip: 'Example',
            });
            expect(runs[0].options).toHaveProperty('color', '0000FF');
        });
    });

    describe('renderNodeOnSlide', () => {
        it('should call slide.addText for a paragraph node', async () => {
            const paragraphNode: Paragraph = {
                type: 'paragraph',
                children: [{ type: 'text', value: 'This is a test paragraph.' }],
            };

            await renderNodeOnSlide(mockSlide, paragraphNode, 1, 1, mockStyles);

            // 3. Assert that the correct mock method was called
            expect(mockSlide.addText).toHaveBeenCalledTimes(1);

            // 4. Assert that it was called with the correct arguments
            const firstCallArgs = mockSlide.addText.mock.calls[0];
            const textRuns = firstCallArgs[0];
            const options = firstCallArgs[1];

            expect(textRuns[0].text).toBe('This is a test paragraph.');
            expect(options).toHaveProperty('y', 1);
            expect(options).toHaveProperty('h', 1);
        });

        it('should call slide.addImage for an image node', async () => {
            const imageUrl = 'https://example.com/image.png';
            const imageNode: Paragraph = {
                type: 'paragraph',
                children: [{ type: 'image', url: imageUrl, alt: 'alt text' }],
            };

            // Mock the return values of our utility functions
            mockedGetProxiedImageBuffer.mockResolvedValue({
                buffer: new ArrayBuffer(8),
                contentType: 'image/png',
            });
            mockedArrayBufferToBase64.mockReturnValue('fake-base64-string');

            await renderNodeOnSlide(mockSlide, imageNode, 1, 2, mockStyles);

            expect(mockSlide.addImage).toHaveBeenCalledTimes(1);
            expect(mockSlide.addImage).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: 'data:image/png;base64,fake-base-string',
                })
            );
            expect(getProxiedImageBuffer).toHaveBeenCalledWith(imageUrl);
        });

        it('should render a placeholder if an image fails to load', async () => {
            const imageNode: Paragraph = {
                type: 'paragraph',
                children: [{ type: 'image', url: 'bad-url', alt: 'alt text' }],
            };

            // Simulate a failure in fetching the image
            mockedGetProxiedImageBuffer.mockResolvedValue(null);

            await renderNodeOnSlide(mockSlide, imageNode, 1, 2, mockStyles);

            expect(mockSlide.addImage).not.toHaveBeenCalled();
            expect(mockSlide.addText).toHaveBeenCalledTimes(1);
            expect(mockSlide.addText).toHaveBeenCalledWith(
                'Failed to load image.',
                expect.objectContaining({ color: 'FF0000' })
            );
        });
    });
});
