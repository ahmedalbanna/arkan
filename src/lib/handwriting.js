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
            paddingTop: 20,      // قيمة افتراضية لـ paddingTop
            paddingLeft: 20,     // قيمة افتراضية لـ paddingLeft
            paddingBottom: 20,   // قيمة افتراضية لـ paddingBottom
            paddingRight: 20,    // قيمة افتراضية لـ paddingRight

            ...options
        };
        this.text = "";
        this.lines = [];
        this.handwritingX = 0;
        this.handwritingY = 0;
        this.setBackground(options.background || "#ffffff");
        this.updateCanvasSize();
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

        // تحديد قيم padding
        const paddingTop = this.options.paddingTop || this.options.font.size; // يمكنك تعديل هذه القيم
        const paddingLeft = this.options.paddingLeft || this.options.font.size;
        const paddingBottom = this.options.paddingBottom || this.options.font.size;
        const paddingRight = this.options.paddingRight || this.options.font.size;

        this.handwritingX = paddingLeft; // إضافة padding من اليسار
        this.handwritingY = paddingTop + this.options.font.size; // إضافة padding من الأعلى
        // إضافة padding من الأعلى

        this.lines.forEach(line => {
            this.draw_line(line, paddingRight, paddingBottom); // تمرير padding للتحقق من الخروج عن الشاشة
        });
    }

    updateCanvasSize() {
        const container = this.canvas.parentNode;
        if (!container) {
            console.error("Canvas has no parent element!");
            return; // Or handle differently
        }
        this.canvas.width = container.clientWidth;
        this.canvas.height = 1000; // Or calculate dynamically, e.g., this.canvas.width * (someRatio);
        // No need to clear and fill, draw already does this
    }

    draw_line(line, paddingRight, paddingBottom) {
        this.handwritingX = this.options.font.size + this.rand(0, 10);
        const words = line.split(" ");
        words.forEach(word => {
            const wordWidth = this.ctx.measureText(word).width + this.options.font.size / 2; // قياس عرض الكلمة
            const availableWidth = this.canvas.width - this.handwritingX - paddingRight - this.options.font.size; // المساحة المتاحة
            if (wordWidth > availableWidth) {
                // إذا كانت الكلمة ستخرج عن الشاشة، انتقل إلى السطر التالي
                this.handwritingY += this.options.line.height;
                this.handwritingX = this.options.font.size + this.rand(0, 10);

                // تحقق من أن النص لن يخرج عن الشاشة من الأسفل
                if (this.handwritingY + this.options.line.height + paddingBottom > this.canvas.height) {
                    return; // أو يمكنك تنفيذ سلوك آخر مثل البدء من جديد أو اقتطاع النص
                }
            }

            this.draw_word(word);
        });
        this.handwritingY += this.options.line.height;

        // تحقق من أن النص لن يخرج عن الشاشة من الأسفل بعد الانتقال إلى السطر التالي
        if (this.handwritingY + paddingBottom > this.canvas.height) {
            return; // أو يمكنك تنفيذ سلوك آخر مثل البدء من جديد أو اقتطاع النص
        }
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
