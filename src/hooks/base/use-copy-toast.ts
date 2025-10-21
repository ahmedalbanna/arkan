/**
 * Hook أساسي للنسخ مع الإشعارات - قابل لإعادة الاستخدام
 * يوفر منطق موحد لنسخ النصوص مع إظهار الإشعارات
 */

import { useToast } from '@/hooks';
import { useState } from 'react';

export interface CopyToastOptions {
    successMessage?: string;
    errorMessage?: string;
    resetDelay?: number; // بالمللي ثانية
}

export interface CopyToastResult {
    isCopied: boolean;
    copyToClipboard: (text: string) => Promise<void>;
    resetCopiedState: () => void;
}

/**
 * Hook أساسي للنسخ مع الإشعارات
 * @param options خيارات النسخ والإشعارات
 * @returns كائن يحتوي على حالة النسخ ومعالج النسخ
 */
export function useCopyToast(options: CopyToastOptions = {}): CopyToastResult {
    const {
        successMessage = 'تم النسخ إلى الحافظة!',
        errorMessage = 'فشل في النسخ',
        resetDelay = 2000
    } = options;

    const [isCopied, setIsCopied] = useState(false);
    const { toast } = useToast();

    const copyToClipboard = async (text: string): Promise<void> => {
        if (!text) {
            toast({
                title: 'لا يوجد نص للنسخ',
                variant: 'destructive',
            });
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);
            toast({
                title: successMessage,
            });

            // إعادة تعيين الحالة بعد فترة زمنية
            setTimeout(() => {
                setIsCopied(false);
            }, resetDelay);
        } catch (error) {
            toast({
                title: errorMessage,
                description: 'تأكد من أن المتصفح يدعم النسخ',
                variant: 'destructive',
            });
        }
    };

    const resetCopiedState = () => {
        setIsCopied(false);
    };

    return {
        isCopied,
        copyToClipboard,
        resetCopiedState,
    };
}
