/**
 * خدمة الإعدادات
 *
 * هذا الملف يحتوي على خدمات إدارة الإعدادات العامة
 */

// This function now fetches public settings, no token needed.
export async function fetchPublicSettings() {
    const response = await fetch('/api/admin/settings');
    if (!response.ok) {
        throw new Error('Failed to fetch payment details');
    }
    return response.json();
}
