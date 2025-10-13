/**
 * أدوات معالجة الملفات الموحدة
 *
 * هذا الملف يحتوي على جميع أدوات معالجة الملفات
 * المستخدمة في التطبيق
 */

import { SUPPORTED_FILE_TYPES } from '../../lib/core/constants';

/**
 * تحويل ArrayBuffer إلى base64
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binary);
}

/**
 * تحويل base64 إلى ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
}

/**
 * تحويل الملف إلى base64
 */
export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // إزالة data:type;base64,
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * تحويل base64 إلى ملف
 */
export function base64ToFile(base64: string, filename: string, mimeType: string): File {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new File([byteArray], filename, { type: mimeType });
}

/**
 * تحويل الملف إلى ArrayBuffer
 */
export function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

/**
 * تحويل ArrayBuffer إلى Blob
 */
export function arrayBufferToBlob(buffer: ArrayBuffer, mimeType: string): Blob {
    return new Blob([buffer], { type: mimeType });
}

/**
 * تحويل الملف إلى Blob
 */
export function fileToBlob(file: File): Blob {
    return new Blob([file], { type: file.type });
}

/**
 * تحويل Blob إلى ملف
 */
export function blobToFile(blob: Blob, filename: string): File {
    return new File([blob], filename, { type: blob.type });
}

/**
 * تحويل الملف إلى URL
 */
export function fileToUrl(file: File): string {
    return URL.createObjectURL(file);
}

/**
 * تحرير URL الملف
 */
export function revokeFileUrl(url: string): void {
    URL.revokeObjectURL(url);
}

/**
 * تحميل الملف من URL
 */
export async function downloadFileFromUrl(url: string, filename: string): Promise<void> {
    const response = await fetch(url);
    const blob = await response.blob();
    const fileUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(fileUrl);
}

/**
 * تحميل الملف من ArrayBuffer
 */
export function downloadFileFromBuffer(buffer: ArrayBuffer, filename: string, mimeType: string): void {
    const blob = arrayBufferToBlob(buffer, mimeType);
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * تحميل الملف من base64
 */
export function downloadFileFromBase64(base64: string, filename: string, mimeType: string): void {
    const file = base64ToFile(base64, filename, mimeType);
    const url = URL.createObjectURL(file);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * التحقق من صحة نوع الملف
 */
export function isValidFileType(file: File, acceptedTypes: string[]): boolean {
    return acceptedTypes.includes(file.type);
}

/**
 * التحقق من صحة حجم الملف
 */
export function isValidFileSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize;
}

/**
 * التحقق من صحة الملف
 */
export function validateFile(file: File, options: {
    acceptedTypes?: string[];
    maxSize?: number;
}): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (options.acceptedTypes && !isValidFileType(file, options.acceptedTypes)) {
        errors.push(`نوع الملف غير مدعوم. الأنواع المدعومة: ${options.acceptedTypes.join(', ')}`);
    }

    if (options.maxSize && !isValidFileSize(file, options.maxSize)) {
        const maxSizeMB = (options.maxSize / (1024 * 1024)).toFixed(2);
        errors.push(`حجم الملف كبير جداً. الحد الأقصى ${maxSizeMB} MB`);
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * الحصول على معلومات نوع الملف
 */
export function getFileTypeInfo(mimeType: string) {
    return Object.values(SUPPORTED_FILE_TYPES).find(type => type.mimeType === mimeType) || null;
}

/**
 * الحصول على امتداد الملف من اسمه
 */
export function getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * الحصول على اسم الملف بدون امتداد
 */
export function getFileNameWithoutExtension(filename: string): string {
    return filename.replace(/\.[^/.]+$/, '');
}

/**
 * تغيير امتداد الملف
 */
export function changeFileExtension(filename: string, newExtension: string): string {
    const nameWithoutExt = getFileNameWithoutExtension(filename);
    return `${nameWithoutExt}.${newExtension}`;
}

/**
 * إنشاء اسم ملف فريد
 */
export function generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = getFileExtension(originalName);
    const nameWithoutExt = getFileNameWithoutExtension(originalName);

    return `${nameWithoutExt}_${timestamp}_${random}.${extension}`;
}

/**
 * تحويل حجم الملف إلى تنسيق قابل للقراءة
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * تحويل حجم الملف إلى بايت
 */
export function parseFileSize(sizeString: string): number {
    const units: Record<string, number> = {
        'B': 1,
        'KB': 1024,
        'MB': 1024 * 1024,
        'GB': 1024 * 1024 * 1024,
        'TB': 1024 * 1024 * 1024 * 1024,
    };

    const match = sizeString.match(/^(\d+(?:\.\d+)?)\s*([A-Z]+)$/i);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    return value * (units[unit] || 1);
}

/**
 * ضغط الملف
 */
export async function compressFile(file: File, quality: number = 0.8): Promise<File> {
    if (!file.type.startsWith('image/')) return file;

    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            ctx?.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
                if (blob) {
                    const compressedFile = new File([blob], file.name, { type: file.type });
                    resolve(compressedFile);
                } else {
                    resolve(file);
                }
            }, file.type, quality);
        };

        img.src = URL.createObjectURL(file);
    });
}

/**
 * تغيير حجم الصورة
 */
export async function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<File> {
    if (!file.type.startsWith('image/')) return file;

    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            let { width, height } = img;

            // حساب الأبعاد الجديدة
            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            ctx?.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (blob) {
                    const resizedFile = new File([blob], file.name, { type: file.type });
                    resolve(resizedFile);
                } else {
                    resolve(file);
                }
            }, file.type);
        };

        img.src = URL.createObjectURL(file);
    });
}

/**
 * إنشاء معاينة للصورة
 */
export function createImagePreview(file: File, maxSize: number = 200): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error('الملف ليس صورة'));
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            let { width, height } = img;

            // حساب الأبعاد الجديدة
            if (width > height) {
                if (width > maxSize) {
                    height = (height * maxSize) / width;
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width = (width * maxSize) / height;
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;

            ctx?.drawImage(img, 0, 0, width, height);

            resolve(canvas.toDataURL());
        };

        img.onerror = () => reject(new Error('فشل في تحميل الصورة'));
        img.src = URL.createObjectURL(file);
    });
}

/**
 * مساعد للتحقق من أن الملف صورة
 */
export function isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
}

/**
 * مساعد للتحقق من أن الملف مستند
 */
export function isDocumentFile(file: File): boolean {
    const documentTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/rtf',
    ];

    return documentTypes.includes(file.type);
}

/**
 * مساعد للتحقق من أن الملف عرض تقديمي
 */
export function isPresentationFile(file: File): boolean {
    const presentationTypes = [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    return presentationTypes.includes(file.type);
}

/**
 * مساعد للتحقق من أن الملف جدول بيانات
 */
export function isSpreadsheetFile(file: File): boolean {
    const spreadsheetTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
    ];

    return spreadsheetTypes.includes(file.type);
}
