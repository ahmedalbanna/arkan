import { splitAstIntoSlides, getNodeText } from '@/lib/ast-utils';
import type { Root as MdastRoot, RootContent } from 'mdast';

describe('splitAstIntoSlides', () => {
    it('should return an empty array for an empty document', () => {
        const ast: MdastRoot = { type: 'root', children: [] };
        const slides = splitAstIntoSlides(ast);
        expect(slides).toEqual([]);
    });

    it('should treat a document with no headings as a single slide', () => {
        const ast: MdastRoot = {
            type: 'root',
            children: [
                { type: 'paragraph', children: [{ type: 'text', value: 'Some content.' }] },
                { type: 'paragraph', children: [{ type: 'text', value: 'More content.' }] },
            ],
        };
        const slides = splitAstIntoSlides(ast);
        expect(slides).toHaveLength(1);
        expect(slides[0].children).toHaveLength(2);
    });

    it('should split slides based on h1 headings', () => {
        const ast: MdastRoot = {
            type: 'root',
            children: [
                { type: 'heading', depth: 1, children: [{ type: 'text', value: 'Slide 1' }] },
                { type: 'paragraph', children: [{ type: 'text', value: 'Content 1' }] },
                { type: 'heading', depth: 1, children: [{ type: 'text', value: 'Slide 2' }] },
                { type: 'paragraph', children: [{ type: 'text', value: 'Content 2' }] },
            ],
        };
        const slides = splitAstIntoSlides(ast);
        expect(slides).toHaveLength(2);
        expect(slides[0].children[0].type).toBe('heading');
        expect(slides[1].children[0].type).toBe('heading');
    });

    it('should create a title slide for content before the first heading', () => {
        const ast: MdastRoot = {
            type: 'root',
            children: [
                { type: 'paragraph', children: [{ type: 'text', value: 'This is a title slide.' }] },
                { type: 'heading', depth: 1, children: [{ type: 'text', value: 'First Real Slide' }] },
                { type: 'paragraph', children: [{ type: 'text', value: 'Content' }] },
            ],
        };
        const slides = splitAstIntoSlides(ast);
        expect(slides).toHaveLength(2);
        // Check first slide (the title slide)
        expect(slides[0].children).toHaveLength(1);
        expect(slides[0].children[0].type).toBe('paragraph');

        // Check second slide
        expect(slides[1].children).toHaveLength(2);
        expect(slides[1].children[0].type).toBe('heading');
    });

    it('should split slides using thematic breaks (---)', () => {
        const ast: MdastRoot = {
            type: 'root',
            children: [
                { type: 'heading', depth: 1, children: [{ type: 'text', value: 'Slide 1' }] },
                { type: 'paragraph', children: [{ type: 'text', value: 'Part 1' }] },
                { type: 'thematicBreak' },
                { type: 'paragraph', children: [{ type: 'text', value: 'Part 2' }] },
            ],
        };
        const slides = splitAstIntoSlides(ast);
        expect(slides).toHaveLength(2);
        // The thematicBreak itself should not be in the content
        expect(slides[0].children.some(n => n.type === 'thematicBreak')).toBe(false);
        expect(slides[1].children.some(n => n.type === 'thematicBreak')).toBe(false);
        expect(slides[1].children[0].type).toBe('paragraph');
    });
});

describe('getNodeText', () => {
    it('should extract text from a simple paragraph', () => {
        const node: RootContent = {
            type: 'paragraph',
            children: [{ type: 'text', value: 'Hello world' }],
        };
        expect(getNodeText(node)).toBe('Hello world');
    });

    it('should extract and concatenate text from multiple nodes', () => {
        const node: RootContent = {
            type: 'paragraph',
            children: [
                { type: 'text', value: 'Hello ' },
                { type: 'strong', children: [{ type: 'text', value: 'bold' }] },
                { type: 'text', value: ' world' },
            ],
        };
        expect(getNodeText(node)).toBe('Hello bold world');
    });
});
