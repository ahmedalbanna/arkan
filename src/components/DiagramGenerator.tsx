'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { handleGenerateDiagram, type DiagramState, type DiagramType } from '@/app/generate-diagrams/actions';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, Sparkles, Copy, Check, Share2, Download } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import Image from 'next/image';
import { saveAs } from 'file-saver';

const diagramConfig: { [key in DiagramType]: { title: string; } } = {
    useCase: { title: "مخطط حالة الاستخدام (Use Case)" },
    class: { title: "مخطط الأصناف (Class)" },
    sequence: { title: "مخطط التسلسل (Sequence)" },
    activity: { title: "مخطط النشاط (Activity)" },
    component: { title: "مخطط المكونات (Component)" },
    archimate: { title: "مخطط ArchiMate" },
};

function GenerateButton({ diagramType }: { diagramType: DiagramType }) {
    const { pending, data } = useFormStatus();
    
    const isGeneratingThis = pending && data?.get('diagramToGenerate') === diagramType;

    return (
        <Button
            type="submit"
            name="diagramToGenerate"
            value={diagramType}
            disabled={pending}
            variant="secondary"
            className="w-full justify-start"
        >
            {isGeneratingThis ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
                <Sparkles className="ml-2 h-4 w-4" />
            )}
            {diagramConfig[diagramType].title}
        </Button>
    );
}

function ImageDisplay({ imageUrl, diagramType }: { imageUrl: string, diagramType: DiagramType }) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            saveAs(blob, `${diagramConfig[diagramType].title.replace(/ /g, '_')}.png`);
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">المخطط المعروض</CardTitle>
            </CardHeader>
            <CardContent>
                <Image 
                    src={imageUrl} 
                    alt={`Rendered ${diagramConfig[diagramType].title}`}
                    width={800}
                    height={600}
                    className="w-full h-auto object-contain rounded-md border bg-white p-2"
                />
            </CardContent>
            <CardFooter>
                <Button onClick={handleDownload} disabled={isDownloading} className="font-headline">
                    {isDownloading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Download className="ml-2 h-4 w-4" />}
                    تحميل الصورة
                </Button>
            </CardFooter>
        </Card>
    );
}

function DiagramEditor({ code, diagramType }: { code: string, diagramType: DiagramType }) {
    const [isCopied, setIsCopied] = useState(false);
    const { pending, data } = useFormStatus();

    const isRendering = pending && data?.get('formAction') === 'render';

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };
    
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline">PlantUML Code - {diagramConfig[diagramType].title}</CardTitle>
                        <CardDescription>يمكنك تعديل الكود ثم تحديث المخطط.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <input type="hidden" name="diagramType" value={diagramType} />
                <Textarea
                    name="plantUmlCode"
                    defaultValue={code}
                    rows={15}
                    className="bg-muted p-4 rounded-md overflow-x-auto text-sm text-left font-mono"
                    dir="ltr"
                />
            </CardContent>
            <CardFooter className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    type="submit"
                    name="formAction"
                    value="render"
                    disabled={pending}
                    className="font-headline"
                >
                    {isRendering ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Sparkles className="ml-2 h-4 w-4" />}
                    تحديث المخطط من الكود
                </Button>
                <div className="flex gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={handleCopy} type="button" aria-label="Copy Code">
                                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>{isCopied ? 'Copied!' : 'Copy Code'}</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                     <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" asChild type="button">
                                    <a href="https://www.planttext.com/" target="_blank" rel="noopener noreferrer" aria-label="Open PlantUML renderer">
                                        <Share2 className="h-4 w-4" />
                                    </a>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Open Online Renderer</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardFooter>
        </Card>
    );
}


export default function DiagramGenerator() {
    const initialState: DiagramState = {};
    const [state, formAction] = useActionState(handleGenerateDiagram, initialState);
    
    const orderedDiagrams = Object.keys(diagramConfig) as DiagramType[];

    return (
        <form action={formAction}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">مقترح المشروع (JSON)</CardTitle>
                            <CardDescription>
                                الصق هنا محتوى مقترح المشروع الكامل بصيغة JSON.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                name="proposalJson"
                                placeholder='{ "title": "...", "objective": "...", ... }'
                                rows={15}
                                required
                                defaultValue={state.error ? '' : undefined}
                            />
                            {state?.error && (
                                <p className="text-sm font-medium text-destructive mt-2">{state.error}</p>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2 items-start">
                           {orderedDiagrams.map(key => (
                               <GenerateButton key={key} diagramType={key} />
                           ))}
                        </CardFooter>
                    </Card>
                </div>
                <div className="md:col-span-2 space-y-6">
                     {state?.lastGenerated && !state.error && (
                        <Alert>
                            <Sparkles className="h-4 w-4" />
                            <AlertTitle className="font-headline">تم التوليد بنجاح!</AlertTitle>
                            <AlertDescription>
                                تم توليد كود PlantUML والصورة لقسم "{diagramConfig[state.lastGenerated].title}".
                            </AlertDescription>
                        </Alert>
                    )}
                    {state.imageUrl && state.lastGenerated && (
                        <ImageDisplay imageUrl={state.imageUrl} diagramType={state.lastGenerated} />
                    )}
                    {state.plantUmlCode && state.lastGenerated && (
                        <DiagramEditor code={state.plantUmlCode} diagramType={state.lastGenerated} />
                    )}
                </div>
            </div>
        </form>
    );
}
