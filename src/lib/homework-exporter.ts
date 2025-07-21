
'use client';

import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { AnalyzedHomework, SolvedHomework } from '@/ai/flows/homework-solver.shared';
import { templates, type TemplateKey } from './docx-styles';
import { createDocxParagraphs } from './docx-exporter';

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

export async function exportHomeworkAsDocx(
    analyzedHomework: AnalyzedHomework,
    solvedHomework: SolvedHomework,
    templateKey: TemplateKey = 'modern'
) {
    if (!solvedHomework.solutions) {
        console.error("No solutions to export.");
        return;
    }

    const allTemplates = await getStylesFromServer();
    const styles = allTemplates[templateKey]?.styles || templates.modern.styles;

    const docxContent = [];

    for (const pair of solvedHomework.solutions) {
        docxContent.push(...await createDocxParagraphs(pair.question));
        docxContent.push(new Paragraph({ text: "Solution:", style: "IntenseQuote"}));
        docxContent.push(...await createDocxParagraphs(pair.solution));
        docxContent.push(new Paragraph({ text: "" })); // Add a spacer
    }

    const doc = new Document({
        styles,
        sections: [{
            children: [
                new Paragraph({ text: `Homework Solution: ${analyzedHomework.subject} - ${analyzedHomework.title}`, style: 'Title' }),
                ...docxContent,
            ]
        }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${analyzedHomework.title.replace(/\s+/g, '_')}_solution.docx`);
}

export async function exportHomeworkAsPdf(
    analyzedHomework: AnalyzedHomework,
    solvedHomework: SolvedHomework
) {
     if (!solvedHomework.solutions) {
        console.error("No solutions to export.");
        return;
    }
    const { jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '800px';
    container.style.padding = '20px';
    container.style.fontFamily = 'sans-serif';
    container.className = 'prose dark:prose-invert';

    let htmlContent = `<h1>Homework Solution: ${analyzedHomework.title}</h1>`;
    solvedHomework.solutions.forEach(pair => {
        htmlContent += `<div>${pair.question.replace(/\n/g, '<br>')}</div><br><strong>Solution:</strong><div>${pair.solution.replace(/\n/g, '<br>')}</div><hr>`;
    });

    container.innerHTML = htmlContent;
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

    pdf.save(`${analyzedHomework.title.replace(/\s+/g, '_')}_solution.pdf`);
}
