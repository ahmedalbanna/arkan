import { createSlidesWithContent, FontOptions } from '@/lib/pptx-convert/slide-layout-engine';
import { renderNodeOnSlide, transformInlinesToPptxText } from '@/lib/pptx-renderer';
import type { Root as MdastRoot } from 'mdast';
import type { PptxStyleOptions } from '@/lib/types';

// Mock the entire renderer module. We don't want to test its implementation here,
// only that the layout engine calls it correctly for unsplittable nodes.
jest.mock('@/lib/pptx-renderer', () => ({
    renderNodeOnSlide: jest.fn(),
    // Mock transformInlinesToPptxText to return a predictable, simple structure.
    transformInlinesToPptxText: jest.fn(async (nodes) => {
        const text = nodes.map((n: any) => n.value || (n.children?.[0]?.value || '')).join('');
        return [{ text, options: {} }];
    }),
}));

// Helper to create a mock PptxGenJS instance with mock slides
const createMockPptx = () => {
    const slides: any[] = [];
    const pptx = {
        addSlide: jest.fn((options) => {
            const newSlide = {
                addText: jest.fn(),
                addImage: jest.fn(),
                addTable: jest.fn(),
                addShape: jest.fn(),
                addNotes: jest.fn(),
                masterName: options?.masterName,
            };
            slides.push(newSlide);
            return newSlide;
        }),
        slides, // Property to access the created mock slides for assertions
    };
    return pptx;
};

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
        fontFace: 'Arial',
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

const mockMasterNames = { cover: 'COVER', content: 'CONTENT' };

describe('slide-layout-engine', () => {
    let mockPptx: any;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        mockPptx = createMockPptx();
    });

    it('should create a single content slide for a simple AST', async () => {
        const slidesContent: MdastRoot[] = [
            {
                type: 'root',
                children: [
                    { type: 'heading', depth: 1, children: [{ type: 'text', value: 'Slide Title' }] },
                    { type: 'paragraph', children: [{ type: 'text', value: 'Hello, world.' }] },
                ],
            },
        ];

        await createSlidesWithContent(mockPptx, slidesContent, mockStyles, mockMasterNames);

        // Assertions
        expect(mockPptx.addSlide).toHaveBeenCalledTimes(1);
        expect(mockPptx.addSlide).toHaveBeenCalledWith({ masterName: 'CONTENT' });

        const firstSlide = mockPptx.slides[0];
        // Called once for the title
        expect(firstSlide.addText).toHaveBeenCalledWith(
            expect.any(Array),
            { placeholder: 'title' }
        );
        // Called once for the paragraph body
        expect(firstSlide.addText).toHaveBeenCalledWith(
            [{ text: 'Hello, world.', options: {} }],
            expect.objectContaining({ y: expect.any(Number) })
        );
    });

    it('should create a cover slide if the first slide has no heading', async () => {
        const slidesContent: MdastRoot[] = [
            {
                type: 'root',
                children: [{ type: 'paragraph', children: [{ type: 'text', value: 'Cover Content' }] }],
            },
        ];

        await createSlidesWithContent(mockPptx, slidesContent, mockStyles, mockMasterNames);

        expect(mockPptx.addSlide).toHaveBeenCalledTimes(1);
        expect(mockPptx.addSlide).toHaveBeenCalledWith({ masterName: 'COVER' });
    });

    it('should process speaker notes and remove the note from the body', async () => {
        const slidesContent: MdastRoot[] = [
            {
                type: 'root',
                children: [
                    { type: 'heading', depth: 1, children: [{ type: 'text', value: 'Title' }] },
                    { type: 'paragraph', children: [{ type: 'text', value: 'Main content.' }] },
                    {
                        type: 'blockquote',
                        children: [{ type: 'paragraph', children: [{ type: 'text', value: 'Notes: Remember to talk about Q4.' }] }],
                    },
                ],
            },
        ];

        await createSlidesWithContent(mockPptx, slidesContent, mockStyles, mockMasterNames);

        const firstSlide = mockPptx.slides[0];
        expect(firstSlide.addNotes).toHaveBeenCalledTimes(1);
        expect(firstSlide.addNotes).toHaveBeenCalledWith('Remember to talk about Q4.');

        // Ensure the notes blockquote was not rendered as text
        expect(firstSlide.addText).toHaveBeenCalledTimes(2); // Once for title, once for main content
        expect(firstSlide.addText).not.toHaveBeenCalledWith(
            expect.stringContaining('Notes:'),
            expect.any(Object)
        );
    });

    it('should render footnotes at the bottom of the slide', async () => {
        const slidesContent: MdastRoot[] = [
            {
                type: 'root',
                children: [
                    { type: 'heading', depth: 1, children: [{ type: 'text', value: 'Title' }] },
                    {
                        type: 'paragraph',
                        children: [
                            { type: 'text', value: 'Some text' },
                            { type: 'footnoteReference', identifier: '1' },
                        ],
                    },
                    {
                        type: 'footnoteDefinition',
                        identifier: '1',
                        children: [{ type: 'paragraph', children: [{ type: 'text', value: 'This is a footnote.' }] }],
                    },
                ],
            },
        ];

        await createSlidesWithContent(mockPptx, slidesContent, mockStyles, mockMasterNames);

        const firstSlide = mockPptx.slides[0];
        // Check for the separator line
        expect(firstSlide.addShape).toHaveBeenCalledTimes(1);
        // Check for the footnote text itself
        expect(firstSlide.addText).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ text: '1' }), // The superscript number
                expect.objectContaining({ text: 'This is a footnote.' }),
            ]),
            expect.objectContaining({ valign: 'top' })
        );
    });
});
