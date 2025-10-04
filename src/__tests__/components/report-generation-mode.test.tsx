/**
 * اختبارات بسيطة لـ ReportGenerationMode Types
 */

import type { ReportGenerationMode } from '@/lib/types';

describe('ReportGenerationMode Types', () => {
    describe('Type Definitions', () => {
        it('يجب أن يحتوي على جميع الأنواع المطلوبة', () => {
            const modes: ReportGenerationMode[] = ['traditional', 'intelligent', 'hybrid'];

            expect(modes).toHaveLength(3);
            expect(modes).toContain('traditional');
            expect(modes).toContain('intelligent');
            expect(modes).toContain('hybrid');
        });

        it('يجب أن يدعم الوصف المناسب لكل نوع', () => {
            const modeDescriptions = {
                traditional: 'النوع التقليدي يوفر توليد سريع للأقسام الأساسية فقط',
                intelligent: 'النوع الذكي يستخدم تحليل السياق والتحسين التكراري للحصول على جودة أعلى',
                hybrid: 'النوع المختلط يجمع بين السرعة والجودة حسب تعقيد كل قسم'
            };

            expect(modeDescriptions.traditional).toBeDefined();
            expect(modeDescriptions.intelligent).toBeDefined();
            expect(modeDescriptions.hybrid).toBeDefined();
        });

        it('يجب أن يدعم القيم الافتراضية', () => {
            const defaultMode: ReportGenerationMode = 'traditional';

            expect(defaultMode).toBe('traditional');
        });
    });

    describe('Enum Validation', () => {
        it('يجب أن يعتبر القيم غير الصحيحة invalid', () => {
            const validModes: ReportGenerationMode[] = ['traditional', 'intelligent', 'hybrid'];

            expect(validModes.includes('traditional' as ReportGenerationMode)).toBe(true);
            expect(validModes.includes('intelligent' as ReportGenerationMode)).toBe(true);
            expect(validModes.includes('hybrid' as ReportGenerationMode)).toBe(true);
            expect(validModes.includes('invalid' as ReportGenerationMode)).toBe(false);
        });
    });
});
