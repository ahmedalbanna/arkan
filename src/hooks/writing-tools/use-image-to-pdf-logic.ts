'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/util/use-toast';
import { useLocalization } from '@/context/LocalizationContext';
import { jsPDF } from 'jspdf';

interface UploadedFile {
    id: string;
    file: File;
    preview: string;
    name: string;
}

export function useImageToPdfLogic() {
    const { t } = useLocalization();
    const { toast } = useToast();
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isConverting, setIsConverting] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map(file => ({
            id: uuidv4(),
            file,
            preview: URL.createObjectURL(file),
            name: file.name
        }));
        setFiles(prev => [...prev, ...newFiles]);
        toast({
            title: t('writingTools.imageToPdf.toastFilesAddedTitle'),
            description: t('writingTools.imageToPdf.toastFilesAddedDesc', { count: newFiles.length }),
        });
    }, [t, toast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
        multiple: true,
    });

    const handleRemoveFile = (id: string) => {
        setFiles(prev => prev.filter(file => file.id !== id));
    };

    const handleGeneratePdf = async () => {
        if (files.length === 0) {
            toast({
                title: t('writingTools.imageToPdf.toastNoImagesTitle'),
                description: t('writingTools.imageToPdf.toastNoImagesDesc'),
                variant: 'destructive',
            });
            return;
        }

        setIsConverting(true);
        toast({
            title: t('writingTools.imageToPdf.toastGeneratingTitle'),
            description: t('writingTools.imageToPdf.toastGeneratingDesc'),
        });

        try {
            const pdf = new jsPDF();
            for (let i = 0; i < files.length; i++) {
                const file = files[i].file;
                const imgData = await readFileAsDataURL(file);
                const img = new Image();
                img.src = imgData;
                await new Promise(resolve => img.onload = resolve);
                
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = img.width;
                const imgHeight = img.height;
                const ratio = imgWidth / imgHeight;

                let newWidth = pdfWidth;
                let newHeight = newWidth / ratio;
                if(newHeight > pdfHeight) {
                    newHeight = pdfHeight;
                    newWidth = newHeight * ratio;
                }
                const x = (pdfWidth - newWidth) / 2;
                const y = (pdfHeight - newHeight) / 2;

                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, file.type, x, y, newWidth, newHeight);
            }
            pdf.save('converted_images.pdf');
            toast({
                title: t('writingTools.imageToPdf.toastSuccessTitle'),
                description: t('writingTools.imageToPdf.toastSuccessDesc'),
            });
        } catch (error) {
            console.error(error);
            toast({
                title: t('writingTools.imageToPdf.toastErrorTitle'),
                description: String(error),
                variant: 'destructive',
            });
        } finally {
            setIsConverting(false);
        }
    };

    const readFileAsDataURL = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    return {
        t,
        files,
        setFiles,
        isConverting,
        getRootProps,
        getInputProps,
        isDragActive,
        handleGeneratePdf,
        handleRemoveFile,
    };
}
