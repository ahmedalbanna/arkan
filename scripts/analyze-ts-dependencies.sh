#!/bin/bash

# =============================================================================
# TypeScript Dependency Graph Analyzer
# =============================================================================
# هذا السكريبت يحلل تبعيات TypeScript في المشروع وينشئ مخططات تفاعلية
# المؤلف: Arkan Project Team
# التاريخ: $(date +%Y-%m-%d)
# =============================================================================

set -e  # توقف عند أي خطأ

# --- إعدادات المشروع ---
PROJECT_NAME="Arkan Project"
SOURCE_DIR="src"
OUTPUT_DIR="docs/analysis/ts-dependencies"
START_POINTS=("src/app/page.tsx" "src/app/layout.tsx" "src/ai/genkit.ts")
MAX_DEPTH=3

# --- ألوان للطباعة ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# --- فحص المتطلبات ---
check_requirements() {
    print_header "فحص المتطلبات"

    # فحص ts-dependency-graph
    if ! command -v ts-dependency-graph &> /dev/null; then
        print_error "ts-dependency-graph غير مثبت"
        echo "قم بتثبيته باستخدام: npm install -g ts-dependency-graph"
        exit 1
    fi

    # فحص dot (Graphviz)
    if ! command -v dot &> /dev/null; then
        print_error "Graphviz غير مثبت"
        echo "قم بتثبيته باستخدام:"
        echo "  Ubuntu/Debian: sudo apt-get install graphviz"
        echo "  macOS: brew install graphviz"
        echo "  Windows: choco install graphviz"
        exit 1
    fi

    print_success "جميع المتطلبات متوفرة"
}

# --- إنشاء مجلدات الإخراج ---
setup_directories() {
    print_header "إعداد المجلدات"

    mkdir -p "$OUTPUT_DIR"/{svg,png,pdf,json}
    print_success "تم إنشاء مجلدات الإخراج"
}

# --- تحليل نقطة بداية واحدة ---
analyze_start_point() {
    local start_point="$1"
    local depth="$2"
    local output_name=$(basename "$start_point" .tsx | sed 's/\.ts$//')

    print_header "تحليل: $start_point (عمق: $depth)"

    # إنشاء مخطط SVG
    echo "إنشاء مخطط SVG..."
    ts-dependency-graph \
        --start "$start_point" \
        --graph_folder \
        --filter \
        --max_depth "$depth" \
        --format dot | \
    dot -T svg -o "$OUTPUT_DIR/svg/${output_name}_depth_${depth}.svg"

    # إنشاء مخطط PNG
    echo "إنشاء مخطط PNG..."
    ts-dependency-graph \
        --start "$start_point" \
        --graph_folder \
        --filter \
        --max_depth "$depth" \
        --format dot | \
    dot -T png -o "$OUTPUT_DIR/png/${output_name}_depth_${depth}.png"

    # إنشاء مخطط PDF
    echo "إنشاء مخطط PDF..."
    ts-dependency-graph \
        --start "$start_point" \
        --graph_folder \
        --filter \
        --max_depth "$depth" \
        --format dot | \
    dot -T pdf -o "$OUTPUT_DIR/pdf/${output_name}_depth_${depth}.pdf"

    # إنشاء بيانات JSON
    echo "إنشاء بيانات JSON..."
    ts-dependency-graph \
        --start "$start_point" \
        --graph_folder \
        --filter \
        --max_depth "$depth" \
        --format json > "$OUTPUT_DIR/json/${output_name}_depth_${depth}.json"

    print_success "تم تحليل $start_point"
}

# --- تحليل شامل للمشروع ---
analyze_full_project() {
    print_header "تحليل شامل للمشروع"

    # مخطط عام للمشروع
    echo "إنشاء مخطط عام للمشروع..."
    ts-dependency-graph \
        --start "$SOURCE_DIR" \
        --graph_folder \
        --filter \
        --max_depth 2 \
        --format dot | \
    dot -T svg -o "$OUTPUT_DIR/svg/project_overview.svg"

    # تحليل كل نقطة بداية
    for start_point in "${START_POINTS[@]}"; do
        if [ -f "$start_point" ]; then
            for depth in 1 2 3; do
                analyze_start_point "$start_point" "$depth"
            done
        else
            print_warning "نقطة البداية غير موجودة: $start_point"
        fi
    done
}

# --- إنشاء تقرير HTML ---
generate_html_report() {
    print_header "إنشاء تقرير HTML"

    local report_file="$OUTPUT_DIR/index.html"

    cat > "$report_file" << EOF
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير تحليل تبعيات TypeScript - $PROJECT_NAME</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; }
        h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .section { margin: 20px 0; }
        .file-list { list-style: none; padding: 0; }
        .file-list li { margin: 10px 0; padding: 10px; background: #ecf0f1; border-radius: 5px; }
        .file-list a { text-decoration: none; color: #2980b9; font-weight: bold; }
        .file-list a:hover { color: #1f4e79; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #3498db; color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; }
        .stat-label { font-size: 0.9em; opacity: 0.9; }
    </style>
</head>
<body>
    <div class="container">
        <h1>تقرير تحليل تبعيات TypeScript</h1>
        <p><strong>المشروع:</strong> $PROJECT_NAME</p>
        <p><strong>تاريخ التحليل:</strong> $(date '+%Y-%m-%d %H:%M:%S')</p>

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
                <div class="stat-number">$(find "$OUTPUT_DIR/json" -name "*.json" | wc -l)</div>
                <div class="stat-label">ملفات JSON</div>
            </div>
        </div>

        <div class="section">
            <h2>المخططات المتاحة</h2>
            <ul class="file-list">
EOF

    # إضافة روابط للمخططات
    for file in "$OUTPUT_DIR"/svg/*.svg; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo "                <li><a href=\"svg/$filename\" target=\"_blank\">$filename</a></li>" >> "$report_file"
        fi
    done

    cat >> "$report_file" << EOF
            </ul>
        </div>

        <div class="section">
            <h2>ملفات البيانات</h2>
            <ul class="file-list">
EOF

    # إضافة روابط لملفات JSON
    for file in "$OUTPUT_DIR"/json/*.json; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo "                <li><a href=\"json/$filename\" target=\"_blank\">$filename</a></li>" >> "$report_file"
        fi
    done

    cat >> "$report_file" << EOF
            </ul>
        </div>

        <div class="section">
            <h2>ملاحظات</h2>
            <ul>
                <li>المخططات SVG قابلة للتكبير والتفاعل</li>
                <li>ملفات JSON تحتوي على البيانات الخام للتحليل</li>
                <li>يمكن استخدام المخططات في التقارير والعروض التقديمية</li>
            </ul>
        </div>
    </div>
</body>
</html>
EOF

    print_success "تم إنشاء تقرير HTML: $report_file"
}

# --- الدالة الرئيسية ---
main() {
    print_header "بدء تحليل تبعيات TypeScript"

    check_requirements
    setup_directories
    analyze_full_project
    generate_html_report

    print_header "انتهاء التحليل"
    print_success "تم إنشاء جميع المخططات في: $OUTPUT_DIR"
    print_success "افتح التقرير: $OUTPUT_DIR/index.html"

    # عرض إحصائيات سريعة
    echo ""
    echo "إحصائيات سريعة:"
    echo "- عدد ملفات SVG: $(find "$OUTPUT_DIR/svg" -name "*.svg" | wc -l)"
    echo "- عدد ملفات PNG: $(find "$OUTPUT_DIR/png" -name "*.png" | wc -l)"
    echo "- عدد ملفات JSON: $(find "$OUTPUT_DIR/json" -name "*.json" | wc -l)"
}

# --- تشغيل السكريبت ---
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
