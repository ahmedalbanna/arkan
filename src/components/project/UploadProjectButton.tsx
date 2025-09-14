
'use client';

import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { Input } from '../ui/input';
import { useUploadProjectLogic } from '@/hooks';

export function UploadProjectButton() {
    const {
        fileInputRef,
        handleUploadClick,
        onFileChange,
        t
    } = useUploadProjectLogic();

    return (
        <>
            <Input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                accept=".arkan"
                className="hidden"
            />
            <Button
                variant="outline"
                onClick={handleUploadClick}
                className="animate-fade-in-up"
                style={{ animationDelay: '0.4s' }}
            >
                <Upload className="me-2 h-4 w-4" />
                {t('projects.uploadButton')}
            </Button>
        </>
    );
}
