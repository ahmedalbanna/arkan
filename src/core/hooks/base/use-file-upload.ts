/**
 * Hook أساسي لرفع الملفات - قابل لإعادة الاستخدام
 * يوفر منطق موحد لرفع الملفات في جميع أنحاء التطبيق
 */

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks';
import { processFileApi } from '@/services';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export interface FileUploadOptions {
    acceptedTypes?: string[];
    maxSize?: number; // بالبايت
    multiple?: boolean;
    onSuccess?: (content: string, fileName: string) => void;
    onError?: (error: Error) => void;
    showSuccessToast?: boolean;
    successMessage?: string;
}

export interface FileUploadResult {
    isUploading: boolean;
    getRootProps: () => any;
    getInputProps: () => any;
    isDragActive: boolean;
    uploadFile: (file: File) => Promise<void>;
}

/**
 * Hook أساسي لرفع الملفات مع معالجة الأخطاء والإشعارات
 * @param options خيارات رفع الملفات
 * @returns كائن يحتوي على حالة الرفع ومعالجات الأحداث
 */
export function useFileUpload(options: FileUploadOptions = {}): FileUploadResult {
    const {
        acceptedTypes = ['application/pdf', 'text/plain', 'text/markdown'],
        maxSize = 10 * 1024 * 1024, // 10MB
        multiple = false,
        onSuccess,
        onError,
        showSuccessToast = true,
        successMessage = 'تم رفع الملف بنجاح!'
    } = options;

    const [isUploading, setIsUploading] = useState(false);
    const { firebaseUser, refetchUser } = useAuth();
    const { toast } = useToast();

    const uploadFile = useCallback(async (file: File) => {
        if (!firebaseUser) {
            const error = new Error('يجب تسجيل الدخول لرفع الملفات');
            toast({
                title: 'خطأ في المصادقة',
                description: error.message,
                variant: 'destructive',
            });
            onError?.(error);
            return;
        }

        if (file.size > maxSize) {
            const error = new Error(`حجم الملف كبير جداً. الحد الأقصى ${maxSize / (1024 * 1024)}MB`);
            toast({
                title: 'حجم الملف كبير جداً',
                description: error.message,
                variant: 'destructive',
            });
            onError?.(error);
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = await firebaseUser.getIdToken();
            const result = await processFileApi(formData, token);

            onSuccess?.(result.markdown, file.name);

            if (showSuccessToast) {
                toast({
                    title: successMessage,
                    description: `تم استخراج النص من ${file.name}`,
                });
            }

            refetchUser();
        } catch (error: any) {
            const errorMessage = error.message || 'فشل في رفع الملف';
            toast({
                title: 'فشل في رفع الملف',
                description: errorMessage,
                variant: 'destructive',
            });
            onError?.(error);
        } finally {
            setIsUploading(false);
        }
    }, [firebaseUser, maxSize, onSuccess, onError, showSuccessToast, successMessage, toast, refetchUser]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;
        await uploadFile(file);
    }, [uploadFile]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple,
        accept: acceptedTypes.reduce((acc, type) => {
            acc[type] = [];
            return acc;
        }, {} as Record<string, string[]>),
        maxSize,
    });

    return {
        isUploading,
        getRootProps,
        getInputProps,
        isDragActive,
        uploadFile,
    };
}
