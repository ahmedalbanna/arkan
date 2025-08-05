

'use client';

import type { PresentationSlide } from "@/ai/schemas";
import { templates, type PptxTemplateKey } from "./pptx-styles";

// Helper function to remove markdown characters for a cleaner text output
function stripMarkdown(text: string): string {
    return text
        .replace(/(\*\*|__)(.*?)\1/g, '$2') // Bold
        .replace(/(\*|_)(.*?)\1/g, '$2')   // Italic
        .replace(/`([^`]+)`/g, '$2')       // Inline code
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1'); // Links
}

async function getStylesFromServer(): Promise<Record<PptxTemplateKey, any>> {
    if (typeof window === 'undefined') {
        return templates;
    }
    try {
        const response = await fetch('/api/admin/templates/pptx');
        if (!response.ok) {
            console.error('Failed to fetch PPTX templates from server, falling back to defaults.');
            return templates;
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching PPTX templates, falling back to defaults:', error);
        return templates;
    }
}

export async function exportPresentationAsPptx(slides: PresentationSlide[], templateKey: PptxTemplateKey) {
    const { default: pptxgen } = await import('pptxgenjs');

    if (!slides || slides.length === 0) {
        console.error("No slides provided for PPTX export.");
        return;
    }
    const allTemplates = await getStylesFromServer();
    const styles = allTemplates[templateKey]?.styles || templates.modern.styles;

    let pptx = new pptxgen();

    // Set presentation properties
    pptx.layout = "LAYOUT_16x9";
    pptx.author = "Arkan AI";
    pptx.company = "Firebase Studio";
    pptx.subject = "Project Presentation";
    pptx.title = slides[0]?.title || "Presentation";

    // --- Master Slide Definitions ---

    // 1. Master for Title Slide (Cover)
    pptx.defineSlideMaster({
        title: "TITLE_SLIDE",
        background: { color: styles.background.color },
        objects: [
            {
                placeholder: {
                    options: { name: "title", type: "title", x: 0.5, y: 2.0, w: '90%', h: 1.5, ...styles.title },
                    text: "Presentation Title"
                }
            },
            {
                placeholder: {
                    options: { name: "subtitle", type: "body", x: 0.5, y: 3.5, w: '90%', h: 1.0, ...styles.body },
                    text: "Subtitle or Author"
                }
            },
        ],
    });

    // 2. Master for Content Slides
    pptx.defineSlideMaster({
        title: "CONTENT_SLIDE",
        background: { color: styles.background.color },
        objects: [
            {
                placeholder: {
                    options: { name: "title", type: "title", x: 0.5, y: 0.25, w: '90%', h: 1, ...styles.title },
                    text: "Slide Title",
                },
            },
            {
                placeholder: {
                    options: { name: "body", type: "body", x: 0.5, y: 1.5, w: '90%', h: 5, ...styles.body },
                    text: "Slide Content",
                },
            },
        ],
    });
    
    // 3. Master for Section Header
    pptx.defineSlideMaster({
        title: "SECTION_HEADER",
        background: { color: styles.title.color }, // Use title color for accent
        objects: [
             {
                placeholder: {
                    options: { name: "title", type: "title", x: 0.5, y: 2.5, w: '90%', h: 1.5, ...styles.title, color: styles.background.color, align: 'center' },
                    text: "Section Header"
                }
            },
        ]
    });
    
     // 4. Master for Title Only
    pptx.defineSlideMaster({
        title: "TITLE_ONLY",
        background: { color: styles.background.color },
        objects: [
             {
                placeholder: {
                    options: { name: "title", type: "title", x: 0.5, y: 2.5, w: '90%', h: 1.5, ...styles.title, align: 'center' },
                    text: "Slide Title"
                }
            },
        ]
    });


    // --- Slide Creation Loop ---

    slides.forEach((slideData, index) => {
        const masterName = `MASTER_${slideData.layout?.toUpperCase() || 'CONTENT_SLIDE'}`;
        const slide = pptx.addSlide({ masterName: "CONTENT_SLIDE" });
        
        slide.addText(stripMarkdown(slideData.title), { placeholder: 'title' });
        
        const contentBullets = slideData.content.map(item => ({
            text: stripMarkdown(item),
            options: { bullet: true, ...styles.body }
        }));
        
        if(contentBullets.length > 0) {
            slide.addText(contentBullets, { placeholder: 'body' });
        }

        if (slideData.speakerNotes) {
            slide.addNotes(stripMarkdown(slideData.speakerNotes));
        }
    });

    pptx.writeFile({ fileName: `presentation.pptx` }).catch(err => {
        console.error("Error writing PPTX file:", err);
    });
}
