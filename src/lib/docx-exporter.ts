
'use client';

import { Document, Packer, Paragraph, Table } from 'docx';
import { saveAs } from 'file-saver';

import { templates } from './docx-styles';
import { createDocxContent } from './markdown-to-word-converter';


const defaultStyles = templates.modern.styles;



export async function exportReportAsDocx(
    sections: { [key: string]: { title: string; content: string } | undefined },
    projectName: string,
    sectionsToInclude?: string[]
) {
    const styles = defaultStyles;
    const docxObjects: (Paragraph | Table)[] = [];
    const sectionOrder = sectionsToInclude && sectionsToInclude.length > 0
        ? sectionsToInclude
        : Object.keys(sections);

    for (const key of sectionOrder) {
        const sectionData = sections[key];
        if (sectionData && sectionData.content) {
            const title = sectionData.title || key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            docxObjects.push(new Paragraph({
                text: title,
                heading: 'Heading1',
            }));
            const { docxObjects: sectionDocxObjects } = await createDocxContent(sectionData.content);
            docxObjects.push(...sectionDocxObjects.filter((obj): obj is Paragraph | Table => !('_type' in obj)));
            docxObjects.push(new Paragraph({ text: '' })); // Add a spacer
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
