
'use client';

export const exportComponentAsPDF = async (element: HTMLElement, filename: string) => {
    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');

    html2canvas(element, {
        scale: 2,
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
