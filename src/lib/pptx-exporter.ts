
'use client';

// Define font options for different language scripts
interface FontOptions {
    default?: string; // For LTR languages
    rtl?: string;     // For RTL languages like Arabic
    code?: string;    // For code blocks and inline code
}

import type { PresentationSlide } from "@/ai/schemas";
import { templates, type PptxTemplateKey } from "./pptx-styles";
import { saveAs } from 'file-saver';
import { convertMarkdownToPptx } from './markdown-to-pptx-converter';
// Helper function to remove markdown characters for a cleaner text output
function stripMarkdown(text: string): string {
    return text
        .replace(/(\*\*|__)(.*?)\1/g, '$2') // Bold
        .replace(/(\*|_)(.*?)\1/g, '$2')   // Italic
        .replace(/`([^`]+)`/g, '$2')       // Inline code
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1'); // Links
}

async function getTemplatesFromStorage(): Promise<Record<PptxTemplateKey, any>> {
    try {
        const response = await fetch('/api/admin/templates/pptx');
        if (!response.ok) {
            console.error("Failed to fetch templates, using defaults.");
            return templates;
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching templates, using defaults:", error);
        return templates;
    }
}


export async function exportPresentationAsPptx(
    slides: PresentationSlide[],
    pptxTemplateKey : PptxTemplateKey,
    options: { isRtl?: boolean, fonts?: FontOptions } = {}
) {
    const allTemplates = await getTemplatesFromStorage();
    const template = allTemplates[pptxTemplateKey ];

    if (!template) {
        console.error(`Template with key "${pptxTemplateKey }" not found.`);
        return;
    }
    
    // Combine slides into a single markdown string
    const markdown = slides.map(slide => {
        let slideContent = `# ${slide.title}\n\n`;
        slideContent += slide.content.map(item => `- ${item}`).join('\n');
        slideContent += `\n\n> Notes:\n> ${slide.speakerNotes}`;
        return slideContent;
    }).join('\n\n---\n\n');

    await convertMarkdownToPptx(markdown, "presentation", {
        styles: template.styles,
        isRtl: options.isRtl,
        fonts: options.fonts,
        includeToc: false, // Don't include a TOC for presentations by default
        title: slides[0]?.title || "Presentation"
    });
}
