import { POINTS_PER_INCH } from './constants';

/**
 * A minimal interface for a 2D rendering context, sufficient for text measurement.
 */
interface MeasurableContext {
    measureText(text: string): { width: number };
}

/**
 * A cache for measurable contexts to avoid re-allocation.
 */
const measurableContextCache: { [key: string]: MeasurableContext } = {};

/**
 * Gets a MeasurableContext using a pure heuristic approach.
 * This module is designed to run safely on both client and server.
 * Canvas-based measurement is intentionally excluded to prevent
 * "document is not defined" errors in server-side environments.
 */
function getMeasurableContext(fontFace: string, fontSize: number): MeasurableContext {
    const key = `${fontFace}-${fontSize}`;
    if (measurableContextCache[key]) {
        return measurableContextCache[key];
    }

    const heuristic: MeasurableContext = {
        measureText: (text: string) => {
            const length = text ? String(text).length : 0;
            const hasArabic = /[\u0600-\u06FF]/.test(text || '');
            const multiplier = hasArabic ? 0.7 : 0.55;
            return { width: length * fontSize * multiplier };
        }
    };

    measurableContextCache[key] = heuristic;
    return heuristic;
}

/**
 * Calculates the number of lines a given text will occupy with word wrapping.
 */
export function calculateLineCount(text: string, fontFace: string, fontSize: number, maxWidthInches: number): number {
    if (!text || !String(text).trim()) return 1;

    try {
        const context = getMeasurableContext(fontFace, fontSize);
        const maxWidthPx = maxWidthInches * POINTS_PER_INCH;

        const paragraphs = String(text).split('\n');
        let totalLines = 0;

        for (const paragraph of paragraphs) {
            const trimmed = paragraph.trim();
            if (!trimmed) {
                totalLines++;
                continue;
            }
            const words = trimmed.split(/\s+/);
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

        return Math.max(1, totalLines);
    } catch (e) {
        return 1;
    }
}

/**
 * Calculates the number of lines a code block will occupy.
 */
export function calculateCodeLineCount(text: string, fontFace: string, fontSize: number, maxWidthInches: number): number {
    if (!text) return 1;

    try {
        const context = getMeasurableContext(fontFace, fontSize);
        const maxWidthPx = maxWidthInches * POINTS_PER_INCH;

        const lines = String(text).split('\n');
        let totalLines = 0;

        for (const line of lines) {
            if (line === '') {
                totalLines++;
                continue;
            }
            const metrics = context.measureText(line);
            const lineWraps = Math.ceil(metrics.width / maxWidthPx);
            totalLines += Math.max(1, lineWraps);
        }

        return Math.max(1, totalLines);
    } catch (e) {
        return 1;
    }
}
