'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { handleGenerateDiagram, type DiagramState, type DiagramType } from '@/app/generate-diagrams/actions';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, Sparkles, Copy, Check, Share2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const diagramConfig: { [key in DiagramType]: { title: string; } } = {
    useCase: { title: "مخطط حالة الاستخدام (Use Case)" },
    class: { title: "مخطط الأصناف (Class)" },
    sequence: { title: "مخطط التسلسل (Sequence)" },
    activity: { title: "مخطط النشاط (Activity)" },
    component: { title: "مخطط المكونات (Component)" },
    archimate: { title: "مخطط ArchiMate" },
};

function GenerateButton({ diagramType }: { diagramType: DiagramType }) {
    const { pending } = useFormStatus();
    const [lastClicked, setLastClicked] = useState<DiagramType | null>(null);

    return (
        <Button
            type="submit"
            name="diagramToGenerate"
            value={diagramType}
            onClick={() => setLastClicked(diagramType)}
            disabled={pending}
            variant="secondary"
            className="w-full justify-start"
        >
            {pending && lastClicked === diagramType ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
                <Sparkles className="ml-2 h-4 w-4" />
            )}
            {diagramConfig[diagramType].title}
        </Button>
    );
}

function CodeDisplay({ code, diagramType }: { code: string, diagramType: DiagramType }) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };
    
    return (
        <Card className="mt-6">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="font-headline">PlantUML Code - {diagramConfig[diagramType].title}</CardTitle>
                        <CardDescription>Copy the code and paste it into an online PlantUML renderer.</CardDescription>
                    </div>
                     <div className="flex gap-2 flex-shrink-0">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy Code">
                                        {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{isCopied ? 'Copied!' : 'Copy Code'}</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" asChild>
                                        <a href="https://www.planttext.com/" target="_blank" rel="noopener noreferrer" aria-label="Open PlantUML renderer">
                                            <Share2 className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Open Online Renderer</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm text-left" dir="ltr">
                    <code>{code}</code>
                </pre>
            </CardContent>
        </Card>
    );
}


export default function DiagramGenerator() {
    const initialState: DiagramState = {};
    const [state, formAction] = useActionState(handleGenerateDiagram, initialState);
    
    const orderedDiagrams = Object.keys(diagramConfig) as DiagramType[];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <form action={formAction}>
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
                </form>
            </div>
            <div className="md:col-span-2">
                 {state?.lastGenerated && !state.error && (
                    <Alert className="mb-6">
                        <Sparkles className="h-4 w-4" />
                        <AlertTitle className="font-headline">تم التوليد بنجاح!</AlertTitle>
                        <AlertDescription>
                            تم توليد كود PlantUML لقسم "{diagramConfig[state.lastGenerated].title}".
                        </AlertDescription>
                    </Alert>
                )}
                {state.plantUmlCode && state.lastGenerated && (
                    <CodeDisplay code={state.plantUmlCode} diagramType={state.lastGenerated} />
                )}
            </div>
        </div>
    );
}
