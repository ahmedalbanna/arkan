'use client';

import pptxgen from "pptxgenjs";
import type { PresentationSlide } from "@/ai/schemas";

// Helper function to remove markdown characters for a cleaner text output
function stripMarkdown(text: string): string {
    return text
        .replace(/(\*\*|__)(.*?)\1/g, '$2') // Bold
        .replace(/(\*|_)(.*?)\1/g, '$2')   // Italic
        .replace(/`([^`]+)`/g, '$2')       // Inline code
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1'); // Links
}

export function exportPresentationAsPptx(slides: PresentationSlide[]) {
    if (!slides || slides.length === 0) {
        console.error("No slides provided for PPTX export.");
        return;
    }

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
        background: { color: "FFFFFF" },
        objects: [
            {
                text: {
                    text: "Arkan AI Generated Presentation",
                    options: {
                        x: 0.5,
                        y: "95%",
                        w: "90%",
                        h: 0.25,
                        color: "A9A9A9",
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
            fontSize: 28,
            bold: true,
            color: "363636",
        });

        // Add Main Content (Bullet Points)
        const contentBullets = slideData.content.map(item => ({
            text: stripMarkdown(item),
            options: {
                bullet: true,
            },
        }));

        slide.addText(contentBullets, {
            x: 0.5,
            y: 1.5,
            w: "90%",
            h: 4,
            fontSize: 18,
            color: "4f4f4f",
            lineSpacing: 36,
        });

        // Add Speaker Notes
        slide.addNotes(stripMarkdown(slideData.speakerNotes));
    }

    pptx.writeFile({ fileName: `presentation.pptx` }).catch(err => {
        console.error("Error writing PPTX file:", err);
    });
}
