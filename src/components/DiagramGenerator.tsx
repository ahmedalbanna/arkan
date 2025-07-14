
'use client';

import { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { handleGenerateDiagram, type DiagramState } from '@/app/generate-diagrams/actions';
import { DiagramTypeSchema, type DiagramType } from '@/ai/schemas';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { useHistory } from '@/hooks/use-history';
import { useAgents } from '@/hooks/use-agents';
import type { Agent } from '@/lib/agents';
import DiagramViewer from './DiagramViewer';
import { diagramConfig } from '@/lib/report-config';

function GenerateButton({ diagramType, agent }: { diagramType: DiagramType, agent?: Agent }) {
    const { pending, data } = useFormStatus();

    const isGeneratingThis = pending && data?.get('diagramToGenerate') === diagramType;

    return (
        <Button
            type="submit"
            name="diagramToGenerate"
            value={diagramType}
            disabled={pending || !agent?.isEnabled}
            variant="secondary"
            className="w-full justify-start"
            title={!agent?.isEnabled ? 'This agent is disabled' : `Generate ${diagramConfig[diagramType].title}`}
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

function RenderButton() {
    const { pending, data } = useFormStatus();
    const isRendering = pending && data?.get('formAction') === 'render';

    return (
        <Button type="submit" name="formAction" value="render" disabled={isRendering} className="font-headline">
            {isRendering ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <RefreshCw className="ml-2 h-4 w-4" />}
            Update Diagram
        </Button>
    );
}

export default function DiagramGenerator() {
    const initialState: DiagramState = { plantUmlCodes: {} };
    const [state, formAction] = useActionState(handleGenerateDiagram, initialState);

    const [proposalJson, setProposalJson] = useState('');
    const { addHistoryEntry } = useHistory();
    const { agents, isLoaded } = useAgents();
    const [editedCodes, setEditedCodes] = useState<Partial<Record<DiagramType, string>>>({});

    const orderedDiagrams = DiagramTypeSchema.options;
    const diagramAgents = orderedDiagrams.map(key => agents.find(a => a.id === diagramConfig[key].agentId));

    useEffect(() => {
        if (state.lastGenerated && state.currentPlantUmlCode) {
            let proposalTitle = 'مخطط مشروع';
            try {
                const parsed = JSON.parse(proposalJson);
                if (parsed && parsed.title) {
                    proposalTitle = parsed.title;
                }
            } catch (e) {
                // Ignore parsing errors
            }

            addHistoryEntry({
                id: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                type: 'diagram',
                title: `مخطط: ${diagramConfig[state.lastGenerated].title}`,
                diagramType: state.lastGenerated,
                plantUmlCode: state.currentPlantUmlCode,
                imageUrl: state.imageUrl!,
                proposalTitle: proposalTitle,
            });

            // Sync the generated code with the editor state
            setEditedCodes(prev => ({
                ...prev,
                [state.lastGenerated!]: state.currentPlantUmlCode,
            }));
        }
    }, [state.lastGenerated, state.currentPlantUmlCode, state.imageUrl, addHistoryEntry, proposalJson]);

    const currentDiagramType = state.lastGenerated;
    const currentGeneratedCode = currentDiagramType ? state.plantUmlCodes?.[currentDiagramType] : undefined;
    const currentEditedCode = currentDiagramType ? editedCodes[currentDiagramType] : undefined;
    const hasChanges = currentGeneratedCode !== undefined && currentEditedCode !== undefined && currentGeneratedCode !== currentEditedCode;

    const handleCodeChange = (newCode: string) => {
        if (currentDiagramType) {
            setEditedCodes(prev => ({ ...prev, [currentDiagramType]: newCode }));
        }
    };

    return (
        <form action={formAction}>
            {Object.entries(state.plantUmlCodes ?? {}).map(([type, code]) => (
                code ? <input type="hidden" name={`plantUmlCode_${type}`} value={code} key={type} /> : null
            ))}
            {currentDiagramType && <input type="hidden" name="diagramType" value={currentDiagramType} />}
            {currentEditedCode && <input type="hidden" name="plantUmlCode" value={currentEditedCode} />}



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
                                value={proposalJson}
                                onChange={(e) => setProposalJson(e.target.value)}
                            />
                            {state?.error && (
                                <p className="text-sm font-medium text-destructive mt-2">{state.error}</p>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2 items-start">
                            {orderedDiagrams.map((key, index) => (
                                <GenerateButton key={key} diagramType={key} agent={diagramAgents[index]} />
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

                    {state.imageUrl && currentDiagramType && currentEditedCode !== undefined && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">المخطط المعروض</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DiagramViewer
                                    title={diagramConfig[currentDiagramType].title}
                                    imageUrl={state.imageUrl}
                                    plantUmlCode={currentEditedCode}
                                    onCodeChange={handleCodeChange}
                                />
                            </CardContent>
                            <CardFooter>
                                {hasChanges && <RenderButton />}
                            </CardFooter>
                        </Card>
                    )}
                </div>
            </div>
        </form>
    );
}
