'use client';

import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { Input } from '../ui/input';
import { useUploadProject } from '@/hooks/use-upload-project';

export function UploadProjectButton() {
    const {
        fileInputRef,
        handleUploadClick,
        onFileChange,
        t
    } = useUploadProject();

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
