
'use client';

import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { Input } from '../ui/input';
import { useBuilderStore } from '@/hooks';
import { useToast } from '@/hooks/util/use-toast';
import { useLocalization } from '@/context/LocalizationContext';
import { useRouter } from 'next/navigation';

export function UploadProjectButton() {
    const { fileInputRef, handleUploadClick, onFileChange, t } = useBuilderStore();
    const { toast } = useToast();
    const router = useRouter();


    return (
        <>
            <Input
                type="file"
                ref={fileInputRef}
                onChange={(e) => onFileChange(e, toast, t, router)}
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
