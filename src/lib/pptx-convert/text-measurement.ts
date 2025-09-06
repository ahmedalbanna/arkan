import { POINTS_PER_INCH } from './constants';

/**
 * A minimal interface for a 2D rendering context, sufficient for text measurement.
 * This helps avoid using `any` in non-browser environments.
 */
interface MeasurableContext {
    measureText(text: string): { width: number };
}

/**
 * A cache for canvas contexts to avoid recreating them for every measurement.
 * The key is a combination of font face and size.
 */
const canvasContextCache: { [key: string]: MeasurableContext } = {};

/**
 * Gets a cached or new 2D canvas rendering context for text measurement.
 * @param fontFace The font family.
 * @param fontSize The font size in points.
 * @returns A 2D canvas rendering context.
 */
function getCanvasContext(fontFace: string, fontSize: number): MeasurableContext {
    const key = `${fontFace}-${fontSize}`;
    if (canvasContextCache[key]) {
        return canvasContextCache[key];
    }

    // This code is intended for the client-side where document is available.
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
        // Fallback for non-browser environments, though this is client-side code.
        // This is a very rough estimate, similar to the old logic.
        console.warn('Canvas context not available for text measurement. Falling back to rough estimate.');
        return {
            measureText: (text: string) => ({ width: text.length * fontSize * 0.5 }),
        };
    }
    context.font = `${fontSize}pt "${fontFace}"`;
    canvasContextCache[key] = context;
    return context;
}

/**
 * Calculates the number of lines a given text will occupy with word wrapping.
 * @param text The text content.
 * @param fontFace The font family.
 * @param fontSize The font size in points.
 * @param maxWidthInches The maximum width available for the text in inches.
 * @returns The number of lines.
 */
export function calculateLineCount(text: string, fontFace: string, fontSize: number, maxWidthInches: number): number {
    if (!text.trim()) {
        return 1; // An empty paragraph still takes up one line.
    }

    const context = getCanvasContext(fontFace, fontSize);
    const maxWidthPx = maxWidthInches * POINTS_PER_INCH; // Convert inches to points

    const paragraphs = text.split('\n');
    let totalLines = 0;

    for (const paragraph of paragraphs) {
        if (!paragraph.trim()) {
            totalLines++; // Count empty lines between paragraphs
            continue;
        }
        const words = paragraph.split(' ');
        let lineCount = 1;
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const metrics = context.measureText(testLine);
            if (metrics.width > maxWidthPx && currentLine) {
                lineCount++;
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        totalLines += lineCount;
    }

    return Math.max(1, totalLines); // A non-empty text should always have at least one line.
}

/**
 * Calculates the number of lines a code block will occupy.
 * It considers both explicit newlines and wrapping of long lines.
 * @param text The text content of the code block.
 * @param fontFace The font family.
 * @param fontSize The font size in points.
 * @param maxWidthInches The maximum width available for the text in inches.
 * @returns The number of lines.
 */
export function calculateCodeLineCount(text: string, fontFace: string, fontSize: number, maxWidthInches: number): number {
    if (!text) {
        return 1;
    }

    const context = getCanvasContext(fontFace, fontSize);
    const maxWidthPx = maxWidthInches * POINTS_PER_INCH; // Convert inches to points

    const lines = text.split('\n');
    let totalLines = 0;

    for (const line of lines) {
        // Even an empty line in a code block takes up one line of vertical space.
        if (line === '') {
            totalLines++;
            continue;
        }
        const metrics = context.measureText(line);
        const lineWraps = Math.ceil(metrics.width / maxWidthPx);
        totalLines += Math.max(1, lineWraps); // A line is at least 1 line high.
    }

    return Math.max(1, totalLines);
}
