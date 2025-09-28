@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM =============================================================================
REM Master Analysis Script for Windows
REM =============================================================================
REM هذا السكريبت الرئيسي يشغل جميع أدوات التحليل على Windows
REM المؤلف: Arkan Project Team
REM التاريخ: %date%
REM =============================================================================

set "PROJECT_NAME=Arkan Project"
set "SCRIPTS_DIR=scripts"

:main
cls
echo.
echo ========================================
echo أدوات تحليل المشروع - %PROJECT_NAME%
echo ========================================
echo.

:menu
echo اختر التحليل المطلوب:
echo.
echo 1) تحليل شامل (موصى به)
echo 2) تحليل ts-dependency-graph
echo 3) تحليل Madge
echo 4) إنشاء وثائق TypeDoc
echo 5) إنشاء مخططات متعددة
echo 6) تشغيل جميع الأدوات
echo 7) عرض المساعدة
echo 8) خروج
echo.
set /p choice="اختر رقم (1-8): "

if "%choice%"=="1" goto comprehensive
if "%choice%"=="2" goto ts_dependency
if "%choice%"=="3" goto madge
if "%choice%"=="4" goto typedoc
if "%choice%"=="5" goto visualizations
if "%choice%"=="6" goto all_tools
if "%choice%"=="7" goto help
if "%choice%"=="8" goto exit
goto invalid

:comprehensive
echo.
echo ========================================
echo تشغيل التحليل الشامل
echo ========================================
echo.
if exist "%SCRIPTS_DIR%\comprehensive-project-analyzer.sh" (
    echo تشغيل التحليل الشامل...
    bash "%SCRIPTS_DIR%\comprehensive-project-analyzer.sh"
    echo ✓ تم التحليل الشامل
) else (
    echo ✗ سكريبت التحليل الشامل غير موجود
)
goto show_results

:ts_dependency
echo.
echo ========================================
echo تشغيل تحليل ts-dependency-graph
echo ========================================
echo.
if exist "%SCRIPTS_DIR%\analyze-ts-dependencies.sh" (
    echo تشغيل تحليل ts-dependency-graph...
    bash "%SCRIPTS_DIR%\analyze-ts-dependencies.sh"
    echo ✓ تم تحليل ts-dependency-graph
) else (
    echo ✗ سكريبت ts-dependency-graph غير موجود
)
goto show_results

:madge
echo.
echo ========================================
echo تشغيل تحليل Madge
echo ========================================
echo.
if exist "%SCRIPTS_DIR%\analyze-madge-dependencies.sh" (
    echo تشغيل تحليل Madge...
    bash "%SCRIPTS_DIR%\analyze-madge-dependencies.sh"
    echo ✓ تم تحليل Madge
) else (
    echo ✗ سكريبت Madge غير موجود
)
goto show_results

:typedoc
echo.
echo ========================================
echo تشغيل TypeDoc
echo ========================================
echo.
if exist "%SCRIPTS_DIR%\generate-typedoc-docs.sh" (
    echo تشغيل TypeDoc...
    bash "%SCRIPTS_DIR%\generate-typedoc-docs.sh"
    echo ✓ تم تشغيل TypeDoc
) else (
    echo ✗ سكريبت TypeDoc غير موجود
)
goto show_results

:visualizations
echo.
echo ========================================
echo إنشاء المخططات المتعددة
echo ========================================
echo.
if exist "%SCRIPTS_DIR%\create-visualizations.sh" (
    echo إنشاء المخططات...
    bash "%SCRIPTS_DIR%\create-visualizations.sh"
    echo ✓ تم إنشاء المخططات
) else (
    echo ✗ سكريبت المخططات غير موجود
)
goto show_results

:all_tools
echo.
echo ========================================
echo تشغيل جميع الأدوات
echo ========================================
echo.
set start_time=%time%
call :ts_dependency
call :madge
call :typedoc
call :visualizations
set end_time=%time%
echo ✓ تم تشغيل جميع الأدوات
goto show_results

:help
echo.
echo ========================================
echo المساعدة
echo ========================================
echo.
echo أدوات تحليل المشروع - %PROJECT_NAME%
echo.
echo هذا السكريبت الرئيسي يوفر واجهة سهلة لتشغيل جميع أدوات التحليل.
echo.
echo الأدوات المتاحة:
echo 1. التحليل الشامل - يجمع جميع الأدوات في تقرير واحد
echo 2. ts-dependency-graph - مخططات تفاعلية لتبعيات TypeScript
echo 3. Madge - تحليل التبعيات الدائرية والتبعيات الخارجية
echo 4. TypeDoc - وثائق API تفاعلية شاملة
echo 5. المخططات المتعددة - مخططات بصيغ متعددة (SVG, PNG, PDF, JPG, WebP)
echo.
echo المتطلبات:
echo - ts-dependency-graph: npm install -g ts-dependency-graph
echo - madge: npm install -g madge
echo - typedoc: npm install -g typedoc
echo - Graphviz: choco install graphviz (Windows)
echo - Bash: Git Bash أو WSL
echo.
echo النتائج:
echo - docs/analysis/ts-dependencies/ - نتائج ts-dependency-graph
echo - docs/analysis/madge-dependencies/ - نتائج Madge
echo - docs/typedoc/ - وثائق TypeDoc
echo - docs/analysis/comprehensive/ - التحليل الشامل
echo - docs/visualizations/ - المخططات المتعددة
echo.
echo للمساعدة الإضافية، راجع ملف scripts/README.md
goto pause

:show_results
echo.
echo ========================================
echo النتائج المتاحة
echo ========================================
echo.
echo يمكنك الوصول إلى النتائج من:
echo.

if exist "docs\analysis\comprehensive" (
    echo 📊 التحليل الشامل: docs\analysis\comprehensive\reports\comprehensive_report.html
)

if exist "docs\analysis\ts-dependencies" (
    echo 🔗 تحليل التبعيات: docs\analysis\ts-dependencies\index.html
)

if exist "docs\analysis\madge-dependencies" (
    echo 🔄 تحليل Madge: docs\analysis\madge-dependencies\index.html
)

if exist "docs\typedoc" (
    echo 📚 وثائق TypeDoc: docs\typedoc\index.html
)

if exist "docs\visualizations" (
    echo 🎨 المخططات المتعددة: docs\visualizations\index.html
)

echo.
echo افتح أي من هذه الملفات في المتصفح لعرض النتائج
goto pause

:invalid
echo.
echo ✗ اختيار غير صحيح. يرجى اختيار رقم من 1-8
goto pause

:pause
echo.
pause
goto menu

:exit
echo.
echo ✓ شكراً لاستخدام أدوات التحليل!
pause
exit /b 0
