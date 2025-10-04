import { POINTS_PER_INCH } from '@/lib/pptx-convert/constants';
import { calculateCodeLineCount, calculateLineCount } from '@/lib/pptx-convert/text-measurement';

// The mock in jest.setup.js calculates width as text.length * 6.
// So, if maxWidthInches is 1, maxWidthPx will be 72.
// This means a line can hold 72 / 6 = 12 characters before wrapping.
const FONT_FACE = 'Arial';
const FONT_SIZE = 12;
const MAX_WIDTH_INCHES = 1; // Results in 72px max width

describe('calculateLineCount', () => {
    it('should return 1 for an empty or whitespace string', () => {
        expect(calculateLineCount('', FONT_FACE, FONT_SIZE, MAX_WIDTH_INCHES)).toBe(1);
        expect(calculateLineCount('   \n   ', FONT_FACE, FONT_SIZE, MAX_WIDTH_INCHES)).toBe(1);
    });

    it('should return 1 for a short text that fits on one line', () => {
        const text = 'short text'; // length 10 < 12
        expect(calculateLineCount(text, FONT_FACE, FONT_SIZE, MAX_WIDTH_INCHES)).toBe(1);
    });

    it('should calculate multiple lines for a long text that wraps', () => {
        // "this is a" (9 chars) -> line 1
        // "long text" (9 chars) -> line 2
        const text = 'this is a long text';
        expect(calculateLineCount(text, FONT_FACE, FONT_SIZE, MAX_WIDTH_INCHES)).toBe(2);
    });

    it('should handle multiple paragraphs separated by newlines', () => {
        // "para 1" -> 1 line
        // "" -> 1 line (empty line)
        // "para 2" -> 1 line
        const text = 'para 1\n\npara 2';
        expect(calculateLineCount(text, FONT_FACE, FONT_SIZE, MAX_WIDTH_INCHES)).toBe(3);
    });

    it('should correctly calculate lines when a word is longer than the max width', () => {
        // "a" -> line 1
        // "longwordthatwraps" -> line 2
        const text = 'a longwordthatwraps';
        expect(calculateLineCount(text, FONT_FACE, FONT_SIZE, MAX_WIDTH_INCHES)).toBe(2);
    });
});

describe('calculateCodeLineCount', () => {
    it('should return 1 for a null or empty string', () => {
        expect(calculateCodeLineCount('', FONT_FACE, FONT_SIZE, MAX_WIDTH_INCHES)).toBe(1);
    });

    it('should count each newline as a separate line', () => {
        const text = 'line 1\nline 2\nline 3';
        expect(calculateCodeLineCount(text, FONT_FACE, FONT_SIZE, MAX_WIDTH_INCHES)).toBe(3);
    });

    it('should wrap long lines that exceed the max width', () => {
        // Using the mocked canvas context: 6px per character
        // "this is a very long line of code" = 33 characters = 198px
        // 198px / 72px max width = 2.75 -> ceil(2.75) = 3 lines
        const longLine = 'this is a very long line of code'; // 33 chars
        const text = `short line\n${longLine}`;
        expect(calculateCodeLineCount(text, FONT_FACE, FONT_SIZE, MAX_WIDTH_INCHES)).toBe(4); // 1 for short line, 3 for long line
    });

    it('should handle empty lines within the code block', () => {
        const text = 'first line\n\nthird line';
        expect(calculateCodeLineCount(text, FONT_FACE, FONT_SIZE, MAX_WIDTH_INCHES)).toBe(3);
    });

    it('should handle a complex mix of short, long, and empty lines', () => {
        const longLine1 = 'this is a very long line of code that will wrap'; // wraps to 4 lines
        const longLine2 = 'another long line that also wraps for sure'; // wraps to 4 lines
        const text = `short\n${longLine1}\n\nshort again\n${longLine2}`;
        // 1 (short)
        // 4 (longLine1)
        // 1 (empty line)
        // 1 (short again)
        // 4 (longLine2)
        // Total = 11
        const longLine1Wraps = Math.ceil((longLine1.length * 6) / (MAX_WIDTH_INCHES * POINTS_PER_INCH));
        const longLine2Wraps = Math.ceil((longLine2.length * 6) / (MAX_WIDTH_INCHES * POINTS_PER_INCH));
        const expectedLines = 1 + longLine1Wraps + 1 + 1 + longLine2Wraps;

        expect(calculateCodeLineCount(text, FONT_FACE, FONT_SIZE, MAX_WIDTH_INCHES)).toBe(expectedLines);
    });
});
