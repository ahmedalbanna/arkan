/**
 * مدير الحفظ المؤقت في المتصفح
 *
 * هذا الملف يحتوي على منطق إدارة البيانات المؤقتة في localStorage
 * بدلاً من المشاريع المؤقتة في الخادم
 */

import type { ProjectProperties, SavedProject } from '@/lib/models/project';
import { Project } from '@/lib/models/project';

export interface BrowserCacheConfig {
    /** مدة انتهاء صلاحية البيانات المؤقتة بالدقائق */
    expirationMinutes: number;
    /** الحد الأقصى لعدد المشاريع المؤقتة في المتصفح */
    maxCachedProjects: number;
    /** مفتاح التخزين في localStorage */
    storageKey: string;
}

const DEFAULT_CONFIG: BrowserCacheConfig = {
    expirationMinutes: 1440, // 24 ساعة
    maxCachedProjects: 5,
    storageKey: 'arkan-temp-projects'
};

interface CachedProject {
    id: string;
    data: SavedProject;
    timestamp: number;
    expiresAt: number;
}

class BrowserCacheManager {
    private config: BrowserCacheConfig;

    constructor(config: Partial<BrowserCacheConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * حفظ مشروع مؤقت في المتصفح
     */
    saveTempProject(project: Project): void {
        try {
            const cachedProjects = this.getCachedProjects();
            const projectData = project.toJSON();

            const cachedProject: CachedProject = {
                id: project.id,
                data: projectData,
                timestamp: Date.now(),
                expiresAt: Date.now() + (this.config.expirationMinutes * 60 * 1000)
            };

            // إضافة المشروع الجديد
            cachedProjects[project.id] = cachedProject;

            // تنظيف المشاريع المنتهية الصلاحية
            this.cleanupExpiredProjects(cachedProjects);

            // حفظ في localStorage
            localStorage.setItem(this.config.storageKey, JSON.stringify(cachedProjects));

            console.log(`Project ${project.id} cached in browser`);
        } catch (error) {
            console.error('Error saving temp project to browser cache:', error);
        }
    }

    /**
     * جلب مشروع مؤقت من المتصفح
     */
    getTempProject(projectId: string): Project | null {
        try {
            const cachedProjects = this.getCachedProjects();
            const cachedProject = cachedProjects[projectId];

            if (!cachedProject) {
                return null;
            }

            // التحقق من انتهاء الصلاحية
            if (Date.now() > cachedProject.expiresAt) {
                this.removeTempProject(projectId);
                return null;
            }

            return new Project(cachedProject.data as ProjectProperties);
        } catch (error) {
            console.error('Error getting temp project from browser cache:', error);
            return null;
        }
    }

    /**
     * حذف مشروع مؤقت من المتصفح
     */
    removeTempProject(projectId: string): void {
        try {
            const cachedProjects = this.getCachedProjects();
            delete cachedProjects[projectId];
            localStorage.setItem(this.config.storageKey, JSON.stringify(cachedProjects));
        } catch (error) {
            console.error('Error removing temp project from browser cache:', error);
        }
    }

    /**
     * التحقق من وجود مشروع مؤقت في المتصفح
     */
    hasTempProject(projectId: string): boolean {
        try {
            const cachedProjects = this.getCachedProjects();
            const cachedProject = cachedProjects[projectId];

            if (!cachedProject) {
                return false;
            }

            // التحقق من انتهاء الصلاحية
            if (Date.now() > cachedProject.expiresAt) {
                this.removeTempProject(projectId);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error checking temp project in browser cache:', error);
            return false;
        }
    }

    /**
     * جلب جميع المشاريع المؤقتة من المتصفح
     */
    getAllTempProjects(): Project[] {
        try {
            const cachedProjects = this.getCachedProjects();
            const projects: Project[] = [];

            for (const [projectId, cachedProject] of Object.entries(cachedProjects)) {
                if (Date.now() <= cachedProject.expiresAt) {
                    projects.push(new Project(cachedProject.data as ProjectProperties));
                } else {
                    // حذف المشاريع المنتهية الصلاحية
                    delete cachedProjects[projectId];
                }
            }

            // حفظ التحديثات
            if (Object.keys(cachedProjects).length !== Object.keys(this.getCachedProjects()).length) {
                localStorage.setItem(this.config.storageKey, JSON.stringify(cachedProjects));
            }

            return projects;
        } catch (error) {
            console.error('Error getting all temp projects from browser cache:', error);
            return [];
        }
    }

    /**
     * تنظيف جميع المشاريع المؤقتة من المتصفح
     */
    clearAllTempProjects(): void {
        try {
            localStorage.removeItem(this.config.storageKey);
            console.log('All temp projects cleared from browser cache');
        } catch (error) {
            console.error('Error clearing all temp projects from browser cache:', error);
        }
    }

    /**
     * تنظيف المشاريع المنتهية الصلاحية
     */
    private cleanupExpiredProjects(cachedProjects: Record<string, CachedProject>): void {
        const now = Date.now();
        const expiredIds: string[] = [];

        for (const [projectId, cachedProject] of Object.entries(cachedProjects)) {
            if (now > cachedProject.expiresAt) {
                expiredIds.push(projectId);
            }
        }

        // حذف المشاريع المنتهية الصلاحية
        expiredIds.forEach(projectId => {
            delete cachedProjects[projectId];
        });

        // التحقق من الحد الأقصى للمشاريع
        const projectIds = Object.keys(cachedProjects);
        if (projectIds.length > this.config.maxCachedProjects) {
            // ترتيب المشاريع حسب التاريخ (الأقدم أولاً)
            const sortedProjects = projectIds
                .map(id => ({ id, timestamp: cachedProjects[id].timestamp }))
                .sort((a, b) => a.timestamp - b.timestamp);

            // حذف المشاريع الأقدم
            const projectsToRemove = sortedProjects.slice(0, projectIds.length - this.config.maxCachedProjects);
            projectsToRemove.forEach(({ id }) => {
                delete cachedProjects[id];
            });
        }
    }

    /**
     * جلب المشاريع المؤقتة من localStorage
     */
    private getCachedProjects(): Record<string, CachedProject> {
        try {
            const stored = localStorage.getItem(this.config.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error parsing cached projects from localStorage:', error);
            return {};
        }
    }

    /**
     * الحصول على إحصائيات المشاريع المؤقتة
     */
    getCacheStats(): {
        totalCachedProjects: number;
        expiredProjects: number;
        activeProjects: number;
        storageSize: number;
    } {
        try {
            const cachedProjects = this.getCachedProjects();
            const now = Date.now();

            let expiredCount = 0;
            let activeCount = 0;

            for (const cachedProject of Object.values(cachedProjects)) {
                if (now > cachedProject.expiresAt) {
                    expiredCount++;
                } else {
                    activeCount++;
                }
            }

            const storageSize = localStorage.getItem(this.config.storageKey)?.length || 0;

            return {
                totalCachedProjects: Object.keys(cachedProjects).length,
                expiredProjects: expiredCount,
                activeProjects: activeCount,
                storageSize
            };
        } catch (error) {
            console.error('Error getting cache stats:', error);
            return {
                totalCachedProjects: 0,
                expiredProjects: 0,
                activeProjects: 0,
                storageSize: 0
            };
        }
    }
}

// إنشاء مثيل واحد للمدير
export const browserCacheManager = new BrowserCacheManager();

// تصدير الكلاس للاستخدام المخصص
export { BrowserCacheManager };

