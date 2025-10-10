
'use client';

// Define font options for different language scripts
interface FontOptions {
    default?: string; // For LTR languages
    rtl?: string;     // For RTL languages like Arabic
    code?: string;    // For code blocks and inline code
}

import type { PresentationSlide } from "@/ai/schemas";
import { convertMarkdownToPptx } from './markdown-to-pptx-converter';
import { templates } from "./pptx-styles";

const defaultStyles = templates.modern.styles;

export async function exportPresentationAsPptx(
    slides: PresentationSlide[],
    options: { isRtl?: boolean, fonts?: FontOptions } = {}
) {
    const styles = defaultStyles;

    // Combine slides into a single markdown string
    const markdown = slides.map(slide => {
        let slideContent = `# ${slide.title}\n\n`;
        slideContent += slide.content.map(item => `- ${item}`).join('\n');
        slideContent += `\n\n> Notes:\n> ${slide.speakerNotes}`;
        return slideContent;
    }).join('\n\n---\n\n');

    await convertMarkdownToPptx(markdown, "presentation", {
        styles: styles,
        isRtl: options.isRtl,
        fonts: options.fonts,
        includeToc: false, // Don't include a TOC for presentations by default
        title: slides[0]?.title || "Presentation"
    });
}
