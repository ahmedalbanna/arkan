export class Handwriting {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.text = '';
        this.fontFamily = 'sans-serif';
        this.fontSize = 20;
        this.fontWeight = 400;
        this.lineHeight = 30;
        this.fontColor = '#000000';
        this.backgroundColor = '#FFFFFF';
        this.updateCanvasSize();
    }

    updateCanvasSize() {
        const parent = this.canvas.parentElement;
        if (parent) {
            this.canvas.width = parent.clientWidth;
            this.canvas.height = parent.clientHeight > 0 ? parent.clientHeight : 500; // Default height
            this.draw();
        }
    }

    setText(text) {
        this.text = text;
    }

    setFontFamily(fontFamily) {
        this.fontFamily = fontFamily;
    }

    setFontSize(fontSize) {
        this.fontSize = fontSize;
    }

    setFontWeight(fontWeight) {
        this.fontWeight = fontWeight;
    }

    setLineHeight(lineHeight) {
        this.lineHeight = lineHeight;
    }

    setFontColor(color) {
        this.fontColor = color;
    }

    setBackground(color) {
        this.backgroundColor = color;
    }

    draw() {
        if (!this.ctx) return;

        // Clear canvas with background color
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Set font properties
        this.ctx.fillStyle = this.fontColor;
        this.ctx.font = `${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;
        this.ctx.textBaseline = 'top';

        const lines = this.text.split('\n');
        let y = 10; // Initial y position with some padding

        lines.forEach(line => {
            y = this.wrapText(line, 10, y, this.canvas.width - 20, this.lineHeight);
        });
    }

    // Helper to wrap text
    wrapText(text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = this.ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                this.ctx.fillText(line, x, currentY);
                line = words[n] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        this.ctx.fillText(line, x, currentY);
        return currentY + lineHeight;
    }
}
