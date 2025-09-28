#!/bin/bash

# =============================================================================
# TypeDoc Documentation Generator
# =============================================================================
# هذا السكريبت يستخدم TypeDoc لإنشاء وثائق API تفاعلية
# المؤلف: Arkan Project Team
# التاريخ: $(date +%Y-%m-%d)
# =============================================================================

set -e  # توقف عند أي خطأ

# --- إعدادات المشروع ---
PROJECT_NAME="Arkan Project"
SOURCE_DIR="src"
OUTPUT_DIR="docs/typedoc"
TSCONFIG_FILE="tsconfig.json"
INCLUDE_PATTERNS="src/**/*.ts src/**/*.tsx"
EXCLUDE_PATTERNS="src/**/*.test.ts src/**/*.spec.ts src/**/__tests__/**/*"

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

    # فحص TypeDoc
    if ! command -v typedoc &> /dev/null; then
        print_error "TypeDoc غير مثبت"
        echo "قم بتثبيته باستخدام: npm install -g typedoc"
        echo "أو محلياً: npm install --save-dev typedoc"
        exit 1
    fi

    # فحص TypeScript
    if ! command -v tsc &> /dev/null; then
        print_warning "TypeScript غير مثبت عالمياً، سيتم استخدام النسخة المحلية"
    fi

    # فحص ملف tsconfig.json
    if [ ! -f "$TSCONFIG_FILE" ]; then
        print_error "ملف $TSCONFIG_FILE غير موجود"
        exit 1
    fi

    print_success "جميع المتطلبات متوفرة"
}

# --- إنشاء مجلدات الإخراج ---
setup_directories() {
    print_header "إعداد المجلدات"

    mkdir -p "$OUTPUT_DIR"/{html,json,markdown}
    print_success "تم إنشاء مجلدات الإخراج"
}

# --- إنشاء ملف إعداد TypeDoc ---
create_typedoc_config() {
    print_header "إنشاء ملف إعداد TypeDoc"

    local config_file="typedoc.json"

    cat > "$config_file" << EOF
{
  "entryPoints": ["$SOURCE_DIR"],
  "out": "$OUTPUT_DIR/html",
  "json": "$OUTPUT_DIR/json/docs.json",
  "name": "$PROJECT_NAME",
  "includeVersion": true,
  "excludePrivate": false,
  "excludeProtected": false,
  "excludeExternals": true,
  "readme": "README.md",
  "theme": "default",
  "sort": ["source-order"],
  "visibilityFilters": {
    "protected": true,
    "private": true,
    "inherited": true,
    "external": false
  },
  "navigation": {
    "includeCategories": true,
    "includeGroups": true
  },
  "searchInComments": true,
  "cleanOutputDir": true,
  "categorizeByGroup": true,
  "defaultCategory": "Other",
  "categoryOrder": [
    "Components",
    "Hooks",
    "Services",
    "Utils",
    "Types",
    "AI",
    "Admin",
    "Auth",
    "Dashboard",
    "Other"
  ],
  "groupOrder": [
    "Classes",
    "Interfaces",
    "Enums",
    "Functions",
    "Variables",
    "Type Aliases",
    "Namespaces"
  ],
  "exclude": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/__tests__/**/*",
    "**/node_modules/**/*"
  ],
  "externalPattern": [
    "**/node_modules/**"
  ],
  "plugin": [
    "typedoc-plugin-markdown",
    "typedoc-plugin-no-inherit"
  ],
  "markdown": {
    "gitRevision": "main",
    "hidePageHeader": false,
    "hideBreadcrumbs": false,
    "hidePageTitle": false,
    "entryDocument": "index.md",
    "fileExtension": ".md",
    "anchorPrefix": "",
    "indexFormat": "table",
    "indexPageTitle": "API Documentation",
    "expandParameters": false,
    "parametersFormat": "table",
    "propertiesFormat": "table",
    "typeDeclarationFormat": "table",
    "membersWithOwnFile": "all",
    "readmeFile": "README.md",
    "out": "$OUTPUT_DIR/markdown"
  }
}
EOF

    print_success "تم إنشاء ملف الإعداد: $config_file"
}

# --- إنشاء وثائق HTML ---
generate_html_docs() {
    print_header "إنشاء وثائق HTML"

    echo "إنشاء وثائق HTML تفاعلية..."
    typedoc \
        --entryPoints "$SOURCE_DIR" \
        --out "$OUTPUT_DIR/html" \
        --name "$PROJECT_NAME" \
        --includeVersion \
        --excludePrivate false \
        --excludeProtected false \
        --excludeExternals \
        --readme "README.md" \
        --theme default \
        --sort source-order \
        --cleanOutputDir \
        --categorizeByGroup \
        --defaultCategory "Other" \
        --categoryOrder "Components,Hooks,Services,Utils,Types,AI,Admin,Auth,Dashboard,Other" \
        --groupOrder "Classes,Interfaces,Enums,Functions,Variables,Type Aliases,Namespaces" \
        --exclude "$EXCLUDE_PATTERNS" \
        --externalPattern "**/node_modules/**" \
        --plugin typedoc-plugin-markdown \
        --plugin typedoc-plugin-no-inherit

    print_success "تم إنشاء وثائق HTML"
}

# --- إنشاء بيانات JSON ---
generate_json_docs() {
    print_header "إنشاء بيانات JSON"

    echo "إنشاء بيانات JSON للوثائق..."
    typedoc \
        --entryPoints "$SOURCE_DIR" \
        --json "$OUTPUT_DIR/json/docs.json" \
        --name "$PROJECT_NAME" \
        --includeVersion \
        --excludePrivate false \
        --excludeProtected false \
        --excludeExternals \
        --exclude "$EXCLUDE_PATTERNS" \
        --externalPattern "**/node_modules/**"

    print_success "تم إنشاء بيانات JSON"
}

# --- إنشاء وثائق Markdown ---
generate_markdown_docs() {
    print_header "إنشاء وثائق Markdown"

    echo "إنشاء وثائق Markdown..."
    typedoc \
        --entryPoints "$SOURCE_DIR" \
        --out "$OUTPUT_DIR/markdown" \
        --name "$PROJECT_NAME" \
        --includeVersion \
        --excludePrivate false \
        --excludeProtected false \
        --excludeExternals \
        --plugin typedoc-plugin-markdown \
        --plugin typedoc-plugin-no-inherit \
        --exclude "$EXCLUDE_PATTERNS" \
        --externalPattern "**/node_modules/**" \
        --markdown \
        --markdownGitRevision "main" \
        --markdownHidePageHeader false \
        --markdownHideBreadcrumbs false \
        --markdownHidePageTitle false \
        --markdownEntryDocument "index.md" \
        --markdownFileExtension ".md" \
        --markdownIndexFormat "table" \
        --markdownIndexPageTitle "API Documentation" \
        --markdownExpandParameters false \
        --markdownParametersFormat "table" \
        --markdownPropertiesFormat "table" \
        --markdownTypeDeclarationFormat "table" \
        --markdownMembersWithOwnFile "all" \
        --markdownReadmeFile "README.md"

    print_success "تم إنشاء وثائق Markdown"
}

# --- تحليل إحصائيات المشروع ---
analyze_project_stats() {
    print_header "تحليل إحصائيات المشروع"

    local stats_file="$OUTPUT_DIR/project_stats.json"

    # عد الملفات
    local total_files=$(find "$SOURCE_DIR" -name "*.ts" -o -name "*.tsx" | wc -l)
    local component_files=$(find "$SOURCE_DIR" -path "*/components/*" -name "*.tsx" | wc -l)
    local hook_files=$(find "$SOURCE_DIR" -path "*/hooks/*" -name "*.ts" | wc -l)
    local service_files=$(find "$SOURCE_DIR" -path "*/services/*" -name "*.ts" | wc -l)
    local util_files=$(find "$SOURCE_DIR" -path "*/lib/*" -name "*.ts" | wc -l)
    local ai_files=$(find "$SOURCE_DIR" -path "*/ai/*" -name "*.ts" | wc -l)

    # إنشاء ملف الإحصائيات
    cat > "$stats_file" << EOF
{
  "project": "$PROJECT_NAME",
  "generated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "statistics": {
    "total_files": $total_files,
    "components": $component_files,
    "hooks": $hook_files,
    "services": $service_files,
    "utils": $util_files,
    "ai_modules": $ai_files
  },
  "directories": {
    "source": "$SOURCE_DIR",
    "output_html": "$OUTPUT_DIR/html",
    "output_json": "$OUTPUT_DIR/json",
    "output_markdown": "$OUTPUT_DIR/markdown"
  }
}
EOF

    print_success "تم إنشاء ملف الإحصائيات: $stats_file"
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
    <title>وثائق TypeDoc - $PROJECT_NAME</title>
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
        .primary-link { background: #27ae60; color: white; padding: 15px 30px; border-radius: 5px; text-decoration: none; display: inline-block; margin: 10px 0; font-weight: bold; }
        .primary-link:hover { background: #229954; }
    </style>
</head>
<body>
    <div class="container">
        <h1>وثائق TypeDoc</h1>
        <p><strong>المشروع:</strong> $PROJECT_NAME</p>
        <p><strong>تاريخ الإنشاء:</strong> $(date '+%Y-%m-%d %H:%M:%S')</p>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">$(find "$SOURCE_DIR" -name "*.ts" -o -name "*.tsx" | wc -l)</div>
                <div class="stat-label">إجمالي الملفات</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$(find "$SOURCE_DIR" -path "*/components/*" -name "*.tsx" | wc -l)</div>
                <div class="stat-label">المكونات</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$(find "$SOURCE_DIR" -path "*/hooks/*" -name "*.ts" | wc -l)</div>
                <div class="stat-label">الـ Hooks</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$(find "$SOURCE_DIR" -path "*/services/*" -name "*.ts" | wc -l)</div>
                <div class="stat-label">الخدمات</div>
            </div>
        </div>

        <div class="section">
            <h2>الوثائق التفاعلية</h2>
            <a href="html/index.html" class="primary-link" target="_blank">فتح الوثائق التفاعلية</a>
            <p>الوثائق التفاعلية تحتوي على:</p>
            <ul>
                <li>تصفح جميع الفئات والواجهات</li>
                <li>بحث متقدم في الوثائق</li>
                <li>مخططات التوريث</li>
                <li>أمثلة على الاستخدام</li>
            </ul>
        </div>

        <div class="section">
            <h2>الوثائق بصيغة Markdown</h2>
            <ul class="file-list">
EOF

    # إضافة روابط لملفات Markdown
    for file in "$OUTPUT_DIR"/markdown/*.md; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo "                <li><a href=\"markdown/$filename\" target=\"_blank\">$filename</a></li>" >> "$report_file"
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
                <li>الوثائق التفاعلية هي الأفضل للتصفح والبحث</li>
                <li>ملفات Markdown مناسبة للقراءة والتعديل</li>
                <li>ملفات JSON تحتوي على البيانات الخام للبرمجة</li>
                <li>يتم تحديث الوثائق تلقائياً عند تشغيل السكريبت</li>
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
    print_header "بدء إنشاء وثائق TypeDoc"

    check_requirements
    setup_directories
    create_typedoc_config
    generate_html_docs
    generate_json_docs
    generate_markdown_docs
    analyze_project_stats
    generate_html_report

    print_header "انتهاء إنشاء الوثائق"
    print_success "تم إنشاء جميع الوثائق في: $OUTPUT_DIR"
    print_success "افتح التقرير: $OUTPUT_DIR/index.html"
    print_success "افتح الوثائق التفاعلية: $OUTPUT_DIR/html/index.html"

    # عرض إحصائيات سريعة
    echo ""
    echo "إحصائيات سريعة:"
    echo "- إجمالي الملفات: $(find "$SOURCE_DIR" -name "*.ts" -o -name "*.tsx" | wc -l)"
    echo "- المكونات: $(find "$SOURCE_DIR" -path "*/components/*" -name "*.tsx" | wc -l)"
    echo "- الـ Hooks: $(find "$SOURCE_DIR" -path "*/hooks/*" -name "*.ts" | wc -l)"
    echo "- الخدمات: $(find "$SOURCE_DIR" -path "*/services/*" -name "*.ts" | wc -l)"
}

# --- تشغيل السكريبت ---
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
