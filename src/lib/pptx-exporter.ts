
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
        const response = await fetch('/api/templates/pptx');
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

    // Define a master slide for consistent layout
    pptx.defineSlideMaster({
        title: "MASTER_SLIDE",
        background: styles.background,
        objects: [
            {
                text: {
                    text: "Arkan AI Generated Presentation",
                    options: {
                        x: 0.5,
                        y: "95%",
                        w: "90%",
                        h: 0.25,
                        color: styles.body.color,
                        fontSize: 10,
                        align: "center",
                    },
                },
            },
        ],
    });

    for (const slideData of slides) {
        const slide = pptx.addSlide({ masterName: "MASTER_SLIDE" });

        // Add Slide Title
        slide.addText(stripMarkdown(slideData.title), {
            x: 0.5,
            y: 0.25,
            w: "90%",
            h: 1,
            ...styles.title
        });

        // Add Main Content (Bullet Points)
        const contentBullets = slideData.content.map(item => ({
            text: stripMarkdown(item),
            options: {
                ...styles.body,
                bullet: styles.bullet.type === 'bullet' ? true : undefined,
                numbering: styles.bullet.type === 'number' ? { type: 'numbered' } : undefined,
            },
        }));

        slide.addText(contentBullets, {
            x: 0.5,
            y: 1.5,
            w: "90%",
            h: 4,
            ...styles.body,
            lineSpacing: 36,
        });

        // Add Speaker Notes
        slide.addNotes(stripMarkdown(slideData.speakerNotes));
    }

    pptx.writeFile({ fileName: `presentation.pptx` }).catch(err => {
        console.error("Error writing PPTX file:", err);
    });
}
