/**
 * Hook أساسي لمعالجة النماذج - قابل لإعادة الاستخدام
 * يوفر منطق موحد لجميع النماذج في التطبيق
 */

import { useToast } from '@/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

export interface FormHandlerOptions {
    onSubmitSuccess?: (data: any) => void;
    onSubmitError?: (error: any) => void;
    showSuccessToast?: boolean;
    successMessage?: string;
}

export interface FormHandlerResult<T extends z.ZodType> {
    form: UseFormReturn<z.infer<T>>;
    handleSubmit: (data: z.infer<T>) => void;
    isSubmitting: boolean;
    reset: () => void;
}

/**
 * Hook أساسي لمعالجة النماذج مع التحقق من البيانات
 * @param schema مخطط Zod للتحقق من البيانات
 * @param defaultValues القيم الافتراضية للنموذج
 * @param options خيارات إضافية للنموذج
 * @returns كائن يحتوي على النموذج ومعالجات الأحداث
 */
export function useFormHandler<T extends z.ZodType>(
    schema: T,
    defaultValues: z.infer<T>,
    options: FormHandlerOptions = {}
): FormHandlerResult<T> {
    const { toast } = useToast();
    const {
        onSubmitSuccess,
        onSubmitError,
        showSuccessToast = true,
        successMessage = 'تم الحفظ بنجاح!'
    } = options;

    const form = useForm<z.infer<T>>({
        resolver: zodResolver(schema),
        defaultValues,
    });

    const handleSubmit = (data: z.infer<T>) => {
        try {
            onSubmitSuccess?.(data);
            if (showSuccessToast) {
                toast({
                    title: successMessage,
                    variant: 'default',
                });
            }
        } catch (error) {
            onSubmitError?.(error);
            toast({
                title: 'خطأ في المعالجة',
                description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
                variant: 'destructive',
            });
        }
    };

    const reset = () => {
        form.reset(defaultValues);
    };

    return {
        form,
        handleSubmit,
        isSubmitting: form.formState.isSubmitting,
        reset,
    };
}
