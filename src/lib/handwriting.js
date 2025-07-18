
'use client';
// Adapted from https://github.com/saurabhdaware/text-to-handwriting

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Handwriting {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.options = {
            font: {
                family: "Indie Flower, cursive",
                size: 20,
                color: "#1f1f1f",
                weight: "normal"
            },
            line: {
                height: 30,
                color: "#d1d1d1"
            },
            ...options
        };
        this.text = "";
        this.lines = [];
        this.handwritingX = 0;
        this.handwritingY = 0;
        this.setBackground(options.background || "#ffffff");
    }

    setText(text) {
        this.text = text;
        this.lines = text.split("\n");
    }

    setFontFamily(family) {
        this.options.font.family = family;
    }

    setFontSize(size) {
        this.options.font.size = size;
    }

    setFontWeight(weight) {
        this.options.font.weight = weight;
    }

    setFontColor(color) {
        this.options.font.color = color;
    }

    setLineHeight(height) {
        this.options.line.height = height;
    }

    setLineColor(color) {
        this.options.line.color = color;
    }

    setBackground(background) {
        this.canvas.style.background = background;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.handwritingX = this.options.font.size;
        this.handwritingY = this.options.font.size;
        this.lines.forEach(line => {
            this.draw_line(line);
        });
    }

    draw_line(line) {
        this.handwritingX = this.options.font.size + this.rand(0, 10);
        const words = line.split(" ");
        words.forEach(word => {
            this.draw_word(word);
        });
        this.handwritingY += this.options.line.height;
    }

    draw_word(word) {
        const letters = word.split("");
        letters.forEach(letter => {
            this.draw_letter(letter);
        });
        this.handwritingX += this.options.font.size / 2;
    }

    draw_letter(letter) {
        this.ctx.save();
        this.ctx.font = `${this.options.font.weight} ${this.options.font.size}px ${this.options.font.family}`;
        this.ctx.fillStyle = this.options.font.color;
        
        let curve = this.rand(0, 1) === 0 ? this.rand(0, 5) : -this.rand(0, 5);
        this.ctx.translate(this.handwritingX, this.handwritingY + curve);
        
        let rotate = this.rand(0, 1) === 0 ? this.rand(0, 0.01) : -this.rand(0, 0.01);
        this.ctx.rotate(rotate);
        
        this.ctx.fillText(letter, 0, 0);
        this.handwritingX += this.ctx.measureText(letter).width + this.rand(-1, 2);
        
        this.ctx.restore();
    }

    rand(min, max) {
        return Math.random() * (max - min) + min;
    }
}

export { Handwriting, Point };
