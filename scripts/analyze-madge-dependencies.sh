#!/bin/bash

# =============================================================================
# Madge Dependency Analyzer
# =============================================================================
# هذا السكريبت يستخدم Madge لتحليل تبعيات JavaScript/TypeScript
# المؤلف: Arkan Project Team
# التاريخ: $(date +%Y-%m-%d)
# =============================================================================

set -e  # توقف عند أي خطأ

# --- إعدادات المشروع ---
PROJECT_NAME="Arkan Project"
SOURCE_DIR="src"
OUTPUT_DIR="docs/analysis/madge-dependencies"
ENTRY_POINTS=("src/app/page.tsx" "src/app/layout.tsx" "src/ai/genkit.ts")

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

    # فحص madge
    if ! command -v madge &> /dev/null; then
        print_error "madge غير مثبت"
        echo "قم بتثبيته باستخدام: npm install -g madge"
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

    mkdir -p "$OUTPUT_DIR"/{svg,png,pdf,json,circles,circular}
    print_success "تم إنشاء مجلدات الإخراج"
}

# --- تحليل نقطة دخول واحدة ---
analyze_entry_point() {
    local entry_point="$1"
    local output_name=$(basename "$entry_point" .tsx | sed 's/\.ts$//')

    print_header "تحليل نقطة الدخول: $entry_point"

    # مخطط دائري SVG
    echo "إنشاء مخطط دائري SVG..."
    madge --circular --image "$OUTPUT_DIR/svg/${output_name}_circular.svg" "$entry_point" || true

    # مخطط دائري PNG
    echo "إنشاء مخطط دائري PNG..."
    madge --circular --image "$OUTPUT_DIR/png/${output_name}_circular.png" "$entry_point" || true

    # مخطط تبعيات SVG
    echo "إنشاء مخطط تبعيات SVG..."
    madge --image "$OUTPUT_DIR/svg/${output_name}_dependencies.svg" "$entry_point" || true

    # مخطط تبعيات PNG
    echo "إنشاء مخطط تبعيات PNG..."
    madge --image "$OUTPUT_DIR/png/${output_name}_dependencies.png" "$entry_point" || true

    # بيانات JSON
    echo "إنشاء بيانات JSON..."
    madge --json "$entry_point" > "$OUTPUT_DIR/json/${output_name}.json" || true

    # تحليل الدوائر
    echo "تحليل الدوائر..."
    madge --circular "$entry_point" > "$OUTPUT_DIR/circles/${output_name}_circles.txt" || true

    print_success "تم تحليل $entry_point"
}

# --- تحليل شامل للمشروع ---
analyze_full_project() {
    print_header "تحليل شامل للمشروع"

    # مخطط عام للمشروع
    echo "إنشاء مخطط عام للمشروع..."
    madge --image "$OUTPUT_DIR/svg/project_overview.svg" "$SOURCE_DIR" || true
    madge --image "$OUTPUT_DIR/png/project_overview.png" "$SOURCE_DIR" || true

    # مخطط دائري عام
    echo "إنشاء مخطط دائري عام..."
    madge --circular --image "$OUTPUT_DIR/svg/project_circular.svg" "$SOURCE_DIR" || true
    madge --circular --image "$OUTPUT_DIR/png/project_circular.png" "$SOURCE_DIR" || true

    # بيانات JSON شاملة
    echo "إنشاء بيانات JSON شاملة..."
    madge --json "$SOURCE_DIR" > "$OUTPUT_DIR/json/project_full.json" || true

    # تحليل الدوائر الشامل
    echo "تحليل الدوائر الشامل..."
    madge --circular "$SOURCE_DIR" > "$OUTPUT_DIR/circles/project_circles.txt" || true

    # تحليل كل نقطة دخول
    for entry_point in "${ENTRY_POINTS[@]}"; do
        if [ -f "$entry_point" ]; then
            analyze_entry_point "$entry_point"
        else
            print_warning "نقطة الدخول غير موجودة: $entry_point"
        fi
    done
}

# --- تحليل التبعيات الخارجية ---
analyze_external_dependencies() {
    print_header "تحليل التبعيات الخارجية"

    # قائمة بالتبعيات الخارجية
    echo "إنشاء قائمة التبعيات الخارجية..."
    madge --external "$SOURCE_DIR" > "$OUTPUT_DIR/external_dependencies.txt" || true

    # مخطط التبعيات الخارجية
    echo "إنشاء مخطط التبعيات الخارجية..."
    madge --external --image "$OUTPUT_DIR/svg/external_dependencies.svg" "$SOURCE_DIR" || true
    madge --external --image "$OUTPUT_DIR/png/external_dependencies.png" "$SOURCE_DIR" || true
}

# --- تحليل الملفات غير المستخدمة ---
analyze_unused_files() {
    print_header "تحليل الملفات غير المستخدمة"

    # قائمة الملفات غير المستخدمة
    echo "إنشاء قائمة الملفات غير المستخدمة..."
    madge --unused "$SOURCE_DIR" > "$OUTPUT_DIR/unused_files.txt" || true
}

# --- تحليل العمق ---
analyze_depth() {
    print_header "تحليل عمق التبعيات"

    # تحليل العمق
    echo "إنشاء تحليل العمق..."
    madge --depends "src/app/page.tsx" > "$OUTPUT_DIR/depth_analysis.txt" || true
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
    <title>تقرير تحليل Madge - $PROJECT_NAME</title>
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
        .warning { background: #f39c12; color: white; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .error { background: #e74c3c; color: white; padding: 10px; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>تقرير تحليل Madge</h1>
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
            <h2>المخططات الدائرية</h2>
            <ul class="file-list">
EOF

    # إضافة روابط للمخططات الدائرية
    for file in "$OUTPUT_DIR"/svg/*circular*.svg; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo "                <li><a href=\"svg/$filename\" target=\"_blank\">$filename</a></li>" >> "$report_file"
        fi
    done

    cat >> "$report_file" << EOF
            </ul>
        </div>

        <div class="section">
            <h2>مخططات التبعيات</h2>
            <ul class="file-list">
EOF

    # إضافة روابط لمخططات التبعيات
    for file in "$OUTPUT_DIR"/svg/*dependencies*.svg; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo "                <li><a href=\"svg/$filename\" target=\"_blank\">$filename</a></li>" >> "$report_file"
        fi
    done

    cat >> "$report_file" << EOF
            </ul>
        </div>

        <div class="section">
            <h2>تحليل الدوائر</h2>
            <ul class="file-list">
EOF

    # إضافة روابط لتحليل الدوائر
    for file in "$OUTPUT_DIR"/circles/*.txt; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo "                <li><a href=\"circles/$filename\" target=\"_blank\">$filename</a></li>" >> "$report_file"
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
            <h2>ملاحظات مهمة</h2>
            <div class="warning">
                <strong>تحذير:</strong> المخططات الدائرية تشير إلى وجود تبعيات دائرية قد تسبب مشاكل في الأداء
            </div>
            <ul>
                <li>راجع ملفات تحليل الدوائر لتحديد التبعيات الدائرية</li>
                <li>استخدم المخططات لتحسين هيكل المشروع</li>
                <li>تجنب التبعيات الدائرية قدر الإمكان</li>
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
    print_header "بدء تحليل Madge"

    check_requirements
    setup_directories
    analyze_full_project
    analyze_external_dependencies
    analyze_unused_files
    analyze_depth
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
    echo "- عدد ملفات تحليل الدوائر: $(find "$OUTPUT_DIR/circles" -name "*.txt" | wc -l)"
}

# --- تشغيل السكريبت ---
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
