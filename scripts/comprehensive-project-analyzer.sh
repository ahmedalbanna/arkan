#!/bin/bash

# =============================================================================
# Comprehensive Project Analyzer
# =============================================================================
# هذا السكريبت يجمع جميع أدوات التحليل في مكان واحد
# المؤلف: Arkan Project Team
# التاريخ: $(date +%Y-%m-%d)
# =============================================================================

set -e  # توقف عند أي خطأ

# --- إعدادات المشروع ---
PROJECT_NAME="Arkan Project"
SOURCE_DIR="src"
OUTPUT_DIR="docs/analysis/comprehensive"
SCRIPTS_DIR="scripts"

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
    print_header "فحص المتطلبات الشاملة"

    local missing_tools=()

    # فحص الأدوات المطلوبة
    local tools=("ts-dependency-graph" "madge" "typedoc" "dot" "tsc")

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
        echo "  npm install -g ts-dependency-graph madge typedoc"
        echo "  # وثبت Graphviz حسب نظام التشغيل"
        exit 1
    fi

    print_success "جميع المتطلبات متوفرة"
}

# --- إنشاء مجلدات الإخراج ---
setup_directories() {
    print_header "إعداد المجلدات"

    mkdir -p "$OUTPUT_DIR"/{reports,charts,data,logs}
    mkdir -p "$OUTPUT_DIR/reports"/{html,markdown,pdf}
    mkdir -p "$OUTPUT_DIR/charts"/{svg,png,pdf}
    mkdir -p "$OUTPUT_DIR/data"/{json,csv,xml}

    print_success "تم إنشاء مجلدات الإخراج"
}

# --- تحليل هيكل المشروع ---
analyze_project_structure() {
    print_header "تحليل هيكل المشروع"

    local structure_file="$OUTPUT_DIR/data/project_structure.json"

    print_step "جمع معلومات هيكل المشروع..."

    # عد الملفات حسب النوع
    local total_files=$(find "$SOURCE_DIR" -type f | wc -l)
    local ts_files=$(find "$SOURCE_DIR" -name "*.ts" | wc -l)
    local tsx_files=$(find "$SOURCE_DIR" -name "*.tsx" | wc -l)
    local js_files=$(find "$SOURCE_DIR" -name "*.js" | wc -l)
    local jsx_files=$(find "$SOURCE_DIR" -name "*.jsx" | wc -l)

    # عد الملفات حسب المجلد
    local components=$(find "$SOURCE_DIR" -path "*/components/*" -type f | wc -l)
    local hooks=$(find "$SOURCE_DIR" -path "*/hooks/*" -type f | wc -l)
    local services=$(find "$SOURCE_DIR" -path "*/services/*" -type f | wc -l)
    local lib=$(find "$SOURCE_DIR" -path "*/lib/*" -type f | wc -l)
    local ai=$(find "$SOURCE_DIR" -path "*/ai/*" -type f | wc -l)
    local app=$(find "$SOURCE_DIR" -path "*/app/*" -type f | wc -l)

    # إنشاء ملف JSON
    cat > "$structure_file" << EOF
{
  "project": "$PROJECT_NAME",
  "analyzed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "structure": {
    "total_files": $total_files,
    "file_types": {
      "typescript": $ts_files,
      "typescript_jsx": $tsx_files,
      "javascript": $js_files,
      "javascript_jsx": $jsx_files
    },
    "directories": {
      "components": $components,
      "hooks": $hooks,
      "services": $services,
      "lib": $lib,
      "ai": $ai,
      "app": $app
    }
  },
  "source_directory": "$SOURCE_DIR",
  "output_directory": "$OUTPUT_DIR"
}
EOF

    print_success "تم إنشاء ملف هيكل المشروع: $structure_file"
}

# --- تشغيل تحليل ts-dependency-graph ---
run_ts_dependency_analysis() {
    print_header "تحليل ts-dependency-graph"

    if [ -f "$SCRIPTS_DIR/analyze-ts-dependencies.sh" ]; then
        print_step "تشغيل تحليل ts-dependency-graph..."
        chmod +x "$SCRIPTS_DIR/analyze-ts-dependencies.sh"
        "$SCRIPTS_DIR/analyze-ts-dependencies.sh" 2>&1 | tee "$OUTPUT_DIR/logs/ts_dependency.log"
        print_success "تم تحليل ts-dependency-graph"
    else
        print_warning "سكريبت ts-dependency-graph غير موجود"
    fi
}

# --- تشغيل تحليل madge ---
run_madge_analysis() {
    print_header "تحليل Madge"

    if [ -f "$SCRIPTS_DIR/analyze-madge-dependencies.sh" ]; then
        print_step "تشغيل تحليل Madge..."
        chmod +x "$SCRIPTS_DIR/analyze-madge-dependencies.sh"
        "$SCRIPTS_DIR/analyze-madge-dependencies.sh" 2>&1 | tee "$OUTPUT_DIR/logs/madge.log"
        print_success "تم تحليل Madge"
    else
        print_warning "سكريبت Madge غير موجود"
    fi
}

# --- تشغيل TypeDoc ---
run_typedoc_analysis() {
    print_header "تحليل TypeDoc"

    if [ -f "$SCRIPTS_DIR/generate-typedoc-docs.sh" ]; then
        print_step "تشغيل TypeDoc..."
        chmod +x "$SCRIPTS_DIR/generate-typedoc-docs.sh"
        "$SCRIPTS_DIR/generate-typedoc-docs.sh" 2>&1 | tee "$OUTPUT_DIR/logs/typedoc.log"
        print_success "تم تحليل TypeDoc"
    else
        print_warning "سكريبت TypeDoc غير موجود"
    fi
}

# --- تحليل إضافي للمشروع ---
run_additional_analysis() {
    print_header "تحليل إضافي"

    # تحليل حجم الملفات
    print_step "تحليل حجم الملفات..."
    find "$SOURCE_DIR" -type f -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -nr > "$OUTPUT_DIR/data/file_sizes.txt"

    # تحليل التعقيد
    print_step "تحليل التعقيد..."
    find "$SOURCE_DIR" -name "*.ts" -o -name "*.tsx" | head -20 | while read file; do
        echo "=== $file ===" >> "$OUTPUT_DIR/data/complexity_analysis.txt"
        grep -n "function\|class\|interface\|type\|enum" "$file" >> "$OUTPUT_DIR/data/complexity_analysis.txt" || true
        echo "" >> "$OUTPUT_DIR/data/complexity_analysis.txt"
    done

    # تحليل الاستيرادات
    print_step "تحليل الاستيرادات..."
    find "$SOURCE_DIR" -name "*.ts" -o -name "*.tsx" | head -20 | while read file; do
        echo "=== $file ===" >> "$OUTPUT_DIR/data/imports_analysis.txt"
        grep -n "^import" "$file" >> "$OUTPUT_DIR/data/imports_analysis.txt" || true
        echo "" >> "$OUTPUT_DIR/data/imports_analysis.txt"
    done

    print_success "تم التحليل الإضافي"
}

# --- جمع النتائج ---
collect_results() {
    print_header "جمع النتائج"

    # نسخ الملفات المهمة
    print_step "نسخ الملفات المهمة..."

    # نسخ مخططات ts-dependency-graph
    if [ -d "docs/analysis/ts-dependencies" ]; then
        cp -r docs/analysis/ts-dependencies/* "$OUTPUT_DIR/charts/" 2>/dev/null || true
    fi

    # نسخ مخططات madge
    if [ -d "docs/analysis/madge-dependencies" ]; then
        cp -r docs/analysis/madge-dependencies/* "$OUTPUT_DIR/charts/" 2>/dev/null || true
    fi

    # نسخ وثائق TypeDoc
    if [ -d "docs/typedoc" ]; then
        cp -r docs/typedoc/* "$OUTPUT_DIR/reports/" 2>/dev/null || true
    fi

    print_success "تم جمع النتائج"
}

# --- إنشاء تقرير شامل ---
generate_comprehensive_report() {
    print_header "إنشاء تقرير شامل"

    local report_file="$OUTPUT_DIR/reports/comprehensive_report.html"

    cat > "$report_file" << EOF
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير شامل لتحليل المشروع - $PROJECT_NAME</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1400px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; }
        h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        h3 { color: #2980b9; }
        .section { margin: 20px 0; }
        .file-list { list-style: none; padding: 0; }
        .file-list li { margin: 10px 0; padding: 10px; background: #ecf0f1; border-radius: 5px; }
        .file-list a { text-decoration: none; color: #2980b9; font-weight: bold; }
        .file-list a:hover { color: #1f4e79; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #3498db; color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; }
        .stat-label { font-size: 0.9em; opacity: 0.9; }
        .primary-link { background: #27ae60; color: white; padding: 15px 30px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 10px 0; font-weight: bold; }
        .primary-link:hover { background: #229954; }
        .secondary-link { background: #3498db; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 5px 0; font-weight: bold; }
        .secondary-link:hover { background: #2980b9; }
        .warning { background: #f39c12; color: white; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .error { background: #e74c3c; color: white; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .success { background: #27ae60; color: white; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #3498db; }
    </style>
</head>
<body>
    <div class="container">
        <h1>تقرير شامل لتحليل المشروع</h1>
        <p><strong>المشروع:</strong> $PROJECT_NAME</p>
        <p><strong>تاريخ التحليل:</strong> $(date '+%Y-%m-%d %H:%M:%S')</p>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">$(find "$SOURCE_DIR" -type f | wc -l)</div>
                <div class="stat-label">إجمالي الملفات</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$(find "$SOURCE_DIR" -name "*.ts" -o -name "*.tsx" | wc -l)</div>
                <div class="stat-label">ملفات TypeScript</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$(find "$SOURCE_DIR" -path "*/components/*" -type f | wc -l)</div>
                <div class="stat-label">المكونات</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$(find "$SOURCE_DIR" -path "*/hooks/*" -type f | wc -l)</div>
                <div class="stat-label">الـ Hooks</div>
            </div>
        </div>

        <div class="section">
            <h2>التحليلات المتاحة</h2>
            <div class="grid">
                <div class="card">
                    <h3>تحليل التبعيات (ts-dependency-graph)</h3>
                    <p>مخططات تفاعلية لتبعيات TypeScript</p>
                    <a href="../docs/analysis/ts-dependencies/index.html" class="secondary-link" target="_blank">فتح التحليل</a>
                </div>
                <div class="card">
                    <h3>تحليل Madge</h3>
                    <p>تحليل التبعيات الدائرية والتبعيات الخارجية</p>
                    <a href="../docs/analysis/madge-dependencies/index.html" class="secondary-link" target="_blank">فتح التحليل</a>
                </div>
                <div class="card">
                    <h3>وثائق TypeDoc</h3>
                    <p>وثائق API تفاعلية شاملة</p>
                    <a href="../docs/typedoc/index.html" class="secondary-link" target="_blank">فتح الوثائق</a>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>الملفات والبيانات</h2>
            <div class="grid">
                <div class="card">
                    <h3>بيانات المشروع</h3>
                    <ul class="file-list">
                        <li><a href="data/project_structure.json" target="_blank">هيكل المشروع</a></li>
                        <li><a href="data/file_sizes.txt" target="_blank">أحجام الملفات</a></li>
                        <li><a href="data/complexity_analysis.txt" target="_blank">تحليل التعقيد</a></li>
                        <li><a href="data/imports_analysis.txt" target="_blank">تحليل الاستيرادات</a></li>
                    </ul>
                </div>
                <div class="card">
                    <h3>سجلات التحليل</h3>
                    <ul class="file-list">
                        <li><a href="logs/ts_dependency.log" target="_blank">سجل ts-dependency-graph</a></li>
                        <li><a href="logs/madge.log" target="_blank">سجل Madge</a></li>
                        <li><a href="logs/typedoc.log" target="_blank">سجل TypeDoc</a></li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>التوصيات</h2>
            <div class="success">
                <strong>نصائح للتحسين:</strong>
                <ul>
                    <li>راجع التبعيات الدائرية في تقرير Madge</li>
                    <li>استخدم مخططات ts-dependency-graph لفهم هيكل المشروع</li>
                    <li>راجع وثائق TypeDoc لتحسين التوثيق</li>
                    <li>راقب أحجام الملفات لتجنب الملفات الكبيرة جداً</li>
                </ul>
            </div>
        </div>

        <div class="section">
            <h2>معلومات إضافية</h2>
            <p><strong>مجلد المصدر:</strong> $SOURCE_DIR</p>
            <p><strong>مجلد الإخراج:</strong> $OUTPUT_DIR</p>
            <p><strong>وقت التحليل:</strong> $(date '+%Y-%m-%d %H:%M:%S')</p>
        </div>
    </div>
</body>
</html>
EOF

    print_success "تم إنشاء التقرير الشامل: $report_file"
}

# --- إنشاء ملف README ---
create_readme() {
    print_header "إنشاء ملف README"

    local readme_file="$OUTPUT_DIR/README.md"

    cat > "$readme_file" << EOF
# تقرير تحليل المشروع الشامل

## نظرة عامة
هذا المجلد يحتوي على تحليل شامل لمشروع $PROJECT_NAME باستخدام أدوات متعددة.

## المحتويات

### 📊 التحليلات
- **ts-dependency-graph**: مخططات تفاعلية لتبعيات TypeScript
- **Madge**: تحليل التبعيات الدائرية والتبعيات الخارجية
- **TypeDoc**: وثائق API تفاعلية شاملة

### 📁 المجلدات
- \`reports/\`: التقارير والوثائق
- \`charts/\`: المخططات والرسوم البيانية
- \`data/\`: البيانات الخام والملفات التحليلية
- \`logs/\`: سجلات تشغيل الأدوات

### 🔧 كيفية الاستخدام
1. افتح \`reports/comprehensive_report.html\` للحصول على نظرة عامة
2. استخدم الروابط في التقرير للوصول إلى التحليلات المختلفة
3. راجع ملفات البيانات في مجلد \`data/\` للتفاصيل التقنية

### 📈 الإحصائيات السريعة
- إجمالي الملفات: $(find "$SOURCE_DIR" -type f | wc -l)
- ملفات TypeScript: $(find "$SOURCE_DIR" -name "*.ts" -o -name "*.tsx" | wc -l)
- المكونات: $(find "$SOURCE_DIR" -path "*/components/*" -type f | wc -l)
- الـ Hooks: $(find "$SOURCE_DIR" -path "*/hooks/*" -type f | wc -l)

### 🚀 التوصيات
- راجع التبعيات الدائرية في تقرير Madge
- استخدم مخططات ts-dependency-graph لفهم هيكل المشروع
- راجع وثائق TypeDoc لتحسين التوثيق
- راقب أحجام الملفات لتجنب الملفات الكبيرة جداً

---
*تم إنشاء هذا التقرير في $(date '+%Y-%m-%d %H:%M:%S')*
EOF

    print_success "تم إنشاء ملف README: $readme_file"
}

# --- الدالة الرئيسية ---
main() {
    print_header "بدء التحليل الشامل للمشروع"

    local start_time=$(date +%s)

    check_requirements
    setup_directories
    analyze_project_structure
    run_ts_dependency_analysis
    run_madge_analysis
    run_typedoc_analysis
    run_additional_analysis
    collect_results
    generate_comprehensive_report
    create_readme

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    print_header "انتهاء التحليل الشامل"
    print_success "تم إنشاء جميع التحليلات في: $OUTPUT_DIR"
    print_success "افتح التقرير الشامل: $OUTPUT_DIR/reports/comprehensive_report.html"
    print_success "وقت التحليل: ${duration} ثانية"

    # عرض إحصائيات نهائية
    echo ""
    echo "إحصائيات نهائية:"
    echo "- إجمالي الملفات: $(find "$SOURCE_DIR" -type f | wc -l)"
    echo "- ملفات TypeScript: $(find "$SOURCE_DIR" -name "*.ts" -o -name "*.tsx" | wc -l)"
    echo "- المكونات: $(find "$SOURCE_DIR" -path "*/components/*" -type f | wc -l)"
    echo "- الـ Hooks: $(find "$SOURCE_DIR" -path "*/hooks/*" -type f | wc -l)"
    echo "- الخدمات: $(find "$SOURCE_DIR" -path "*/services/*" -type f | wc -l)"
    echo "- ملفات AI: $(find "$SOURCE_DIR" -path "*/ai/*" -type f | wc -l)"
}

# --- تشغيل السكريبت ---
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
