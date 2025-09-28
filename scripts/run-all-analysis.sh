#!/bin/bash

# =============================================================================
# Master Analysis Script
# =============================================================================
# هذا السكريبت الرئيسي يشغل جميع أدوات التحليل
# المؤلف: Arkan Project Team
# التاريخ: $(date +%Y-%m-%d)
# =============================================================================

set -e  # توقف عند أي خطأ

# --- إعدادات المشروع ---
PROJECT_NAME="Arkan Project"
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

# --- عرض القائمة ---
show_menu() {
    print_header "أدوات تحليل المشروع"
    echo ""
    echo "اختر التحليل المطلوب:"
    echo ""
    echo "1) تحليل شامل (موصى به)"
    echo "2) تحليل ts-dependency-graph"
    echo "3) تحليل Madge"
    echo "4) إنشاء وثائق TypeDoc"
    echo "5) إنشاء مخططات متعددة"
    echo "6) تشغيل جميع الأدوات"
    echo "7) عرض المساعدة"
    echo "8) خروج"
    echo ""
    echo -n "اختر رقم (1-8): "
}

# --- فحص المتطلبات ---
check_requirements() {
    print_header "فحص المتطلبات"

    local missing_tools=()

    # فحص الأدوات المطلوبة
    local tools=("ts-dependency-graph" "madge" "typedoc" "dot")

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
        return 1
    fi

    print_success "جميع المتطلبات متوفرة"
    return 0
}

# --- جعل السكريبتات قابلة للتنفيذ ---
make_scripts_executable() {
    print_header "جعل السكريبتات قابلة للتنفيذ"

    local scripts=(
        "analyze-ts-dependencies.sh"
        "analyze-madge-dependencies.sh"
        "generate-typedoc-docs.sh"
        "comprehensive-project-analyzer.sh"
        "create-visualizations.sh"
    )

    for script in "${scripts[@]}"; do
        if [ -f "$SCRIPTS_DIR/$script" ]; then
            chmod +x "$SCRIPTS_DIR/$script"
            print_success "تم جعل $script قابل للتنفيذ"
        else
            print_warning "السكريبت $script غير موجود"
        fi
    done
}

# --- تشغيل تحليل شامل ---
run_comprehensive_analysis() {
    print_header "تشغيل التحليل الشامل"

    if [ -f "$SCRIPTS_DIR/comprehensive-project-analyzer.sh" ]; then
        print_step "تشغيل التحليل الشامل..."
        "$SCRIPTS_DIR/comprehensive-project-analyzer.sh"
        print_success "تم التحليل الشامل"
    else
        print_error "سكريبت التحليل الشامل غير موجود"
    fi
}

# --- تشغيل تحليل ts-dependency-graph ---
run_ts_dependency_analysis() {
    print_header "تشغيل تحليل ts-dependency-graph"

    if [ -f "$SCRIPTS_DIR/analyze-ts-dependencies.sh" ]; then
        print_step "تشغيل تحليل ts-dependency-graph..."
        "$SCRIPTS_DIR/analyze-ts-dependencies.sh"
        print_success "تم تحليل ts-dependency-graph"
    else
        print_error "سكريبت ts-dependency-graph غير موجود"
    fi
}

# --- تشغيل تحليل Madge ---
run_madge_analysis() {
    print_header "تشغيل تحليل Madge"

    if [ -f "$SCRIPTS_DIR/analyze-madge-dependencies.sh" ]; then
        print_step "تشغيل تحليل Madge..."
        "$SCRIPTS_DIR/analyze-madge-dependencies.sh"
        print_success "تم تحليل Madge"
    else
        print_error "سكريبت Madge غير موجود"
    fi
}

# --- تشغيل TypeDoc ---
run_typedoc_analysis() {
    print_header "تشغيل TypeDoc"

    if [ -f "$SCRIPTS_DIR/generate-typedoc-docs.sh" ]; then
        print_step "تشغيل TypeDoc..."
        "$SCRIPTS_DIR/generate-typedoc-docs.sh"
        print_success "تم تشغيل TypeDoc"
    else
        print_error "سكريبت TypeDoc غير موجود"
    fi
}

# --- تشغيل إنشاء المخططات ---
run_visualizations() {
    print_header "إنشاء المخططات المتعددة"

    if [ -f "$SCRIPTS_DIR/create-visualizations.sh" ]; then
        print_step "إنشاء المخططات..."
        "$SCRIPTS_DIR/create-visualizations.sh"
        print_success "تم إنشاء المخططات"
    else
        print_error "سكريبت المخططات غير موجود"
    fi
}

# --- تشغيل جميع الأدوات ---
run_all_tools() {
    print_header "تشغيل جميع الأدوات"

    local start_time=$(date +%s)

    run_ts_dependency_analysis
    run_madge_analysis
    run_typedoc_analysis
    run_visualizations

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    print_success "تم تشغيل جميع الأدوات في ${duration} ثانية"
}

# --- عرض المساعدة ---
show_help() {
    print_header "المساعدة"

    cat << EOF
أدوات تحليل المشروع - $PROJECT_NAME

هذا السكريبت الرئيسي يوفر واجهة سهلة لتشغيل جميع أدوات التحليل.

الأدوات المتاحة:
1. التحليل الشامل - يجمع جميع الأدوات في تقرير واحد
2. ts-dependency-graph - مخططات تفاعلية لتبعيات TypeScript
3. Madge - تحليل التبعيات الدائرية والتبعيات الخارجية
4. TypeDoc - وثائق API تفاعلية شاملة
5. المخططات المتعددة - مخططات بصيغ متعددة (SVG, PNG, PDF, JPG, WebP)

المتطلبات:
- ts-dependency-graph: npm install -g ts-dependency-graph
- madge: npm install -g madge
- typedoc: npm install -g typedoc
- Graphviz: sudo apt-get install graphviz (Ubuntu/Debian)

النتائج:
- docs/analysis/ts-dependencies/ - نتائج ts-dependency-graph
- docs/analysis/madge-dependencies/ - نتائج Madge
- docs/typedoc/ - وثائق TypeDoc
- docs/analysis/comprehensive/ - التحليل الشامل
- docs/visualizations/ - المخططات المتعددة

للمساعدة الإضافية، راجع ملف scripts/README.md
EOF
}

# --- عرض النتائج ---
show_results() {
    print_header "النتائج المتاحة"

    echo "يمكنك الوصول إلى النتائج من:"
    echo ""

    if [ -d "docs/analysis/comprehensive" ]; then
        echo "📊 التحليل الشامل: docs/analysis/comprehensive/reports/comprehensive_report.html"
    fi

    if [ -d "docs/analysis/ts-dependencies" ]; then
        echo "🔗 تحليل التبعيات: docs/analysis/ts-dependencies/index.html"
    fi

    if [ -d "docs/analysis/madge-dependencies" ]; then
        echo "🔄 تحليل Madge: docs/analysis/madge-dependencies/index.html"
    fi

    if [ -d "docs/typedoc" ]; then
        echo "📚 وثائق TypeDoc: docs/typedoc/index.html"
    fi

    if [ -d "docs/visualizations" ]; then
        echo "🎨 المخططات المتعددة: docs/visualizations/index.html"
    fi

    echo ""
    echo "افتح أي من هذه الملفات في المتصفح لعرض النتائج"
}

# --- الدالة الرئيسية ---
main() {
    print_header "أدوات تحليل المشروع - $PROJECT_NAME"

    # فحص المتطلبات
    if ! check_requirements; then
        print_error "يرجى تثبيت الأدوات المطلوبة أولاً"
        exit 1
    fi

    # جعل السكريبتات قابلة للتنفيذ
    make_scripts_executable

    # حلقة القائمة الرئيسية
    while true; do
        echo ""
        show_menu
        read -r choice

        case $choice in
            1)
                run_comprehensive_analysis
                show_results
                ;;
            2)
                run_ts_dependency_analysis
                show_results
                ;;
            3)
                run_madge_analysis
                show_results
                ;;
            4)
                run_typedoc_analysis
                show_results
                ;;
            5)
                run_visualizations
                show_results
                ;;
            6)
                run_all_tools
                show_results
                ;;
            7)
                show_help
                ;;
            8)
                print_success "شكراً لاستخدام أدوات التحليل!"
                exit 0
                ;;
            *)
                print_error "اختيار غير صحيح. يرجى اختيار رقم من 1-8"
                ;;
        esac

        echo ""
        echo -n "اضغط Enter للمتابعة..."
        read -r
    done
}

# --- تشغيل السكريبت ---
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
