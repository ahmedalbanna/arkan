
'use client';

import { Document, Packer, Paragraph, HeadingLevel, TextRun, SectionType } from 'docx';
import { saveAs } from 'file-saver';
import { AnalyzedExam, SolvedExam } from '@/ai/flows/exam-solver.shared';
import { templates, type TemplateKey } from './docx-styles';
import { createDocxParagraphs } from './docx-exporter'; // Re-use the markdown-to-docx logic

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

export async function exportExamAsDocx(
    analyzedExam: AnalyzedExam,
    solvedExam: SolvedExam,
    templateKey: TemplateKey = 'modern'
) {
    const allTemplates = await getStylesFromServer();
    const styles = allTemplates[templateKey]?.styles || templates.modern.styles;

    const questionsParagraphs = await createDocxParagraphs(analyzedExam.structuredExam);
    const solutionParagraphs = await createDocxParagraphs(solvedExam.solution);

    const doc = new Document({
        styles,
        sections: [{
            children: [
                new Paragraph({ text: `Exam: ${analyzedExam.subject} - ${analyzedExam.specialty}`, style: 'Title' }),
                new Paragraph({ text: "Questions", heading: HeadingLevel.HEADING_1, spacing: { before: 400 } }),
                ...questionsParagraphs,
                new Paragraph({ text: "Solution", heading: HeadingLevel.HEADING_1, pageBreakBefore: true, spacing: { before: 400 } }),
                ...solutionParagraphs,
            ]
        }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${analyzedExam.specialty.replace(/\s+/g, '_')}_solution.docx`);
}

export async function exportExamAsPdf(
    analyzedExam: AnalyzedExam,
    solvedExam: SolvedExam
) {
    const { jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    // Create a temporary, hidden element to render the markdown for PDF export
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '800px'; // A4-like width
    container.style.padding = '20px';
    container.style.fontFamily = 'sans-serif';

    const questionsHtml = `<h1>Questions</h1>${analyzedExam.structuredExam.replace(/\n/g, '<br>')}`;
    const solutionHtml = `<h1>Solution</h1>${solvedExam.solution.replace(/\n/g, '<br>')}`;
    container.innerHTML = `${questionsHtml}<br style="page-break-before: always;">${solutionHtml}`;

    document.body.appendChild(container);

    const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
    });

    document.body.removeChild(container);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
    }

    pdf.save(`${analyzedExam.specialty.replace(/\s+/g, '_')}_solution.pdf`);
}
