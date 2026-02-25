
'use client';

import { Document, Packer, Paragraph, Table } from 'docx';
import { saveAs } from 'file-saver';

import type { Section } from '@/lib/models';
import { templates } from './docx-styles';
import { createDocxContent } from './markdown-to-word-converter';


const defaultStyles = templates.modern.styles;


export async function exportReportAsDocx(
    sections: Section[],
    projectName: string
) {
    const styles = defaultStyles;
    const docxObjects: (Paragraph | Table)[] = [];

    for (const section of sections) {
        if (section && section.content) {
            docxObjects.push(new Paragraph({
                text: section.title,
                heading: 'Heading1',
            }));
            const { docxObjects: sectionDocxObjects } = await createDocxContent(section.content);
            // Filter out any directive objects that shouldn't be in the final output
            docxObjects.push(...sectionDocxObjects.filter((obj): obj is Paragraph | Table => !('_type' in obj)));
            docxObjects.push(new Paragraph({ text: '' })); // Add a spacer paragraph
        }
    }

    const doc = new Document({
        styles,
        sections: [
            {
                children: docxObjects,
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${projectName.replace(/\s+/g, '_')}_report.docx`);
}
