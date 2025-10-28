

'use client';

import { Document, Packer, Paragraph, AlignmentType, Table, TextRun, Header, Footer, PageNumber, SectionType } from 'docx';
import { saveAs } from 'file-saver';

import { templates } from './docx-styles';
import { createDocxContent } from './markdown-to-word-converter';


const defaultStyles = templates.modern.styles;



export async function exportReportAsDocx(
    sections: { [key in string]?: string; },
    sectionsToInclude?: string[]
) {
    const styles = defaultStyles;
    const docxObjects: (Paragraph | Table)[] = [];
    const sectionOrder = sectionsToInclude && sectionsToInclude.length > 0
        ? sectionsToInclude
        : Object.keys(sections);

    for (const key of sectionOrder) {
        const content = sections[key];
        const title = '';
        if (content) {
            docxObjects.push(new Paragraph({
                text: title,
                heading: 'Heading1',
            }));
            const { docxObjects: sectionDocxObjects } = await createDocxContent(content);
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
    saveAs(blob, "project-report.docx");
}
