'use client';

import { Document, Packer, Paragraph, HeadingLevel, AlignmentType, TextRun, Table, TableRow, TableCell, WidthType, IStylesOptions } from 'docx';
import { saveAs } from 'file-saver';
import type { ProjectProposal } from './schemas';
import type { SectionName } from '@/app/generate-report/actions';
import { marked } from 'marked';

// Helper to parse markdown for DOCX
const parseMarkdownToDocx = (markdown: string): Paragraph[] => {
    const paragraphs: Paragraph[] = [];
    if (!markdown) return paragraphs;

    const lines = markdown.split('\n');

    for (const line of lines) {
        if (line.trim() === '') continue;

        if (line.startsWith('### ')) {
            paragraphs.push(new Paragraph({ text: line.substring(4), heading: HeadingLevel.HEADING_3, spacing: { after: 120 } }));
            continue;
        }
        if (line.startsWith('## ')) {
            paragraphs.push(new Paragraph({ text: line.substring(3), heading: HeadingLevel.HEADING_2, spacing: { after: 160 } }));
            continue;
        }
        if (line.startsWith('# ')) {
            paragraphs.push(new Paragraph({ text: line.substring(2), heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }));
            continue;
        }
        if (line.startsWith('* ') || line.startsWith('- ')) {
            paragraphs.push(new Paragraph({ text: line.substring(2), bullet: { level: 0 } }));
            continue;
        }
        if (line.match(/^\d+\.\s/)) {
            paragraphs.push(new Paragraph({ text: line.replace(/^\d+\.\s/, ''), bullet: { level: 0 } }));
            continue;
        }

        paragraphs.push(new Paragraph({ text: line }));
    }

    return paragraphs;
};

export async function exportProposalAsDocx(proposal: ProjectProposal, styles: IStylesOptions) {
    const { title, category, objective, methodology, timeline, budget, expected_outcome, success_criteria, evaluation, stakeholders, risks } = proposal;
    
    const doc = new Document({
        styles,
        sections: [{
            properties: {},
            children: [
                new Paragraph({ text: title, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
                new Paragraph({ text: category, heading: HeadingLevel.HEADING_5, alignment: AlignmentType.CENTER }),
                new Paragraph({ text: "الهدف", heading: HeadingLevel.HEADING_1 }),
                new Paragraph({ text: objective }),
                new Paragraph({ text: "المنهجية", heading: HeadingLevel.HEADING_1 }),
                ...parseMarkdownToDocx(methodology),
                new Paragraph({ text: "الجدول الزمني", heading: HeadingLevel.HEADING_1 }),
                new Paragraph({ children: [new TextRun({ text: "تاريخ البدء: ", bold: true }), new TextRun(timeline.startDate)] }),
                new Paragraph({ children: [new TextRun({ text: "تاريخ الانتهاء: ", bold: true }), new TextRun(timeline.endDate)] }),
                new Paragraph({ text: "المراحل:", heading: HeadingLevel.HEADING_2 }),
                ...timeline.phases.map(p => new Paragraph({ text: `${p.name} (${p.durationWeeks} أسابيع)`, bullet: { level: 0 } })),
                new Paragraph({ text: "الميزانية", heading: HeadingLevel.HEADING_1 }),
                new Paragraph({ children: [new TextRun({ text: "المبلغ الإجمالي: ", bold: true }), new TextRun(`${budget.totalAmount.toLocaleString()} ${budget.currency}`)] }),
                new Table({ rows: [ new TableRow({ children: [ new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "البند", bold: true })]})] }), new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "التكلفة", bold: true })]})] }), ] }), ...budget.breakdown.map(b => new TableRow({ children: [ new TableCell({ children: [new Paragraph(b.item)] }), new TableCell({ children: [new Paragraph(`${b.cost.toLocaleString()} ${budget.currency}`)] }), ] })) ], width: { size: 100, type: WidthType.PERCENTAGE } }),
                new Paragraph({ text: "النتائج المتوقعة", heading: HeadingLevel.HEADING_1 }),
                ...expected_outcome.map(o => new Paragraph({ text: o, bullet: { level: 0 } })),
                new Paragraph({ text: "معايير النجاح", heading: HeadingLevel.HEADING_1 }),
                ...success_criteria.map(sc => new Paragraph({ text: sc, bullet: { level: 0 } })),
                new Paragraph({ text: "التقييم", heading: HeadingLevel.HEADING_1 }),
                ...parseMarkdownToDocx(evaluation),
                new Paragraph({ text: "أصحاب المصلحة", heading: HeadingLevel.HEADING_1 }),
                ...stakeholders.flatMap(s => [ new Paragraph({ text: `${s.name} (${s.role})`, heading: HeadingLevel.HEADING_2 }), new Paragraph({ text: s.interest }), ]),
                new Paragraph({ text: "المخاطر واستراتيجيات التخفيف", heading: HeadingLevel.HEADING_1 }),
                ...risks.flatMap(r => [ new Paragraph({ text: r.description, heading: HeadingLevel.HEADING_2 }), new Paragraph({ children: [new TextRun({ text: "استراتيجية التخفيف: ", bold: true }), new TextRun(r.mitigation)] }), ]),
            ],
        }],
    });
    
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title.replace(/ /g, '_')}_proposal.docx`);
}

export async function exportReportAsDocx(
    sections: { [key in SectionName]?: string; },
    proposalTitle: string,
    styles: IStylesOptions
) {
    const sectionConfig: { [key in SectionName]: { title: string } } = {
        introduction: { title: "المقدمة" },
        literatureReview: { title: "مراجعة الأدبيات" },
        systemAnalysis: { title: "تحليل النظام" },
        designStrategy: { title: "استراتيجية التصميم" },
        systemDesign: { title: "تصميم النظام" },
        systemProgramming: { title: "برمجة النظام" },
        systemTesting: { title: "اختبار النظام" },
        conclusion: { title: "الخاتمة" },
    };
    
    const orderedSections = Object.keys(sectionConfig) as SectionName[];
    const sectionsToExport = orderedSections
        .map(key => {
            const content = sections[key];
            return content ? { title: sectionConfig[key].title, content } : null;
        })
        .filter((s): s is { title: string; content: string } => s !== null);

    if (sectionsToExport.length === 0) return;

    const doc = new Document({
        styles,
        sections: [{
            properties: {},
            children: [
                new Paragraph({ text: proposalTitle, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
                ...sectionsToExport.flatMap(({ title, content }) => [
                    new Paragraph({
                        text: title,
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 400, after: 200 },
                    }),
                    ...parseMarkdownToDocx(content)
                ])
            ],
        }],
    });
    
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "project-report.docx");
}
