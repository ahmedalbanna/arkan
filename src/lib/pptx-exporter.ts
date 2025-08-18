
'use client';

import type { PresentationSlide } from "@/ai/schemas";
import { templates, type PptxTemplateKey } from "./pptx-styles";
import { saveAs } from 'file-saver';
import { lineBreak } from "html2canvas/dist/types/css/property-descriptors/line-break";
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


export async function exportPresentationAsPptx(slides: PresentationSlide[], templateKey: PptxTemplateKey) {
    const allTemplates = await getTemplatesFromStorage();
    const template = allTemplates[templateKey];

    if (!template) {
        console.error(`Template with key "${templateKey}" not found.`);
        return;
    }

    // Fallback to pptxgenjs if no template URL or if automizer fails
    const { default: pptxgen } = await import('pptxgenjs');
    let pptx = new pptxgen();
    pptx.layout = "LAYOUT_16x9";
    pptx.author = "Arkan AI";
    pptx.company = "Firebase Studio";
    pptx.subject = "Project Presentation";
    pptx.title = slides[0]?.title || "Presentation";

    const styles = template.styles || templates.modern.styles;

    for (const slideData of slides) {
        const slide = pptx.addSlide();
        
        // Add Slide Title
        slide.addText(stripMarkdown(slideData.title), {
            x: 0.5, y: 0.25, w: "90%", h: 1, ...styles.title
        });

        // Add Main Content as bullet points
        const contentBullets = slideData.content.map(item => ({
            text: stripMarkdown(item),
            options: { // Apply body styles to each bullet point
                ...styles.body, // Apply body styles to each bullet point
                bullet: styles.bullet.type === 'bullet' ? true : undefined,
                numbering: styles.bullet.type === 'number' ? { type: 'numbered' } : undefined,
            },
        }));

        // Determine content position and dimensions based on layout
        let contentX = 0.5;
        let contentY = 1.5;
        let contentW = "90%";
        let contentH = 4;
        let breakLine = true;
        slide.addText(contentBullets, {
            x: contentX, y: contentY, w: contentW, h: contentH, ...styles.body, lineSpacing: 36,breakLine
        });

        slide.addNotes(stripMarkdown(slideData.speakerNotes));
    }

    pptx.writeFile({ fileName: `presentation.pptx` }).catch(err => {
        console.error("Error writing PPTX file with pptxgenjs:", err);
    });
}

