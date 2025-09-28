#!/bin/bash

# =============================================================================
# Multi-Format Visualization Creator
# =============================================================================
# هذا السكريبت ينشئ مخططات متعددة الصيغ للمشروع
# المؤلف: Arkan Project Team
# التاريخ: $(date +%Y-%m-%d)
# =============================================================================

set -e  # توقف عند أي خطأ

# --- إعدادات المشروع ---
PROJECT_NAME="Arkan Project"
SOURCE_DIR="src"
OUTPUT_DIR="docs/visualizations"
ENTRY_POINTS=("src/app/page.tsx" "src/app/layout.tsx" "src/ai/genkit.ts")

# --- ألوان للطباعة ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# --- دوال مساعدة ---
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

print_step() {
    echo -e "${PURPLE}→ $1${NC}"
}

# --- فحص المتطلبات ---
check_requirements() {
    print_header "فحص المتطلبات"

    local missing_tools=()

    # فحص الأدوات المطلوبة
    local tools=("ts-dependency-graph" "madge" "dot" "convert")

    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            missing_tools+=("$tool")
        else
            print_success "$tool متوفر"
        fi
    done

    if [ ${#missing_tools[@]} -gt 0 ]; then
        print_error "الأدوات التالية غير متوفرة:"
        for tool in "${missing_tools[@]}"; do
            echo "  - $tool"
        done
        echo ""
        echo "قم بتثبيت الأدوات المفقودة:"
        echo "  npm install -g ts-dependency-graph madge"
        echo "  # وثبت Graphviz و ImageMagick حسب نظام التشغيل"
        exit 1
    fi

    print_success "جميع المتطلبات متوفرة"
}

# --- إنشاء مجلدات الإخراج ---
setup_directories() {
    print_header "إعداد المجلدات"

    mkdir -p "$OUTPUT_DIR"/{svg,png,pdf,jpg,gif,webp,interactive}
    mkdir -p "$OUTPUT_DIR/interactive"/{html,js,css}

    print_success "تم إنشاء مجلدات الإخراج"
}

# --- إنشاء مخططات SVG ---
create_svg_visualizations() {
    print_header "إنشاء مخططات SVG"

    # مخطط عام للمشروع
    print_step "إنشاء مخطط عام للمشروع..."
    ts-dependency-graph \
        --start "$SOURCE_DIR" \
        --graph_folder \
        --filter \
        --max_depth 2 \
        --format dot | \
    dot -T svg -o "$OUTPUT_DIR/svg/project_overview.svg"

    # مخططات لكل نقطة دخول
    for entry_point in "${ENTRY_POINTS[@]}"; do
        if [ -f "$entry_point" ]; then
            local output_name=$(basename "$entry_point" .tsx | sed 's/\.ts$//')

            print_step "إنشاء مخطط SVG لـ $entry_point..."
            ts-dependency-graph \
                --start "$entry_point" \
                --graph_folder \
                --filter \
                --max_depth 3 \
                --format dot | \
            dot -T svg -o "$OUTPUT_DIR/svg/${output_name}_dependencies.svg"
        fi
    done

    print_success "تم إنشاء مخططات SVG"
}

# --- إنشاء مخططات PNG ---
create_png_visualizations() {
    print_header "إنشاء مخططات PNG"

    # مخطط عام للمشروع
    print_step "إنشاء مخطط PNG عام للمشروع..."
    ts-dependency-graph \
        --start "$SOURCE_DIR" \
        --graph_folder \
        --filter \
        --max_depth 2 \
        --format dot | \
    dot -T png -o "$OUTPUT_DIR/png/project_overview.png"

    # مخططات لكل نقطة دخول
    for entry_point in "${ENTRY_POINTS[@]}"; do
        if [ -f "$entry_point" ]; then
            local output_name=$(basename "$entry_point" .tsx | sed 's/\.ts$//')

            print_step "إنشاء مخطط PNG لـ $entry_point..."
            ts-dependency-graph \
                --start "$entry_point" \
                --graph_folder \
                --filter \
                --max_depth 3 \
                --format dot | \
            dot -T png -o "$OUTPUT_DIR/png/${output_name}_dependencies.png"
        fi
    done

    # مخططات Madge
    print_step "إنشاء مخططات Madge..."
    madge --image "$OUTPUT_DIR/png/madge_circular.png" --circular "$SOURCE_DIR" || true
    madge --image "$OUTPUT_DIR/png/madge_dependencies.png" "$SOURCE_DIR" || true

    print_success "تم إنشاء مخططات PNG"
}

# --- إنشاء مخططات PDF ---
create_pdf_visualizations() {
    print_header "إنشاء مخططات PDF"

    # مخطط عام للمشروع
    print_step "إنشاء مخطط PDF عام للمشروع..."
    ts-dependency-graph \
        --start "$SOURCE_DIR" \
        --graph_folder \
        --filter \
        --max_depth 2 \
        --format dot | \
    dot -T pdf -o "$OUTPUT_DIR/pdf/project_overview.pdf"

    # مخططات لكل نقطة دخول
    for entry_point in "${ENTRY_POINTS[@]}"; do
        if [ -f "$entry_point" ]; then
            local output_name=$(basename "$entry_point" .tsx | sed 's/\.ts$//')

            print_step "إنشاء مخطط PDF لـ $entry_point..."
            ts-dependency-graph \
                --start "$entry_point" \
                --graph_folder \
                --filter \
                --max_depth 3 \
                --format dot | \
            dot -T pdf -o "$OUTPUT_DIR/pdf/${output_name}_dependencies.pdf"
        fi
    done

    print_success "تم إنشاء مخططات PDF"
}

# --- إنشاء مخططات JPG ---
create_jpg_visualizations() {
    print_header "إنشاء مخططات JPG"

    # تحويل PNG إلى JPG
    print_step "تحويل مخططات PNG إلى JPG..."

    for png_file in "$OUTPUT_DIR/png"/*.png; do
        if [ -f "$png_file" ]; then
            local jpg_name=$(basename "$png_file" .png).jpg
            convert "$png_file" -quality 90 "$OUTPUT_DIR/jpg/$jpg_name"
        fi
    done

    print_success "تم إنشاء مخططات JPG"
}

# --- إنشاء مخططات WebP ---
create_webp_visualizations() {
    print_header "إنشاء مخططات WebP"

    # تحويل PNG إلى WebP
    print_step "تحويل مخططات PNG إلى WebP..."

    for png_file in "$OUTPUT_DIR/png"/*.png; do
        if [ -f "$png_file" ]; then
            local webp_name=$(basename "$png_file" .png).webp
            convert "$png_file" -quality 90 "$OUTPUT_DIR/webp/$webp_name"
        fi
    done

    print_success "تم إنشاء مخططات WebP"
}

# --- إنشاء مخططات تفاعلية ---
create_interactive_visualizations() {
    print_header "إنشاء مخططات تفاعلية"

    # إنشاء صفحة HTML تفاعلية
    local interactive_file="$OUTPUT_DIR/interactive/html/index.html"

    cat > "$interactive_file" << EOF
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مخططات تفاعلية - $PROJECT_NAME</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1400px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; }
        h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .section { margin: 20px 0; }
        .visualization-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin: 20px 0; }
        .viz-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #3498db; }
        .viz-card img { max-width: 100%; height: auto; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .viz-card h3 { color: #2980b9; margin-top: 0; }
        .download-links { margin-top: 15px; }
        .download-links a { display: inline-block; margin: 5px; padding: 8px 15px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; font-size: 0.9em; }
        .download-links a:hover { background: #2980b9; }
        .controls { background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .controls button { margin: 5px; padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer; }
        .controls button:hover { background: #229954; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-item { background: #3498db; color: white; padding: 15px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 1.5em; font-weight: bold; }
        .stat-label { font-size: 0.9em; opacity: 0.9; }
    </style>
</head>
<body>
    <div class="container">
        <h1>مخططات تفاعلية للمشروع</h1>
        <p><strong>المشروع:</strong> $PROJECT_NAME</p>
        <p><strong>تاريخ الإنشاء:</strong> $(date '+%Y-%m-%d %H:%M:%S')</p>

        <div class="stats">
            <div class="stat-item">
                <div class="stat-number">$(find "$OUTPUT_DIR/svg" -name "*.svg" | wc -l)</div>
                <div class="stat-label">مخططات SVG</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">$(find "$OUTPUT_DIR/png" -name "*.png" | wc -l)</div>
                <div class="stat-label">مخططات PNG</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">$(find "$OUTPUT_DIR/pdf" -name "*.pdf" | wc -l)</div>
                <div class="stat-label">مخططات PDF</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">$(find "$OUTPUT_DIR/jpg" -name "*.jpg" | wc -l)</div>
                <div class="stat-label">مخططات JPG</div>
            </div>
        </div>

        <div class="controls">
            <button onclick="showAll()">عرض الكل</button>
            <button onclick="showSVG()">عرض SVG فقط</button>
            <button onclick="showPNG()">عرض PNG فقط</button>
            <button onclick="showPDF()">عرض PDF فقط</button>
        </div>

        <div class="section">
            <h2>مخططات التبعيات</h2>
            <div class="visualization-grid" id="visualizations">
EOF

    # إضافة مخططات SVG
    for svg_file in "$OUTPUT_DIR/svg"/*.svg; do
        if [ -f "$svg_file" ]; then
            local filename=$(basename "$svg_file")
            local name=$(basename "$svg_file" .svg)

            cat >> "$interactive_file" << EOF
                <div class="viz-card" data-type="svg">
                    <h3>$name</h3>
                    <img src="../svg/$filename" alt="$name" onclick="openFullscreen('../svg/$filename')">
                    <div class="download-links">
                        <a href="../svg/$filename" download>تحميل SVG</a>
                        <a href="../png/${name}.png" download>تحميل PNG</a>
                        <a href="../pdf/${name}.pdf" download>تحميل PDF</a>
                    </div>
                </div>
EOF
        fi
    done

    cat >> "$interactive_file" << EOF
            </div>
        </div>

        <div class="section">
            <h2>مخططات Madge</h2>
            <div class="visualization-grid">
EOF

    # إضافة مخططات Madge
    for png_file in "$OUTPUT_DIR/png"/madge_*.png; do
        if [ -f "$png_file" ]; then
            local filename=$(basename "$png_file")
            local name=$(basename "$png_file" .png)

            cat >> "$interactive_file" << EOF
                <div class="viz-card" data-type="png">
                    <h3>$name</h3>
                    <img src="../png/$filename" alt="$name" onclick="openFullscreen('../png/$filename')">
                    <div class="download-links">
                        <a href="../png/$filename" download>تحميل PNG</a>
                        <a href="../jpg/${name}.jpg" download>تحميل JPG</a>
                        <a href="../webp/${name}.webp" download>تحميل WebP</a>
                    </div>
                </div>
EOF
        fi
    done

    cat >> "$interactive_file" << EOF
            </div>
        </div>
    </div>

    <script>
        function showAll() {
            document.querySelectorAll('.viz-card').forEach(card => card.style.display = 'block');
        }

        function showSVG() {
            document.querySelectorAll('.viz-card').forEach(card => {
                card.style.display = card.dataset.type === 'svg' ? 'block' : 'none';
            });
        }

        function showPNG() {
            document.querySelectorAll('.viz-card').forEach(card => {
                card.style.display = card.dataset.type === 'png' ? 'block' : 'none';
            });
        }

        function showPDF() {
            document.querySelectorAll('.viz-card').forEach(card => {
                card.style.display = card.dataset.type === 'pdf' ? 'block' : 'none';
            });
        }

        function openFullscreen(src) {
            const modal = document.createElement('div');
            modal.style.cssText = \`
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.9); z-index: 1000; display: flex;
                align-items: center; justify-content: center; cursor: pointer;
            \`;

            const img = document.createElement('img');
            img.src = src;
            img.style.cssText = \`
                max-width: 90%; max-height: 90%; object-fit: contain;
            \`;

            modal.appendChild(img);
            document.body.appendChild(modal);

            modal.onclick = () => document.body.removeChild(modal);
        }
    </script>
</body>
</html>
EOF

    print_success "تم إنشاء مخططات تفاعلية"
}

# --- إنشاء ملف CSS مخصص ---
create_custom_css() {
    print_header "إنشاء ملف CSS مخصص"

    local css_file="$OUTPUT_DIR/interactive/css/custom.css"

    cat > "$css_file" << EOF
/* ملف CSS مخصص للمخططات التفاعلية */

:root {
    --primary-color: #3498db;
    --secondary-color: #2c3e50;
    --accent-color: #e74c3c;
    --success-color: #27ae60;
    --warning-color: #f39c12;
    --background-color: #f5f5f5;
    --card-background: #ffffff;
    --text-color: #2c3e50;
    --border-radius: 8px;
    --shadow: 0 2px 10px rgba(0,0,0,0.1);
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: var(--background-color);
    color: var(--text-color);
    line-height: 1.6;
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    background: var(--card-background);
    padding: 20px;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
}

.viz-card {
    background: var(--card-background);
    padding: 20px;
    border-radius: var(--border-radius);
    border-left: 4px solid var(--primary-color);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.viz-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 20px rgba(0,0,0,0.15);
}

.viz-card img {
    max-width: 100%;
    height: auto;
    border-radius: 5px;
    box-shadow: var(--shadow);
    transition: transform 0.3s ease;
}

.viz-card img:hover {
    transform: scale(1.05);
}

.download-links a {
    display: inline-block;
    margin: 5px;
    padding: 8px 15px;
    background: var(--primary-color);
    color: white;
    text-decoration: none;
    border-radius: 5px;
    font-size: 0.9em;
    transition: background-color 0.3s ease;
}

.download-links a:hover {
    background: var(--secondary-color);
}

.controls button {
    margin: 5px;
    padding: 10px 20px;
    background: var(--success-color);
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.controls button:hover {
    background: #229954;
}

.stat-item {
    background: var(--primary-color);
    color: white;
    padding: 15px;
    border-radius: var(--border-radius);
    text-align: center;
    transition: transform 0.3s ease;
}

.stat-item:hover {
    transform: scale(1.05);
}

/* تأثيرات متقدمة */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.viz-card {
    animation: fadeIn 0.6s ease-out;
}

/* تصميم متجاوب */
@media (max-width: 768px) {
    .container {
        padding: 10px;
    }

    .visualization-grid {
        grid-template-columns: 1fr;
    }

    .viz-card {
        padding: 15px;
    }
}

/* ألوان مخصصة للمخططات */
.graph-node {
    fill: var(--primary-color);
    stroke: var(--secondary-color);
    stroke-width: 2px;
}

.graph-edge {
    stroke: var(--accent-color);
    stroke-width: 1px;
}

.graph-label {
    font-family: 'Segoe UI', sans-serif;
    font-size: 12px;
    fill: var(--text-color);
}
EOF

    print_success "تم إنشاء ملف CSS مخصص"
}

# --- إنشاء ملف JavaScript مخصص ---
create_custom_js() {
    print_header "إنشاء ملف JavaScript مخصص"

    local js_file="$OUTPUT_DIR/interactive/js/custom.js"

    cat > "$js_file" << EOF
// ملف JavaScript مخصص للمخططات التفاعلية

class VisualizationManager {
    constructor() {
        this.currentFilter = 'all';
        this.visualizations = document.querySelectorAll('.viz-card');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.setupLazyLoading();
    }

    setupEventListeners() {
        // أزرار الفلترة
        document.querySelectorAll('.controls button').forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.textContent.toLowerCase();
                this.filterVisualizations(filter);
            });
        });

        // النقر على الصور
        document.querySelectorAll('.viz-card img').forEach(img => {
            img.addEventListener('click', (e) => {
                this.openFullscreen(e.target.src);
            });
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case '1':
                    this.filterVisualizations('all');
                    break;
                case '2':
                    this.filterVisualizations('svg');
                    break;
                case '3':
                    this.filterVisualizations('png');
                    break;
                case '4':
                    this.filterVisualizations('pdf');
                    break;
                case 'Escape':
                    this.closeFullscreen();
                    break;
            }
        });
    }

    setupLazyLoading() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.style.opacity = '0';
                    img.style.transition = 'opacity 0.3s ease';

                    img.onload = () => {
                        img.style.opacity = '1';
                    };
                }
            });
        });

        document.querySelectorAll('.viz-card img').forEach(img => {
            observer.observe(img);
        });
    }

    filterVisualizations(filter) {
        this.currentFilter = filter;

        this.visualizations.forEach(card => {
            const type = card.dataset.type;
            let shouldShow = false;

            switch(filter) {
                case 'all':
                    shouldShow = true;
                    break;
                case 'svg':
                    shouldShow = type === 'svg';
                    break;
                case 'png':
                    shouldShow = type === 'png';
                    break;
                case 'pdf':
                    shouldShow = type === 'pdf';
                    break;
            }

            card.style.display = shouldShow ? 'block' : 'none';

            if (shouldShow) {
                card.style.animation = 'fadeIn 0.6s ease-out';
            }
        });

        this.updateActiveButton(filter);
    }

    updateActiveButton(filter) {
        document.querySelectorAll('.controls button').forEach(button => {
            button.style.background = button.textContent.toLowerCase() === filter ?
                '#2c3e50' : '#27ae60';
        });
    }

    openFullscreen(src) {
        const modal = document.createElement('div');
        modal.className = 'fullscreen-modal';
        modal.style.cssText = \`
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.95); z-index: 1000; display: flex;
            align-items: center; justify-content: center; cursor: pointer;
            opacity: 0; transition: opacity 0.3s ease;
        \`;

        const img = document.createElement('img');
        img.src = src;
        img.style.cssText = \`
            max-width: 90%; max-height: 90%; object-fit: contain;
            border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        \`;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = \`
            position: absolute; top: 20px; right: 30px; background: none;
            border: none; color: white; font-size: 30px; cursor: pointer;
            z-index: 1001;
        \`;

        modal.appendChild(img);
        modal.appendChild(closeBtn);
        document.body.appendChild(modal);

        // تأثير الظهور
        setTimeout(() => modal.style.opacity = '1', 10);

        // إغلاق النافذة
        const closeModal = () => {
            modal.style.opacity = '0';
            setTimeout(() => document.body.removeChild(modal), 300);
        };

        modal.onclick = closeModal;
        closeBtn.onclick = closeModal;

        // منع إغلاق النافذة عند النقر على الصورة
        img.onclick = (e) => e.stopPropagation();
    }

    closeFullscreen() {
        const modal = document.querySelector('.fullscreen-modal');
        if (modal) {
            modal.click();
        }
    }
}

// تهيئة المدير عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    new VisualizationManager();
});

// دوال مساعدة
function showAll() {
    document.querySelectorAll('.viz-card').forEach(card => card.style.display = 'block');
}

function showSVG() {
    document.querySelectorAll('.viz-card').forEach(card => {
        card.style.display = card.dataset.type === 'svg' ? 'block' : 'none';
    });
}

function showPNG() {
    document.querySelectorAll('.viz-card').forEach(card => {
        card.style.display = card.dataset.type === 'png' ? 'block' : 'none';
    });
}

function showPDF() {
    document.querySelectorAll('.viz-card').forEach(card => {
        card.style.display = card.dataset.type === 'pdf' ? 'block' : 'none';
    });
}

function openFullscreen(src) {
    const modal = document.createElement('div');
    modal.style.cssText = \`
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.9); z-index: 1000; display: flex;
        align-items: center; justify-content: center; cursor: pointer;
    \`;

    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = \`
        max-width: 90%; max-height: 90%; object-fit: contain;
    \`;

    modal.appendChild(img);
    document.body.appendChild(modal);

    modal.onclick = () => document.body.removeChild(modal);
}
EOF

    print_success "تم إنشاء ملف JavaScript مخصص"
}

# --- إنشاء تقرير HTML شامل ---
generate_comprehensive_report() {
    print_header "إنشاء تقرير HTML شامل"

    local report_file="$OUTPUT_DIR/index.html"

    cat > "$report_file" << EOF
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>مخططات المشروع - $PROJECT_NAME</title>
    <link rel="stylesheet" href="interactive/css/custom.css">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1400px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; }
        h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .section { margin: 20px 0; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #3498db; color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; }
        .stat-label { font-size: 0.9em; opacity: 0.9; }
        .primary-link { background: #27ae60; color: white; padding: 15px 30px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 10px 0; font-weight: bold; }
        .primary-link:hover { background: #229954; }
        .secondary-link { background: #3498db; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 5px 0; font-weight: bold; }
        .secondary-link:hover { background: #2980b9; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #3498db; }
    </style>
</head>
<body>
    <div class="container">
        <h1>مخططات المشروع</h1>
        <p><strong>المشروع:</strong> $PROJECT_NAME</p>
        <p><strong>تاريخ الإنشاء:</strong> $(date '+%Y-%m-%d %H:%M:%S')</p>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">$(find "$OUTPUT_DIR/svg" -name "*.svg" | wc -l)</div>
                <div class="stat-label">مخططات SVG</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$(find "$OUTPUT_DIR/png" -name "*.png" | wc -l)</div>
                <div class="stat-label">مخططات PNG</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$(find "$OUTPUT_DIR/pdf" -name "*.pdf" | wc -l)</div>
                <div class="stat-label">مخططات PDF</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$(find "$OUTPUT_DIR/jpg" -name "*.jpg" | wc -l)</div>
                <div class="stat-label">مخططات JPG</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$(find "$OUTPUT_DIR/webp" -name "*.webp" | wc -l)</div>
                <div class="stat-label">مخططات WebP</div>
            </div>
        </div>

        <div class="section">
            <h2>المخططات التفاعلية</h2>
            <a href="interactive/html/index.html" class="primary-link" target="_blank">فتح المخططات التفاعلية</a>
            <p>المخططات التفاعلية تحتوي على:</p>
            <ul>
                <li>عرض جميع المخططات في مكان واحد</li>
                <li>فلترة المخططات حسب النوع</li>
                <li>عرض المخططات بحجم كامل</li>
                <li>تحميل المخططات بصيغ متعددة</li>
            </ul>
        </div>

        <div class="section">
            <h2>المخططات المتاحة</h2>
            <div class="grid">
                <div class="card">
                    <h3>مخططات SVG</h3>
                    <p>مخططات قابلة للتكبير والتفاعل</p>
                    <a href="svg/" class="secondary-link">عرض المخططات</a>
                </div>
                <div class="card">
                    <h3>مخططات PNG</h3>
                    <p>مخططات عالية الجودة للعرض</p>
                    <a href="png/" class="secondary-link">عرض المخططات</a>
                </div>
                <div class="card">
                    <h3>مخططات PDF</h3>
                    <p>مخططات للطباعة والتقارير</p>
                    <a href="pdf/" class="secondary-link">عرض المخططات</a>
                </div>
                <div class="card">
                    <h3>مخططات JPG</h3>
                    <p>مخططات مضغوطة للويب</p>
                    <a href="jpg/" class="secondary-link">عرض المخططات</a>
                </div>
                <div class="card">
                    <h3>مخططات WebP</h3>
                    <p>مخططات حديثة مضغوطة</p>
                    <a href="webp/" class="secondary-link">عرض المخططات</a>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>معلومات إضافية</h2>
            <p><strong>مجلد المصدر:</strong> $SOURCE_DIR</p>
            <p><strong>مجلد الإخراج:</strong> $OUTPUT_DIR</p>
            <p><strong>نقاط الدخول:</strong> ${ENTRY_POINTS[*]}</p>
            <p><strong>وقت الإنشاء:</strong> $(date '+%Y-%m-%d %H:%M:%S')</p>
        </div>
    </div>
</body>
</html>
EOF

    print_success "تم إنشاء التقرير الشامل: $report_file"
}

# --- الدالة الرئيسية ---
main() {
    print_header "بدء إنشاء المخططات المتعددة"

    local start_time=$(date +%s)

    check_requirements
    setup_directories
    create_svg_visualizations
    create_png_visualizations
    create_pdf_visualizations
    create_jpg_visualizations
    create_webp_visualizations
    create_interactive_visualizations
    create_custom_css
    create_custom_js
    generate_comprehensive_report

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    print_header "انتهاء إنشاء المخططات"
    print_success "تم إنشاء جميع المخططات في: $OUTPUT_DIR"
    print_success "افتح التقرير الشامل: $OUTPUT_DIR/index.html"
    print_success "افتح المخططات التفاعلية: $OUTPUT_DIR/interactive/html/index.html"
    print_success "وقت الإنشاء: ${duration} ثانية"

    # عرض إحصائيات نهائية
    echo ""
    echo "إحصائيات نهائية:"
    echo "- مخططات SVG: $(find "$OUTPUT_DIR/svg" -name "*.svg" | wc -l)"
    echo "- مخططات PNG: $(find "$OUTPUT_DIR/png" -name "*.png" | wc -l)"
    echo "- مخططات PDF: $(find "$OUTPUT_DIR/pdf" -name "*.pdf" | wc -l)"
    echo "- مخططات JPG: $(find "$OUTPUT_DIR/jpg" -name "*.jpg" | wc -l)"
    echo "- مخططات WebP: $(find "$OUTPUT_DIR/webp" -name "*.webp" | wc -l)"
}

# --- تشغيل السكريبت ---
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
