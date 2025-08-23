
'use client';
// Adapted from https://github.com/saurabhdaware/text-to-handwriting

interface Point {
    x: number;
    y: number;
}

interface HandwritingOptions {
    font?: {
        family?: string;
        size?: number;
        color?: string;
        weight?: number | string;
    };
    line?: {
        height?: number;
        color?: string;
    };
    paddingTop?: number;
    paddingLeft?: number;
    paddingBottom?: number;
    paddingRight?: number;
    background?: string;
}

interface FullHandwritingOptions {
    font: {
        family: string;
        size: number;
        color: string;
        weight: number | string;
    };
    line: {
        height: number;
        color: string;
    };
    paddingTop: number;
    paddingLeft: number;
    paddingBottom: number;
    paddingRight: number;
    background: string;
}

const defaultOptions: FullHandwritingOptions = {
    font: {
        family: "'Homemade Apple', cursive",
        size: 30,
        color: "#1f1f1f",
        weight: "normal"
    },
    line: {
        height: 45,
        color: "#d1d1d1"
    },
    paddingTop: 20,
    paddingLeft: 20,
    paddingBottom: 20,
    paddingRight: 20,
    background: "#ffffff",
};


class Handwriting {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private options: FullHandwritingOptions;
    private text: string = "";
    private lines: string[] = [];
    private handwritingX: number = 0;
    private handwritingY: number = 0;

    constructor(canvas: HTMLCanvasElement, options: HandwritingOptions = {}) {
        this.canvas = canvas;
        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Could not get 2D rendering context from canvas.");
        }
        this.ctx = context;
        this.options = {
            ...defaultOptions,
            ...options,
            font: { ...defaultOptions.font, ...options.font },
            line: { ...defaultOptions.line, ...options.line },
        } as FullHandwritingOptions;

        this.setBackground(this.options.background);
        this.updateCanvasSize();
    }

    setText(text: string): void {
        this.text = text;
        this.lines = text.split("\n");
    }

    setFontFamily(family: string): void {
        this.options.font.family = family;
    }

    setFontSize(size: number): void {
        this.options.font.size = size;
    }

    setFontWeight(weight: number | string): void {
        this.options.font.weight = weight;
    }

    setFontColor(color: string): void {
        this.options.font.color = color;
    }

    setLineHeight(height: number): void {
        this.options.line.height = height;
    }

    setLineColor(color: string): void {
        this.options.line.color = color;
    }

    setBackground(background: string): void {
        this.canvas.style.background = background;
    }

    draw(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.handwritingX = this.options.paddingLeft;
        this.handwritingY = this.options.paddingTop + this.options.font.size;

        this.lines.forEach(line => {
            this.draw_line(line);
        });
    }

    updateCanvasSize(): void {
        const container = this.canvas.parentNode as HTMLElement;
        if (!container) return;

        this.canvas.width = container.clientWidth;
        // Adjust height dynamically based on content if needed, for now a fixed large value
        // A more sophisticated approach would calculate needed height beforehand.
        this.canvas.height = 1000;

        this.draw(); // Redraw with new dimensions
    }

    private draw_line(line: string): void {
        this.handwritingX = this.options.paddingLeft + this.rand(0, 10);
        const words = line.split(" ");
        words.forEach(word => {
            const wordWidth = this.measureWordWidth(word);
            const availableWidth = this.canvas.width - this.handwritingX - this.options.paddingRight;

            if (wordWidth > availableWidth) {
                this.handwritingY += this.options.line.height;
                this.handwritingX = this.options.paddingLeft + this.rand(0, 10);
                if (this.handwritingY + this.options.line.height + this.options.paddingBottom > this.canvas.height) {
                    return;
                }
            }

            this.draw_word(word);
        });
        this.handwritingY += this.options.line.height;
        if (this.handwritingY + this.options.paddingBottom > this.canvas.height) {
            return;
        }
    }

    private measureWordWidth(word: string): number {
        this.ctx.font = `${this.options.font.weight} ${this.options.font.size}px ${this.options.font.family}`;
        return this.ctx.measureText(word).width + (this.options.font.size / 2);
    }

    private draw_word(word: string): void {
        const letters = word.split("");
        letters.forEach(letter => {
            this.draw_letter(letter);
        });
        this.handwritingX += this.options.font.size / 2;
    }

    private draw_letter(letter: string): void {
        this.ctx.save();
        this.ctx.font = `${this.options.font.weight} ${this.options.font.size}px ${this.options.font.family}`;
        this.ctx.fillStyle = this.options.font.color;

        let curve = Math.random() > 0.5 ? this.rand(0, 5) : -this.rand(0, 5);
        this.ctx.translate(this.handwritingX, this.handwritingY + curve);

        let rotate = Math.random() > 0.5 ? this.rand(0, 0.01) : -this.rand(0, 0.01);
        this.ctx.rotate(rotate);

        this.ctx.fillText(letter, 0, 0);
        this.handwritingX += this.ctx.measureText(letter).width + this.rand(-1, 2);

        this.ctx.restore();
    }

    private rand(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }
}

export { Handwriting };
export type { HandwritingOptions };
