
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
        background: styles.background,
        objects: [
            {
                placeholder: {
                    options: { name: "title", type: "title", x: 0.5, y: 2.0, w: '90%', h: 1.5 },
                    text: "Presentation Title"
                }
            },
            {
                placeholder: {
                    options: { name: "subtitle", type: "body", x: 0.5, y: 3.5, w: '90%', h: 1.0 },
                    text: "Subtitle or Author"
                }
            },
        ],
    });

    // 2. Master for Content Slides
    pptx.defineSlideMaster({
        title: "CONTENT_SLIDE",
        background: styles.background,
        objects: [
            {
                placeholder: {
                    options: { name: "title", type: "title", x: 0.5, y: 0.25, w: '90%', h: 1 },
                    text: "Slide Title",
                },
            },
            {
                placeholder: {
                    options: { name: "body", type: "body", x: 0.5, y: 1.5, w: '90%', h: 5 },
                    text: "Slide Content",
                },
            },
            {
                text: {
                    text: "Arkan AI",
                    options: { x: 0.5, y: '95%', w: '90%', h: 0.25, align: 'center', color: styles.body.color, fontSize: 10 },
                }
            }
        ],
    });


    // --- Slide Creation Loop ---

    slides.forEach((slideData, index) => {
        if (index === 0) {
            // Use Title Slide layout for the first slide
            const slide = pptx.addSlide({ masterName: "TITLE_SLIDE" });
            slide.addText(stripMarkdown(slideData.title), {
                placeholder: "title",
                ...styles.title,
                fontSize: 44, // Larger font for cover
                align: 'center'
            });
            // Use the first content bullet as a subtitle if it exists
            const subtitleText = slideData.content[0] ? stripMarkdown(slideData.content[0]) : (pptx.author || '');
             slide.addText(subtitleText, {
                placeholder: "subtitle",
                ...styles.body,
                fontSize: 24,
                align: 'center'
            });
        } else {
            // Use Content Slide layout for all other slides
            const slide = pptx.addSlide({ masterName: "CONTENT_SLIDE" });
            slide.addText(stripMarkdown(slideData.title), {
                placeholder: "title",
                ...styles.title
            });

            // Process content into bullet points
            const contentBullets = slideData.content.flatMap(item => 
                stripMarkdown(item).split('. ').filter(sentence => sentence.trim() !== '')
            ).map(sentence => ({
                text: sentence,
                options: {
                    ...styles.body,
                    bullet: styles.bullet.type === 'bullet' ? true : { type: 'number' },
                },
            }));

             slide.addText(contentBullets, {
                placeholder: "body",
                ...styles.body,
                lineSpacing: 36,
            });
        }
        
        // Add speaker notes to every slide
        const slide = pptx.getSlide(index + 1); // getSlide is 1-based
        if (slide) {
             slide.addNotes(stripMarkdown(slideData.speakerNotes));
        }
    });

    pptx.writeFile({ fileName: `presentation.pptx` }).catch(err => {
        console.error("Error writing PPTX file:", err);
    });
}
