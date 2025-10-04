#!/usr/bin/env node

/**
 * أداة توليد التوثيق التلقائي للمكونات
 * تقوم بمسح مكونات React وإنشاء توثيق تلقائي لها
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// إعدادات الأداة
const CONFIG = {
    componentsDir: 'src/components',
    docsDir: 'docs/components',
    templateDir: 'scripts/templates',
    excludePatterns: [
        '**/*.test.*',
        '**/*.spec.*',
        '**/index.*',
        '**/types.*',
    ],
};

/**
 * مسح مجلد المكونات واستخراج المعلومات
 */
function scanComponents() {
    const components = [];
    const scanDir = (dir, relativePath = '') => {
        const items = fs.readdirSync(dir);

        for (const item of items) {
            const fullPath = path.join(dir, item);
            const relativeItemPath = path.join(relativePath, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                scanDir(fullPath, relativeItemPath);
            } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
                // تخطي الملفات المستبعدة
                if (CONFIG.excludePatterns.some(pattern =>
                    relativeItemPath.includes(pattern.replace('**/', '').replace('*', ''))
                )) {
                    continue;
                }

                const componentInfo = extractComponentInfo(fullPath, relativeItemPath);
                if (componentInfo) {
                    components.push(componentInfo);
                }
            }
        }
    };

    scanDir(CONFIG.componentsDir);
    return components;
}

/**
 * استخراج معلومات المكون من الملف
 */
function extractComponentInfo(filePath, relativePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');

        // البحث عن تعريف المكون
        const componentMatch = content.match(/(?:export\s+)?(?:const|function)\s+(\w+).*?[:=]\s*(?:React\.)?FC<([^>]+)>/);
        if (!componentMatch) return null;

        const componentName = componentMatch[1];
        const propsType = componentMatch[2];

        // استخراج التعليقات JSDoc
        const jsdocMatch = content.match(/\/\*\*[\s\S]*?\*\//);
        const jsdoc = jsdocMatch ? jsdocMatch[0] : '';

        // استخراج الواردات
        const imports = content.match(/import.*?from\s+['"]([^'"]+)['"]/g) || [];

        // استخراج الاستخدامات
        const usages = content.match(/<(\w+)[^>]*>/g) || [];

        return {
            name: componentName,
            filePath: relativePath,
            fullPath: filePath,
            propsType,
            jsdoc,
            imports: imports.map(imp => imp.trim()),
            usages: usages.map(usage => usage.trim()),
            content: content.substring(0, 500) + '...', // أول 500 حرف
        };
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return null;
    }
}

/**
 * إنشاء توثيق المكون
 */
function generateComponentDoc(component) {
    const template = `
# ${component.name}

## نظرة عامة
${component.jsdoc ? component.jsdoc.replace(/\/\*\*|\*\//g, '').trim() : 'مكون React بدون توثيق.'}

## الاستخدام
\`\`\`tsx
import { ${component.name} } from '@/components/${component.filePath.replace('.tsx', '').replace('.ts', '')}';

<${component.name} />
\`\`\`

## الخصائص (Props)
\`\`\`typescript
${component.propsType}
\`\`\`

## الواردات
\`\`\`typescript
${component.imports.join('\n')}
\`\`\`

## الاستخدامات
\`\`\`tsx
${component.usages.join('\n')}
\`\`\`

## الكود المصدري
\`\`\`typescript
${component.content}
\`\`\`

---
*تم إنشاء هذا التوثيق تلقائياً بواسطة أداة التوثيق*
`;

    return template;
}

/**
 * إنشاء فهرس المكونات
 */
function generateComponentsIndex(components) {
    const categories = {};

    // تصنيف المكونات حسب المجلد
    components.forEach(component => {
        const category = component.filePath.split('/')[0] || 'other';
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(component);
    });

    let indexContent = `# مكتبة المكونات - Arkan

## نظرة عامة
هذه المكتبة تحتوي على جميع مكونات React المستخدمة في مشروع Arkan.

## إحصائيات
- **إجمالي المكونات**: ${components.length}
- **الفئات**: ${Object.keys(categories).length}

## الفئات

`;

    Object.entries(categories).forEach(([category, categoryComponents]) => {
        indexContent += `### ${category.toUpperCase()}\n\n`;
        categoryComponents.forEach(component => {
            indexContent += `- [${component.name}](./${category}/${component.name}.md)\n`;
        });
        indexContent += '\n';
    });

    return indexContent;
}

/**
 * إنشاء ملفات التوثيق
 */
function generateDocs() {
    console.log('🔍 مسح المكونات...');
    const components = scanComponents();

    if (components.length === 0) {
        console.log('❌ لم يتم العثور على مكونات');
        return;
    }

    console.log(`✅ تم العثور على ${components.length} مكون`);

    // إنشاء مجلد التوثيق
    if (!fs.existsSync(CONFIG.docsDir)) {
        fs.mkdirSync(CONFIG.docsDir, { recursive: true });
    }

    // إنشاء فهرس المكونات
    const indexContent = generateComponentsIndex(components);
    fs.writeFileSync(path.join(CONFIG.docsDir, 'README.md'), indexContent);

    // إنشاء توثيق لكل مكون
    const categories = {};
    components.forEach(component => {
        const category = component.filePath.split('/')[0] || 'other';
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(component);
    });

    Object.entries(categories).forEach(([category, categoryComponents]) => {
        const categoryDir = path.join(CONFIG.docsDir, category);
        if (!fs.existsSync(categoryDir)) {
            fs.mkdirSync(categoryDir, { recursive: true });
        }

        categoryComponents.forEach(component => {
            const docContent = generateComponentDoc(component);
            const docPath = path.join(categoryDir, `${component.name}.md`);
            fs.writeFileSync(docPath, docContent);
        });
    });

    console.log('✅ تم إنشاء التوثيق بنجاح');
    console.log(`📁 الموقع: ${CONFIG.docsDir}`);
}

/**
 * تحديث التوثيق الموجود
 */
function updateDocs() {
    console.log('🔄 تحديث التوثيق...');
    generateDocs();
    console.log('✅ تم تحديث التوثيق');
}

/**
 * مسح التوثيق القديم
 */
function cleanDocs() {
    console.log('🧹 مسح التوثيق القديم...');
    if (fs.existsSync(CONFIG.docsDir)) {
        fs.rmSync(CONFIG.docsDir, { recursive: true });
    }
    console.log('✅ تم مسح التوثيق القديم');
}

/**
 * تشغيل الأداة
 */
function main() {
    const command = process.argv[2] || 'generate';

    switch (command) {
        case 'generate':
            generateDocs();
            break;
        case 'update':
            updateDocs();
            break;
        case 'clean':
            cleanDocs();
            break;
        default:
            console.log(`
استخدام: node generate-component-docs.js [command]

الأوامر المتاحة:
  generate  - إنشاء توثيق جديد (افتراضي)
  update    - تحديث التوثيق الموجود
  clean     - مسح التوثيق القديم

أمثلة:
  node generate-component-docs.js generate
  node generate-component-docs.js update
  node generate-component-docs.js clean
      `);
    }
}

// تشغيل الأداة
if (require.main === module) {
    main();
}

module.exports = {
    scanComponents,
    extractComponentInfo,
    generateComponentDoc,
    generateComponentsIndex,
    generateDocs,
    updateDocs,
    cleanDocs,
};
