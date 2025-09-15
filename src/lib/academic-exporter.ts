
'use client';

import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { AnalyzedDocument, SolvedDocument } from '@/ai/schemas';
import { templates, type DocxTemplateKey  } from './docx-styles';
import { createDocxContent } from './markdown-to-word-converter';

async function getStylesFromServer(): Promise<Record<DocxTemplateKey , { styles: any }>> {
    try {
        const response = await fetch('/api/admin/templates/docx');
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
    docxTemplateKey : DocxTemplateKey  = 'modern'
) {
    const allTemplates = await getStylesFromServer();
    const styles = allTemplates[docxTemplateKey ]?.styles || templates.modern.styles;

    const docxContent = [];

    for (const pair of solvedDocument.solutions) {
        const { docxObjects: questionObjects } = await createDocxContent(pair.question);
        docxContent.push(...questionObjects);

        docxContent.push(new Paragraph({ text: "Solution:", style: "IntenseQuote"}));
        
        const { docxObjects: solutionObjects } = await createDocxContent(pair.solution);
        docxContent.push(...solutionObjects);

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
