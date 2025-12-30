'use client';

import { useState } from 'react';
import { useToast } from '../util/use-toast';

export function useImageUpload() {
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    const handleFileUpload = (
        file: File,
        onSuccess: (dataUri: string) => void
    ) => {
        if (file) {
            setIsUploading(true);
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUri = e.target?.result as string;
                onSuccess(dataUri);
                toast({ title: 'Image Uploaded', description: 'Your image has been updated locally.' });
                setIsUploading(false);
            };
            reader.onerror = () => {
                toast({ title: 'Upload Failed', description: 'Could not read the image file.', variant: 'destructive' });
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        }
    };

    return {
        isUploading,
        handleFileUpload,
    };
}
