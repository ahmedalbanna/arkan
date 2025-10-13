
'use client';

import { AnimatedContainer } from '@/components/ui/animation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUploadProjectLogic } from '@/hooks';
import { Upload } from 'lucide-react';
import { Input } from '../ui/input';

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
            <AnimatedContainer animation="fade-in-up" delay={400}>
                <Button
                    variant="gradient"
                    onClick={handleUploadClick}
                    className="hover:shadow-glow transition-all duration-200 group"
                >
                    <Upload className="me-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    {t('projects.uploadButton')}
                    <Badge variant="secondary" className="ml-2 text-xs">
                        .arkan
                    </Badge>
                </Button>
            </AnimatedContainer>
        </>
    );
}
