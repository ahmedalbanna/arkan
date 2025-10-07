
'use client';

import { AnalyzedDocument, SolvedDocument } from '@/ai/schemas';
import { saveAs } from 'file-saver';
import { createDocxParagraphs } from './docx-exporter';
import { templates, type TemplateKey } from './docx-styles';

// Dynamic imports for docx library
let docxLib: any = null;

async function getDocxLib() {
    if (!docxLib) {
        docxLib = await import('docx');
    }
    return docxLib;
}

async function getStylesFromServer(): Promise<Record<TemplateKey, { styles: any }>> {
    try {
        const response = await fetch('/api/templates/docx');
        if (!response.ok) {
            console.error('Failed to fetch DOCX templates from server, falling back to defaults.');
            return templates;
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching DOCX templates, falling back to defaults:', error);
        return templates;
    }
}

export async function exportDocumentAsDocx(
    analyzedDocument: AnalyzedDocument,
    solvedDocument: SolvedDocument,
    templateKey: TemplateKey = 'modern'
) {
    const { Document, Packer, Paragraph, HeadingLevel } = await getDocxLib();

    const allTemplates = await getStylesFromServer();
    const styles = allTemplates[templateKey]?.styles || templates.modern.styles;

    const docxContent = [];

    for (const pair of solvedDocument.solutions) {
        docxContent.push(...await createDocxParagraphs(pair.question));
        docxContent.push(new Paragraph({ text: "Solution:", style: "IntenseQuote" }));
        docxContent.push(...await createDocxParagraphs(pair.solution));
        docxContent.push(new Paragraph({ text: "" })); // Add a spacer
    }

    const doc = new Document({
        styles,
        sections: [{
            children: [
                new Paragraph({ text: `Solution: ${analyzedDocument.subject} - ${analyzedDocument.title}`, style: 'Title' }),
                ...docxContent,
            ]
        }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${analyzedDocument.title.replace(/\s+/g, '_')}_solution.docx`);
}
