# =============================================================================
# Master Analysis Script for PowerShell
# =============================================================================
# هذا السكريبت الرئيسي يشغل جميع أدوات التحليل على PowerShell
# المؤلف: Arkan Project Team
# التاريخ: $(Get-Date)
# =============================================================================

param(
    [string]$Choice = ""
)

# إعدادات المشروع
$PROJECT_NAME = "Arkan Project"
$SCRIPTS_DIR = "scripts"

# دوال مساعدة
function Write-Header {
    param([string]$Message)
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host $Message -ForegroundColor Blue
    Write-Host "========================================" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Cyan
}

function Write-Step {
    param([string]$Message)
    Write-Host "→ $Message" -ForegroundColor Magenta
}

# فحص المتطلبات
function Test-Requirements {
    Write-Header "فحص المتطلبات"

    $missingTools = @()
    $tools = @("ts-dependency-graph", "madge", "typedoc", "dot")

    foreach ($tool in $tools) {
        if (Get-Command $tool -ErrorAction SilentlyContinue) {
            Write-Success "$tool متوفر"
        } else {
            $missingTools += $tool
        }
    }

    if ($missingTools.Count -gt 0) {
        Write-Error "الأدوات التالية غير متوفرة:"
        foreach ($tool in $missingTools) {
            Write-Host "  - $tool"
        }
        Write-Host ""
        Write-Host "قم بتثبيت الأدوات المفقودة:"
        Write-Host "  npm install -g ts-dependency-graph madge typedoc"
        Write-Host "  # وثبت Graphviz حسب نظام التشغيل"
        return $false
    }

    Write-Success "جميع المتطلبات متوفرة"
    return $true
}

# عرض القائمة
function Show-Menu {
    Write-Host ""
    Write-Header "أدوات تحليل المشروع"
    Write-Host ""
    Write-Host "اختر التحليل المطلوب:"
    Write-Host ""
    Write-Host "1) تحليل شامل (موصى به)"
    Write-Host "2) تحليل ts-dependency-graph"
    Write-Host "3) تحليل Madge"
    Write-Host "4) إنشاء وثائق TypeDoc"
    Write-Host "5) إنشاء مخططات متعددة"
    Write-Host "6) تشغيل جميع الأدوات"
    Write-Host "7) عرض المساعدة"
    Write-Host "8) خروج"
    Write-Host ""
}

# تشغيل تحليل شامل
function Invoke-ComprehensiveAnalysis {
    Write-Header "تشغيل التحليل الشامل"

    if (Test-Path "$SCRIPTS_DIR\comprehensive-project-analyzer.sh") {
        Write-Step "تشغيل التحليل الشامل..."
        & bash "$SCRIPTS_DIR\comprehensive-project-analyzer.sh"
        Write-Success "تم التحليل الشامل"
    } else {
        Write-Error "سكريبت التحليل الشامل غير موجود"
    }
}

# تشغيل تحليل ts-dependency-graph
function Invoke-TsDependencyAnalysis {
    Write-Header "تشغيل تحليل ts-dependency-graph"

    if (Test-Path "$SCRIPTS_DIR\analyze-ts-dependencies.sh") {
        Write-Step "تشغيل تحليل ts-dependency-graph..."
        & bash "$SCRIPTS_DIR\analyze-ts-dependencies.sh"
        Write-Success "تم تحليل ts-dependency-graph"
    } else {
        Write-Error "سكريبت ts-dependency-graph غير موجود"
    }
}

# تشغيل تحليل Madge
function Invoke-MadgeAnalysis {
    Write-Header "تشغيل تحليل Madge"

    if (Test-Path "$SCRIPTS_DIR\analyze-madge-dependencies.sh") {
        Write-Step "تشغيل تحليل Madge..."
        & bash "$SCRIPTS_DIR\analyze-madge-dependencies.sh"
        Write-Success "تم تحليل Madge"
    } else {
        Write-Error "سكريبت Madge غير موجود"
    }
}

# تشغيل TypeDoc
function Invoke-TypeDocAnalysis {
    Write-Header "تشغيل TypeDoc"

    if (Test-Path "$SCRIPTS_DIR\generate-typedoc-docs.sh") {
        Write-Step "تشغيل TypeDoc..."
        & bash "$SCRIPTS_DIR\generate-typedoc-docs.sh"
        Write-Success "تم تشغيل TypeDoc"
    } else {
        Write-Error "سكريبت TypeDoc غير موجود"
    }
}

# تشغيل إنشاء المخططات
function Invoke-Visualizations {
    Write-Header "إنشاء المخططات المتعددة"

    if (Test-Path "$SCRIPTS_DIR\create-visualizations.sh") {
        Write-Step "إنشاء المخططات..."
        & bash "$SCRIPTS_DIR\create-visualizations.sh"
        Write-Success "تم إنشاء المخططات"
    } else {
        Write-Error "سكريبت المخططات غير موجود"
    }
}

# تشغيل جميع الأدوات
function Invoke-AllTools {
    Write-Header "تشغيل جميع الأدوات"

    $startTime = Get-Date

    Invoke-TsDependencyAnalysis
    Invoke-MadgeAnalysis
    Invoke-TypeDocAnalysis
    Invoke-Visualizations

    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds

    Write-Success "تم تشغيل جميع الأدوات في $duration ثانية"
}

# عرض المساعدة
function Show-Help {
    Write-Header "المساعدة"

    Write-Host @"
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
- Graphviz: choco install graphviz (Windows)

النتائج:
- docs/analysis/ts-dependencies/ - نتائج ts-dependency-graph
- docs/analysis/madge-dependencies/ - نتائج Madge
- docs/typedoc/ - وثائق TypeDoc
- docs/analysis/comprehensive/ - التحليل الشامل
- docs/visualizations/ - المخططات المتعددة

للمساعدة الإضافية، راجع ملف scripts/README.md
"@
}

# عرض النتائج
function Show-Results {
    Write-Header "النتائج المتاحة"

    Write-Host "يمكنك الوصول إلى النتائج من:"
    Write-Host ""

    if (Test-Path "docs\analysis\comprehensive") {
        Write-Host "📊 التحليل الشامل: docs\analysis\comprehensive\reports\comprehensive_report.html"
    }

    if (Test-Path "docs\analysis\ts-dependencies") {
        Write-Host "🔗 تحليل التبعيات: docs\analysis\ts-dependencies\index.html"
    }

    if (Test-Path "docs\analysis\madge-dependencies") {
        Write-Host "🔄 تحليل Madge: docs\analysis\madge-dependencies\index.html"
    }

    if (Test-Path "docs\typedoc") {
        Write-Host "📚 وثائق TypeDoc: docs\typedoc\index.html"
    }

    if (Test-Path "docs\visualizations") {
        Write-Host "🎨 المخططات المتعددة: docs\visualizations\index.html"
    }

    Write-Host ""
    Write-Host "افتح أي من هذه الملفات في المتصفح لعرض النتائج"
}

# الدالة الرئيسية
function Main {
    Write-Header "أدوات تحليل المشروع - $PROJECT_NAME"

    # فحص المتطلبات
    if (-not (Test-Requirements)) {
        Write-Error "يرجى تثبيت الأدوات المطلوبة أولاً"
        exit 1
    }

    # حلقة القائمة الرئيسية
    do {
        Show-Menu
        $choice = Read-Host "اختر رقم (1-8)"

        switch ($choice) {
            "1" {
                Invoke-ComprehensiveAnalysis
                Show-Results
            }
            "2" {
                Invoke-TsDependencyAnalysis
                Show-Results
            }
            "3" {
                Invoke-MadgeAnalysis
                Show-Results
            }
            "4" {
                Invoke-TypeDocAnalysis
                Show-Results
            }
            "5" {
                Invoke-Visualizations
                Show-Results
            }
            "6" {
                Invoke-AllTools
                Show-Results
            }
            "7" {
                Show-Help
            }
            "8" {
                Write-Success "شكراً لاستخدام أدوات التحليل!"
                exit 0
            }
            default {
                Write-Error "اختيار غير صحيح. يرجى اختيار رقم من 1-8"
            }
        }

        Write-Host ""
        Read-Host "اضغط Enter للمتابعة"
    } while ($true)
}

# تشغيل السكريبت
if ($MyInvocation.InvocationName -ne '.') {
    Main
}
