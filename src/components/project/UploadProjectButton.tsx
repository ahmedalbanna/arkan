'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useBuilderStore } from '@/hooks/useBuilderStore';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { useLocalization } from '@/context/LocalizationContext';

export function UploadProjectButton() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t } = useLocalization();
    const router = useRouter();
    const loadState = useBuilderStore(state => state.loadState);
    const newSession = useBuilderStore(state => state.newSession);

    const handleUploadClick = () => {
        newSession(); // Clear session before loading
        fileInputRef.current?.click();
    };

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const decodedJson = decodeURIComponent(escape(atob(content)));
                const parsedState = JSON.parse(decodedJson);
                loadState(parsedState);
                router.push('/generate');
            } catch (error) {
                console.error('Failed to load project file:', error);
                toast({ title: t('builder.toasts.loadFailedTitle'), description: t('builder.toasts.loadFailedDesc'), variant: 'destructive' });
            }
        };
        reader.readAsText(file);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <>
            <input
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
