'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { handleGenerateSection, type ReportState, type SectionName } from '@/app/generate-report/actions';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, Sparkles, BookText, Library, TestTube2, Waypoints, Code, Flag } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

const sectionConfig: { [key in SectionName]: { title: string; icon: React.ElementType } } = {
    literatureReview: { title: "مراجعة الأدبيات", icon: Library },
    systemAnalysis: { title: "تحليل النظام", icon: Waypoints },
    designStrategy: { title: "استراتيجية التصميم", icon: BookText },
    systemDesign: { title: "تصميم النظام", icon: Code },
    systemProgramming: { title: "برمجة النظام", icon: Code },
    systemTesting: { title: "اختبار النظام", icon: TestTube2 },
    conclusion: { title: "الخاتمة", icon: Flag },
};


function GenerateButton({ section }: { section: SectionName }) {
    const { pending } = useFormStatus();
    const [lastClicked, setLastClicked] = useState<SectionName | null>(null);

    return (
        <Button
            type="submit"
            name="sectionToGenerate"
            value={section}
            onClick={() => setLastClicked(section)}
            disabled={pending}
            variant="secondary"
            className="w-full justify-start"
        >
            {pending && lastClicked === section ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
                <Sparkles className="ml-2 h-4 w-4" />
            )}
            توليد قسم: {sectionConfig[section].title}
        </Button>
    );
}

function ReportSection({ title, content, icon: Icon }: { title: string; content?: string; icon: React.ElementType }) {
    if (!content) return null;

    return (
        <AccordionItem value={title}>
            <AccordionTrigger className="font-headline text-xl">
                <Icon className="ml-2 h-5 w-5 text-primary" /> {title}
            </AccordionTrigger>
            <AccordionContent className="prose dark:prose-invert max-w-none whitespace-pre-wrap p-4 text-muted-foreground">
                {content}
            </AccordionContent>
        </AccordionItem>
    );
}

export default function ReportGenerator() {
    const initialState: ReportState = { sections: {} };
    const [state, formAction] = useActionState(handleGenerateSection, initialState);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                           {Object.keys(sectionConfig).map(key => (
                               <GenerateButton key={key} section={key as SectionName} />
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
                            تم توليد قسم "{sectionConfig[state.lastGenerated].title}". يمكنك عرضه أدناه.
                        </AlertDescription>
                    </Alert>
                )}
                 <Accordion type="single" collapsible className="w-full space-y-4" defaultValue={state.lastGenerated ? sectionConfig[state.lastGenerated].title : undefined}>
                    {Object.entries(sectionConfig).map(([key, {title, icon}]) => (
                        <ReportSection
                            key={key}
                            title={title}
                            icon={icon}
                            content={state.sections[key as SectionName]}
                        />
                    ))}
                </Accordion>
            </div>
        </div>
    );
}
