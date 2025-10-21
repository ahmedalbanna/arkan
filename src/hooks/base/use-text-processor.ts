/**
 * Hook أساسي لمعالجة النصوص في أدوات الكتابة - قابل لإعادة الاستخدام
 * يوفر منطق موحد لجميع أدوات معالجة النصوص
 */

import { useToast, useWritingTool } from '@/hooks';
import { useState } from 'react';
import { z } from 'zod';
import { useCopyToast } from './use-copy-toast';
import { useFileUpload } from './use-file-upload';
import { useFormHandler } from './use-form-handler';
import { useProcessingState } from './use-processing-state';

export interface TextProcessorOptions {
    toolName: string;
    apiEndpoint: string;
    schema: z.ZodType;
    defaultValues: any;
    successMessage?: string;
    errorMessage?: string;
    enableFileUpload?: boolean;
    acceptedFileTypes?: string[];
}

export interface TextProcessorResult {
    // النموذج والحالة
    form: any;
    isProcessing: boolean;

    // النصوص
    originalText: string;
    processedText: string;
    setOriginalText: (text: string) => void;
    setProcessedText: (text: string) => void;

    // النسخ
    isCopied: boolean;
    copyToClipboard: (text: string) => Promise<void>;

    // رفع الملفات
    isUploading: boolean;
    getRootProps: () => any;
    getInputProps: () => any;
    isDragActive: boolean;

    // المعالجة
    handleSubmit: (data: any) => void;
    reset: () => void;

    // الطفرة
    mutation: any;
}

/**
 * Hook أساسي لمعالجة النصوص
 * @param options خيارات معالج النصوص
 * @returns كائن يحتوي على جميع الوظائف المطلوبة لمعالجة النصوص
 */
export function useTextProcessor(options: TextProcessorOptions): TextProcessorResult {
    const {
        toolName,
        apiEndpoint,
        schema,
        defaultValues,
        successMessage = 'تمت المعالجة بنجاح!',
        errorMessage = 'فشلت المعالجة',
        enableFileUpload = true,
        acceptedFileTypes = ['application/pdf', 'text/plain', 'text/markdown']
    } = options;

    const [originalText, setOriginalText] = useState('');
    const [processedText, setProcessedText] = useState('');
    const { toast } = useToast();

    // Hook للنسخ
    const { isCopied, copyToClipboard } = useCopyToast({
        successMessage: 'تم نسخ النص إلى الحافظة!',
    });

    // Hook لرفع الملفات
    const fileUpload = useFileUpload({
        acceptedTypes: acceptedFileTypes,
        onSuccess: (content: string, fileName: string) => {
            setOriginalText(content);
            form.setValue('text', content, { shouldValidate: true });
            toast({
                title: 'تم رفع الملف',
                description: `تم استخراج النص من ${fileName}`,
            });
        },
        onError: (error) => {
            toast({
                title: 'فشل في رفع الملف',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // Hook لإدارة حالة المعالجة
    const { isProcessing, startProcessing, stopProcessing } = useProcessingState();

    // Hook للنموذج
    const { form, handleSubmit: formHandleSubmit, reset } = useFormHandler(
        schema,
        defaultValues,
        {
            onSubmitSuccess: (data) => {
                setOriginalText(data.text);
                startProcessing();
            },
            onSubmitError: (error) => {
                toast({
                    title: errorMessage,
                    description: error.message,
                    variant: 'destructive',
                });
            },
        }
    );

    // Hook للطفرة
    const mutation = useWritingTool(apiEndpoint, {
        onSuccess: (data: any) => {
            const resultText = data.processedText || data.result || data.output || '';
            setProcessedText(resultText);
            stopProcessing();
            toast({
                title: successMessage,
            });
        },
        onError: (error: any) => {
            stopProcessing();
            toast({
                title: errorMessage,
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    const handleSubmit = (data: any) => {
        formHandleSubmit(data);
        mutation.mutate(data);
    };

    const resetAll = () => {
        reset();
        setOriginalText('');
        setProcessedText('');
    };

    return {
        // النموذج والحالة
        form,
        isProcessing: isProcessing || mutation.isPending,

        // النصوص
        originalText,
        processedText,
        setOriginalText,
        setProcessedText,

        // النسخ
        isCopied,
        copyToClipboard,

        // رفع الملفات
        isUploading: fileUpload.isUploading,
        getRootProps: fileUpload.getRootProps,
        getInputProps: fileUpload.getInputProps,
        isDragActive: fileUpload.isDragActive,

        // المعالجة
        handleSubmit,
        reset: resetAll,

        // الطفرة
        mutation,
    };
}
