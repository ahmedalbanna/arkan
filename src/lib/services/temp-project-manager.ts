/**
 * مدير المشاريع المؤقتة
 *
 * هذا الملف يحتوي على منطق إدارة المشاريع المؤقتة
 * وتنظيفها تلقائياً
 */

import { adminDb } from '@/lib/firebase/server-init';

export interface TempProjectConfig {
    /** مدة انتهاء صلاحية المشروع المؤقت بالدقائق */
    expirationMinutes: number;
    /** الحد الأقصى لعدد المشاريع المؤقتة لكل مستخدم */
    maxTempProjectsPerUser: number;
    /** فاصل التنظيف التلقائي بالدقائق */
    cleanupIntervalMinutes: number;
}

const DEFAULT_CONFIG: TempProjectConfig = {
    expirationMinutes: 60, // ساعة واحدة
    maxTempProjectsPerUser: 5,
    cleanupIntervalMinutes: 30, // كل 30 دقيقة
};

class TempProjectManager {
    private config: TempProjectConfig;
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor(config: Partial<TempProjectConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.startCleanupScheduler();
    }

    /**
     * إنشاء مشروع مؤقت
     */
    async createTempProject(userId: string, projectData: any): Promise<string> {
        const tempProjectId = `temp-${Date.now()}`;
        const expirationTime = new Date(Date.now() + this.config.expirationMinutes * 60 * 1000);

        await adminDb.collection('projects').doc(tempProjectId).set({
            ...projectData,
            userId,
            isTemporary: true,
            createdAt: new Date().toISOString(),
            expiresAt: expirationTime.toISOString(),
        });

        // تنظيف المشاريع المؤقتة القديمة للمستخدم
        await this.cleanupUserTempProjects(userId);

        return tempProjectId;
    }

    /**
     * تحويل مشروع مؤقت إلى مشروع دائم
     */
    async convertToPermanent(tempProjectId: string, permanentProjectId?: string): Promise<string> {
        const projectDoc = await adminDb.collection('projects').doc(tempProjectId).get();

        if (!projectDoc.exists) {
            throw new Error('Temp project not found');
        }

        const projectData = projectDoc.data();
        if (!projectData?.isTemporary) {
            throw new Error('Project is not temporary');
        }

        const finalProjectId = permanentProjectId || `project-${Date.now()}`;

        // إنشاء المشروع الدائم
        await adminDb.collection('projects').doc(finalProjectId).set({
            ...projectData,
            isTemporary: false,
            createdAt: new Date().toISOString(),
            expiresAt: null,
        });

        // حذف المشروع المؤقت
        await adminDb.collection('projects').doc(tempProjectId).delete();

        return finalProjectId;
    }

    /**
     * التحقق من صحة المشروع المؤقت
     */
    async validateTempProject(projectId: string): Promise<boolean> {
        if (!projectId.startsWith('temp-')) {
            return true; // ليس مشروع مؤقت
        }

        const projectDoc = await adminDb.collection('projects').doc(projectId).get();

        if (!projectDoc.exists) {
            return false;
        }

        const projectData = projectDoc.data();
        if (!projectData?.isTemporary) {
            return true; // تم تحويله إلى دائم
        }

        const expiresAt = new Date(projectData.expiresAt);
        return expiresAt > new Date();
    }

    /**
     * تنظيف المشاريع المؤقتة المنتهية الصلاحية
     */
    async cleanupExpiredTempProjects(): Promise<number> {
        const now = new Date();
        const expiredProjects = await adminDb
            .collection('projects')
            .where('isTemporary', '==', true)
            .where('expiresAt', '<', now.toISOString())
            .get();

        const batch = adminDb.batch();
        expiredProjects.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        if (expiredProjects.docs.length > 0) {
            await batch.commit();
            console.log(`Cleaned up ${expiredProjects.docs.length} expired temp projects`);
        }

        return expiredProjects.docs.length;
    }

    /**
     * تنظيف المشاريع المؤقتة للمستخدم
     */
    private async cleanupUserTempProjects(userId: string): Promise<void> {
        const userTempProjects = await adminDb
            .collection('projects')
            .where('userId', '==', userId)
            .where('isTemporary', '==', true)
            .orderBy('createdAt', 'desc')
            .get();

        if (userTempProjects.docs.length <= this.config.maxTempProjectsPerUser) {
            return;
        }

        // حذف المشاريع الأقدم
        const projectsToDelete = userTempProjects.docs.slice(this.config.maxTempProjectsPerUser);
        const batch = adminDb.batch();

        projectsToDelete.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log(`Cleaned up ${projectsToDelete.length} old temp projects for user ${userId}`);
    }

    /**
     * بدء جدولة التنظيف التلقائي
     */
    private startCleanupScheduler(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        this.cleanupInterval = setInterval(async () => {
            try {
                await this.cleanupExpiredTempProjects();
            } catch (error) {
                console.error('Error during temp project cleanup:', error);
            }
        }, this.config.cleanupIntervalMinutes * 60 * 1000);
    }

    /**
     * إيقاف جدولة التنظيف
     */
    stopCleanupScheduler(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }

    /**
     * الحصول على إحصائيات المشاريع المؤقتة
     */
    async getTempProjectStats(): Promise<{
        totalTempProjects: number;
        expiredTempProjects: number;
        activeTempProjects: number;
    }> {
        const now = new Date();

        const [totalTempProjects, expiredTempProjects] = await Promise.all([
            adminDb.collection('projects').where('isTemporary', '==', true).get(),
            adminDb
                .collection('projects')
                .where('isTemporary', '==', true)
                .where('expiresAt', '<', now.toISOString())
                .get()
        ]);

        return {
            totalTempProjects: totalTempProjects.docs.length,
            expiredTempProjects: expiredTempProjects.docs.length,
            activeTempProjects: totalTempProjects.docs.length - expiredTempProjects.docs.length,
        };
    }
}

// إنشاء مثيل واحد للمدير
export const tempProjectManager = new TempProjectManager();

// تصدير الكلاس للاستخدام المخصص
export { TempProjectManager };
