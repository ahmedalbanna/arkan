'use client';

import { useState, useEffect } from 'react';
import { templates, type TemplateKey } from '@/lib/docx-styles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CheckCircle, Palette } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const TEMPLATE_KEY = 'arkan-docx-template';

export default function TemplateManager() {
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('modern');
    const [isLoaded, setIsLoaded] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const saved = localStorage.getItem(TEMPLATE_KEY) as TemplateKey | null;
        if (saved && templates[saved]) {
            setSelectedTemplate(saved);
        }
        setIsLoaded(true);
    }, []);

    const handleSelect = (key: TemplateKey) => {
        setSelectedTemplate(key);
        localStorage.setItem(TEMPLATE_KEY, key);
        toast({
            title: "تم تحديد القالب",
            description: `تم تعيين القالب "${templates[key].name}" كقالب افتراضي للتصدير.`,
        });
    };

    if (!isLoaded) {
        return null; // Or a loading skeleton
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(templates).map(([key, template]) => {
                const isSelected = selectedTemplate === key;
                return (
                    <Card key={key} className={`flex flex-col transition-all ${isSelected ? 'border-primary ring-2 ring-primary' : ''}`}>
                        <CardHeader>
                            <div className="relative h-80 w-full">
                                <Image
                                    src={template.imageUrl}
                                    alt={`Preview of ${template.name} template`}
                                    fill
                                    className="object-cover rounded-t-lg border"
                                    data-ai-hint={template.dataAiHint}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <CardTitle className="font-headline text-2xl">{template.name}</CardTitle>
                            <CardDescription className="mt-2">{template.description}</CardDescription>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={() => handleSelect(key as TemplateKey)}
                                disabled={isSelected}
                                className="w-full font-headline"
                            >
                                {isSelected ? (
                                    <>
                                        <CheckCircle className="ml-2 h-4 w-4" />
                                        القالب المحدد
                                    </>
                                ) : (
                                    'تعيين كافتراضي'
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
}
