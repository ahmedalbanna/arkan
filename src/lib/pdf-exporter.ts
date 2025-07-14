
'use client';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportComponentAsPDF = (element: HTMLElement, filename: string) => {
    html2canvas(element, {
        scale: 2, // Increase scale for better resolution
        useCORS: true,
        logging: false,
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;

        let newCanvasWidth = pdfWidth;
        let newCanvasHeight = newCanvasWidth / ratio;
        
        if (newCanvasHeight > pdfHeight) {
            newCanvasHeight = pdfHeight;
            newCanvasWidth = newCanvasHeight * ratio;
        }

        const x = (pdfWidth - newCanvasWidth) / 2;
        const y = (pdfHeight - newCanvasHeight) / 2;

        pdf.addImage(imgData, 'PNG', x, y, newCanvasWidth, newCanvasHeight);
        pdf.save(filename);
    }).catch(error => {
        console.error("Error generating PDF:", error);
    });
};
