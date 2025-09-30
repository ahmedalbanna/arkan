/**
 * محلل حجم الحزم
 *
 * هذا الملف يحتوي على أدوات تحليل حجم الحزم
 * وتحسين الأداء
 */

/**
 * إحصائيات الحزمة
 */
export interface BundleStats {
    /** حجم الحزمة الإجمالي */
    totalSize: number;
    /** حجم الحزمة المضغوطة */
    gzippedSize: number;
    /** عدد الملفات */
    fileCount: number;
    /** أكبر الملفات */
    largestFiles: Array<{
        name: string;
        size: number;
        percentage: number;
    }>;
    /** الملفات المكررة */
    duplicateFiles: Array<{
        name: string;
        count: number;
        totalSize: number;
    }>;
    /** الملفات غير المستخدمة */
    unusedFiles: string[];
    /** تحليل الاستيرادات */
    importAnalysis: {
        totalImports: number;
        externalImports: number;
        internalImports: number;
        unusedImports: number;
    };
}

/**
 * تحليل حجم الحزمة
 */
export class BundleAnalyzer {
    /**
     * تحليل حجم الحزمة
     */
    static analyzeBundle(files: Array<{ name: string; size: number; content: string }>): BundleStats {
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        const gzippedSize = this.estimateGzippedSize(files);

        // تحليل أكبر الملفات
        const largestFiles = files
            .sort((a, b) => b.size - a.size)
            .slice(0, 10)
            .map(file => ({
                name: file.name,
                size: file.size,
                percentage: (file.size / totalSize) * 100,
            }));

        // تحليل الملفات المكررة
        const duplicateFiles = this.findDuplicateFiles(files);

        // تحليل الملفات غير المستخدمة
        const unusedFiles = this.findUnusedFiles(files);

        // تحليل الاستيرادات
        const importAnalysis = this.analyzeImports(files);

        return {
            totalSize,
            gzippedSize,
            fileCount: files.length,
            largestFiles,
            duplicateFiles,
            unusedFiles,
            importAnalysis,
        };
    }

    /**
     * تقدير الحجم المضغوط
     */
    private static estimateGzippedSize(files: Array<{ size: number }>): number {
        // تقدير تقريبي: 30% من الحجم الأصلي
        return Math.round(files.reduce((sum, file) => sum + file.size, 0) * 0.3);
    }

    /**
     * البحث عن الملفات المكررة
     */
    private static findDuplicateFiles(files: Array<{ name: string; size: number; content: string }>): Array<{
        name: string;
        count: number;
        totalSize: number;
    }> {
        const contentMap = new Map<string, string[]>();

        files.forEach(file => {
            if (!contentMap.has(file.content)) {
                contentMap.set(file.content, []);
            }
            contentMap.get(file.content)!.push(file.name);
        });

        return Array.from(contentMap.entries())
            .filter(([_, names]) => names.length > 1)
            .map(([content, names]) => ({
                name: names[0],
                count: names.length,
                totalSize: content.length * names.length,
            }));
    }

    /**
     * البحث عن الملفات غير المستخدمة
     */
    private static findUnusedFiles(files: Array<{ name: string; content: string }>): string[] {
        const unusedFiles: string[] = [];
        const allImports = new Set<string>();

        // جمع جميع الاستيرادات
        files.forEach(file => {
            const imports = this.extractImports(file.content);
            imports.forEach(imp => allImports.add(imp));
        });

        // البحث عن الملفات غير المستخدمة
        files.forEach(file => {
            const fileName = file.name.replace(/\.(ts|tsx|js|jsx)$/, '');
            if (!allImports.has(fileName) && !this.isEntryFile(file.name)) {
                unusedFiles.push(file.name);
            }
        });

        return unusedFiles;
    }

    /**
     * تحليل الاستيرادات
     */
    private static analyzeImports(files: Array<{ content: string }>): {
        totalImports: number;
        externalImports: number;
        internalImports: number;
        unusedImports: number;
    } {
        let totalImports = 0;
        let externalImports = 0;
        let internalImports = 0;
        let unusedImports = 0;

        files.forEach(file => {
            const imports = this.extractImports(file.content);
            totalImports += imports.length;

            imports.forEach(imp => {
                if (imp.startsWith('@/') || imp.startsWith('./') || imp.startsWith('../')) {
                    internalImports++;
                } else {
                    externalImports++;
                }
            });
        });

        return {
            totalImports,
            externalImports,
            internalImports,
            unusedImports: 0, // TODO: تنفيذ تحليل الاستيرادات غير المستخدمة
        };
    }

    /**
     * استخراج الاستيرادات من المحتوى
     */
    private static extractImports(content: string): string[] {
        const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
        const imports: string[] = [];
        let match;

        while ((match = importRegex.exec(content)) !== null) {
            imports.push(match[1]);
        }

        return imports;
    }

    /**
     * التحقق من كون الملف ملف دخول
     */
    private static isEntryFile(fileName: string): boolean {
        const entryFiles = ['index.ts', 'index.tsx', 'index.js', 'index.jsx', 'app.tsx', 'page.tsx'];
        return entryFiles.some(entry => fileName.endsWith(entry));
    }

    /**
     * اقتراحات التحسين
     */
    static getOptimizationSuggestions(stats: BundleStats): string[] {
        const suggestions: string[] = [];

        if (stats.totalSize > 1000000) { // 1MB
            suggestions.push('الحزمة كبيرة جداً (>1MB). فكر في تقسيم الكود إلى حزم أصغر');
        }

        if (stats.gzippedSize > 300000) { // 300KB
            suggestions.push('الحزمة المضغوطة كبيرة (>300KB). فكر في تحسين الكود');
        }

        if (stats.largestFiles[0]?.percentage > 20) {
            suggestions.push(`الملف ${stats.largestFiles[0].name} يشكل ${stats.largestFiles[0].percentage.toFixed(1)}% من الحزمة. فكر في تقسيمه`);
        }

        if (stats.duplicateFiles.length > 0) {
            suggestions.push(`تم العثور على ${stats.duplicateFiles.length} ملف مكرر. فكر في إزالة التكرار`);
        }

        if (stats.unusedFiles.length > 0) {
            suggestions.push(`تم العثور على ${stats.unusedFiles.length} ملف غير مستخدم. فكر في إزالته`);
        }

        if (stats.importAnalysis.externalImports > stats.importAnalysis.internalImports * 2) {
            suggestions.push('عدد الاستيرادات الخارجية كبير. فكر في تحسين الاستيرادات');
        }

        return suggestions;
    }

    /**
     * إنشاء تقرير مفصل
     */
    static generateReport(stats: BundleStats): string {
        const suggestions = this.getOptimizationSuggestions(stats);

        return `
# تقرير تحليل الحزمة

## الإحصائيات العامة
- **الحجم الإجمالي**: ${(stats.totalSize / 1024).toFixed(2)} KB
- **الحجم المضغوط**: ${(stats.gzippedSize / 1024).toFixed(2)} KB
- **عدد الملفات**: ${stats.fileCount}
- **نسبة الضغط**: ${((1 - stats.gzippedSize / stats.totalSize) * 100).toFixed(1)}%

## أكبر الملفات
${stats.largestFiles.map(file =>
            `- ${file.name}: ${(file.size / 1024).toFixed(2)} KB (${file.percentage.toFixed(1)}%)`
        ).join('\n')}

## الملفات المكررة
${stats.duplicateFiles.length > 0 ?
                stats.duplicateFiles.map(file =>
                    `- ${file.name}: ${file.count} نسخة (${(file.totalSize / 1024).toFixed(2)} KB)`
                ).join('\n') :
                'لا توجد ملفات مكررة'
            }

## الملفات غير المستخدمة
${stats.unusedFiles.length > 0 ?
                stats.unusedFiles.map(file => `- ${file}`).join('\n') :
                'لا توجد ملفات غير مستخدمة'
            }

## تحليل الاستيرادات
- **إجمالي الاستيرادات**: ${stats.importAnalysis.totalImports}
- **الاستيرادات الخارجية**: ${stats.importAnalysis.externalImports}
- **الاستيرادات الداخلية**: ${stats.importAnalysis.internalImports}
- **الاستيرادات غير المستخدمة**: ${stats.importAnalysis.unusedImports}

## اقتراحات التحسين
${suggestions.map(suggestion => `- ${suggestion}`).join('\n')}
    `.trim();
    }
}
