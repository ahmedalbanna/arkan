/**
 * أداة تحويل Proposal إلى Markdown
 * تحول كائن Proposal إلى نص Markdown منظم وسهل القراءة
 *
 * الميزات الجديدة:
 * - دالة عامة لتحويل أي هيكل بيانات
 * - مُنسقات مخصصة لكل نوع بيانات
 * - تحكم في العمق وعدد العناصر
 * - معالجة ذكية للقيم الفارغة والمعقدة
 */

/**
 * تحويل أي هيكل بيانات إلى Markdown مع خيارات متقدمة
 * @param data البيانات المراد تحويلها
 * @param title العنوان الرئيسي
 * @param options خيارات التحويل المتقدمة
 * @returns نص Markdown منظم
 */
export function convertAnyDataToMarkdown(
    data: any,
    title: string = 'البيانات',
    options: {
        maxDepth?: number;
        includeEmpty?: boolean;
        arrayLimit?: number;
        customFormatters?: Record<string, (value: any) => string>;
        priorityFields?: string[];
        skipFields?: string[];
        formatTables?: boolean;
        groupSimilar?: boolean;
    } = {}
): string {
    const {
        maxDepth = 5,
        includeEmpty = false,
        arrayLimit = 10,
        customFormatters = {},
        priorityFields = ['title', 'name', 'description', 'type', 'id', 'key'],
        skipFields = ['_id', '__v', 'createdAt', 'updatedAt'],
        formatTables = true,
        groupSimilar = true
    } = options;

    return objectToMarkdown(data, title, {
        maxDepth,
        includeEmpty,
        arrayLimit,
        customFormatters: {
            ...customFormatters,
            // إضافة مُنسقات افتراضية للجداول
            ...(formatTables ? {
                table: (tableData: any[]) => {
                    if (!Array.isArray(tableData) || tableData.length === 0) return '';

                    const headers = Object.keys(tableData[0] || {});
                    const headerRow = `| ${headers.join(' | ')} |`;
                    const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
                    const dataRows = tableData.map(row =>
                        `| ${headers.map(h => row[h] || '').join(' | ')} |`
                    );

                    return `\n${headerRow}\n${separatorRow}\n${dataRows.join('\n')}\n`;
                }
            } : {})
        }
    });
}



/**
 * دالة مساعدة لتحويل أي كائن إلى Markdown بسيط
 * @param obj الكائن المراد تحويله
 * @param title العنوان الرئيسي
 * @param options خيارات التحويل
 * @returns نص Markdown
 */
export function objectToMarkdown(
    obj: any,
    title: string = 'المعلومات',
    options: {
        maxDepth?: number;
        includeEmpty?: boolean;
        arrayLimit?: number;
        customFormatters?: Record<string, (value: any) => string>;
    } = {}
): string {
    if (!obj) return '';

    const {
        maxDepth = 5,
        includeEmpty = false,
        arrayLimit = 10,
        customFormatters = {}
    } = options;

    const sections: string[] = [];

    // إضافة العنوان الرئيسي
    if (title) {
        sections.push(`# ${title}\n`);
    }

    // دالة مساعدة للتحويل المتكرر
    function convertValue(value: any, key: string, depth: number = 0): string[] {
        const result: string[] = [];

        // التحقق من العمق الأقصى
        if (depth > maxDepth) {
            result.push(`*[تم قطع العرض بسبب العمق الأقصى]*`);
            return result;
        }

        // استخدام المُنسق المخصص إذا كان متوفراً
        if (customFormatters[key]) {
            result.push(customFormatters[key](value));
            return result;
        }

        // معالجة القيم الفارغة
        if (value === null || value === undefined) {
            if (includeEmpty) {
                result.push(`**${key}:** *غير محدد*`);
            }
            return result;
        }

        // معالجة المصفوفات
        if (Array.isArray(value)) {
            if (value.length === 0) {
                if (includeEmpty) {
                    result.push(`**${key}:** *قائمة فارغة*`);
                }
                return result;
            }

            result.push(`## ${key}\n`);

            // تحديد عدد العناصر المعروضة
            const itemsToShow = Math.min(value.length, arrayLimit);

            for (let i = 0; i < itemsToShow; i++) {
                const item = value[i];

                if (typeof item === 'object' && item !== null) {
                    // عنصر معقد - عرض كجدول أو قائمة مفردة
                    if (Object.keys(item).length <= 3) {
                        // عرض كجدول بسيط
                        result.push(`### ${i + 1}. ${item.title || item.name || `عنصر ${i + 1}`}\n`);
                        Object.entries(item).forEach(([subKey, subValue]) => {
                            if (subKey !== 'title' && subKey !== 'name' && subValue !== null && subValue !== undefined) {
                                result.push(`**${subKey}:** ${subValue}\n`);
                            }
                        });
                    } else {
                        // عرض كقائمة مفردة
                        result.push(`### ${i + 1}. ${item.title || item.name || `عنصر ${i + 1}`}\n`);
                        result.push(...convertValue(item, '', depth + 1));
                    }
                } else {
                    // عنصر بسيط
                    result.push(`- ${item}`);
                }
            }

            // إظهار رسالة إذا تم قطع العرض
            if (value.length > arrayLimit) {
                result.push(`\n*[تم عرض ${arrayLimit} من ${value.length} عنصر]*\n`);
            }

            result.push('');
            return result;
        }

        // معالجة الكائنات
        if (typeof value === 'object') {
            result.push(`## ${key}\n`);

            // ترتيب الخصائص حسب الأهمية
            const sortedEntries = Object.entries(value).sort(([a], [b]) => {
                const priority = ['title', 'name', 'description', 'type', 'id'];
                const aIndex = priority.indexOf(a);
                const bIndex = priority.indexOf(b);

                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                if (aIndex !== -1) return -1;
                if (bIndex !== -1) return 1;
                return a.localeCompare(b);
            });

            sortedEntries.forEach(([subKey, subValue]) => {
                if (subValue !== null && subValue !== undefined) {
                    if (typeof subValue === 'object' && !Array.isArray(subValue)) {
                        // كائن فرعي - عرض كقسم فرعي
                        result.push(`### ${subKey}\n`);
                        result.push(...convertValue(subValue, '', depth + 1));
                    } else if (Array.isArray(subValue)) {
                        // مصفوفة فرعية
                        result.push(...convertValue(subValue, subKey, depth + 1));
                    } else {
                        // قيمة بسيطة
                        result.push(`**${subKey}:** ${subValue}\n`);
                    }
                } else if (includeEmpty) {
                    result.push(`**${subKey}:** *غير محدد*\n`);
                }
            });

            result.push('');
            return result;
        }

        // معالجة القيم البسيطة
        if (typeof value === 'string' && value.length > 100) {
            // نص طويل - تقسيمه إلى فقرات
            result.push(`**${key}:**\n`);
            const paragraphs = value.split('\n').filter(p => p.trim());
            paragraphs.forEach(paragraph => {
                result.push(`${paragraph}\n`);
            });
        } else {
            result.push(`**${key}:** ${value}\n`);
        }

        return result;
    }

    // بدء التحويل
    if (typeof obj === 'object' && !Array.isArray(obj)) {
        Object.entries(obj).forEach(([key, value]) => {
            sections.push(...convertValue(value, key));
        });
    } else {
        sections.push(...convertValue(obj, ''));
    }

    return sections.join('\n');
}

/**
 * تحويل كائن Proposal إلى Markdown باستخدام الدالة العامة
 * @param proposal كائن Proposal
 * @returns نص Markdown منظم
 */
export function proposalToMarkdown(proposal: any): string {
    if (!proposal) return '';

    // استخدام المُنسقات المخصصة لـ Proposal
    const customFormatters: Record<string, (value: any) => string> = {
        technologies: (techs: any[]) => {
            if (!Array.isArray(techs)) return '';
            return `## التقنيات والأدوات\n${techs.map(tech =>
                `- **${tech.name}:** ${tech.description || tech.purpose || ''}`
            ).join('\n')}\n`;
        },
        timeline: (timeline: any[]) => {
            if (!Array.isArray(timeline)) return '';
            return `## الجدول الزمني التفصيلي\n| المرحلة | المدة | الوصف |\n|---------|--------|--------|\n${timeline.map(phase =>
                `| ${phase.name || 'مرحلة'} | ${phase.duration || 'غير محدد'} | ${phase.description || phase.name || ''} |`
            ).join('\n')}\n`;
        },
        budget: (budget: any) => {
            if (!budget) return '';
            let result = `## الميزانية\n**الميزانية الإجمالية:** ${budget.total || 'غير محدد'}\n`;
            if (budget.breakdown && Array.isArray(budget.breakdown)) {
                result += `\n### تفصيل الميزانية\n| البند | التكلفة |\n|-------|----------|\n${budget.breakdown.map((item: any) =>
                    `| ${item.item} | ${item.cost} |`
                ).join('\n')}\n`;
            }
            return result;
        },
        team: (team: any[]) => {
            if (!Array.isArray(team)) return '';
            return `## الفريق\n${team.map(member => {
                let result = `- **${member.name}** - ${member.role}`;
                if (member.responsibilities) result += `\n  - المسؤوليات: ${member.responsibilities}`;
                if (member.experience) result += `\n  - الخبرة: ${member.experience}`;
                return result;
            }).join('\n')}\n`;
        },
        risks: (risks: any[]) => {
            if (!Array.isArray(risks)) return '';
            return `## المخاطر والتحديات\n${risks.map(risk => {
                let result = `- **${risk.type || 'مخاطر'}:** ${risk.description}`;
                if (risk.mitigation) result += `\n  - التخفيف: ${risk.mitigation}`;
                return result;
            }).join('\n')}\n`;
        }
    };

    return objectToMarkdown(proposal, proposal.title || 'مقترح المشروع', {
        maxDepth: 4,
        includeEmpty: false,
        arrayLimit: 15,
        customFormatters
    });
}

/**
 * تحويل ProjectPlan إلى Markdown باستخدام الدالة العامة
 * @param plan كائن ProjectPlan
 * @returns نص Markdown منظم
 */
export function projectPlanToMarkdown(plan: any): string {
    if (!plan) return '';

    // استخدام المُنسقات المخصصة لـ ProjectPlan
    const customFormatters: Record<string, (value: any) => string> = {
        tasks: (tasks: any[]) => {
            if (!Array.isArray(tasks)) return '';
            return `## المهام\n${tasks.map((task, index) => {
                let result = `### ${index + 1}. ${task.title || `مهمة ${index + 1}`}\n`;
                if (task.description) result += `${task.description}\n`;
                if (task.duration) result += `**المدة:** ${task.duration}\n`;
                if (task.dependencies && Array.isArray(task.dependencies)) {
                    result += `**التبعيات:** ${task.dependencies.join(', ')}\n`;
                }
                return result;
            }).join('\n')}\n`;
        },
        resources: (resources: any[]) => {
            if (!Array.isArray(resources)) return '';
            return `## الموارد المطلوبة\n${resources.map(resource =>
                `- **${resource.type || 'مورد'}:** ${resource.description || resource.name}`
            ).join('\n')}\n`;
        }
    };

    return objectToMarkdown(plan, plan.title || 'خطة المشروع', {
        maxDepth: 3,
        includeEmpty: false,
        arrayLimit: 20,
        customFormatters
    });
}
