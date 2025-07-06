'use client';

import { useFormStatus } from 'react-dom';
import { useActionState, useState, useEffect } from 'react';
import { handleGenerateProposal } from '@/app/generate-proposal/actions';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, Sparkles, Calendar, BadgeEuro, Briefcase, Users, CheckCircle, ShieldAlert, BarChart, Pin, Milestone, Copy, Check, FileDown, FileText } from 'lucide-react';
import type { ProjectProposal } from '@/ai/schemas';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useHistory } from '@/hooks/use-history';
import { useAgents } from '@/hooks/use-agents';
import ReactMarkdown from 'react-markdown';
import { exportProposalAsDocx } from '@/lib/docx-exporter';
import { type TemplateKey, templates } from '@/lib/docx-styles';

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="font-headline">
      {pending ? (
        <>
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          جاري التوليد...
        </>
      ) : (
        <>
         <Sparkles className="ml-2 h-4 w-4" />
          توليد المقترح
        </>
      )}
    </Button>
  );
}

function ProposalReport({ proposal }: { proposal: ProjectProposal }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (!proposal) return;
    const jsonString = JSON.stringify(proposal, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };
  
  const handleExportDOCX = async () => {
    const templateKey = (localStorage.getItem('arkan-docx-template') as TemplateKey) || 'modern';
    const template = templates[templateKey];
    if (template) {
      await exportProposalAsDocx(proposal, template.styles);
    } else {
      // Fallback to modern if invalid key is stored
      await exportProposalAsDocx(proposal, templates.modern.styles);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div className="flex-grow">
                <Badge variant="secondary" className="w-fit mb-2">{proposal.category}</Badge>
                <CardTitle className="font-headline text-3xl text-primary">{proposal.title}</CardTitle>
            </div>
            <div className="flex gap-2 flex-shrink-0">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy JSON">
                                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isCopied ? 'تم النسخ!' : 'نسخ JSON'}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={handleExportDOCX} aria-label="Export DOCX">
                                <FileText className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>تصدير كملف DOCX</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="flex items-center gap-2 font-headline text-xl mb-2"><Pin className="h-5 w-5 text-primary" /> الهدف</h3>
          <p className="text-muted-foreground">{proposal.objective}</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="methodology">
            <AccordionTrigger className="font-headline text-xl"><Briefcase className="ml-2 h-5 w-5 text-primary" /> المنهجية</AccordionTrigger>
            <AccordionContent className="prose dark:prose-invert max-w-none text-muted-foreground">
              <ReactMarkdown>{proposal.methodology}</ReactMarkdown>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="timeline">
            <AccordionTrigger className="font-headline text-xl"><Calendar className="ml-2 h-5 w-5 text-primary" /> الجدول الزمني</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>تاريخ البدء:</strong> {proposal.timeline.startDate}</p>
                <p><strong>تاريخ الانتهاء:</strong> {proposal.timeline.endDate}</p>
                <h4 className="font-semibold pt-2">المراحل:</h4>
                <ul className="list-disc list-inside">
                  {proposal.timeline.phases.map((phase, i) => (
                    <li key={i}>{phase.name} ({phase.durationWeeks} أسابيع)</li>
                  ))}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="budget">
            <AccordionTrigger className="font-headline text-xl"><BadgeEuro className="ml-2 h-5 w-5 text-primary" /> الميزانية</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>المبلغ الإجمالي:</strong> {proposal.budget.totalAmount.toLocaleString()} {proposal.budget.currency}</p>
                <h4 className="font-semibold pt-2">التفاصيل:</h4>
                <ul className="list-disc list-inside">
                  {proposal.budget.breakdown.map((item, i) => (
                    <li key={i}>{item.item}: {item.cost.toLocaleString()} {proposal.budget.currency}</li>
                  ))}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="outcomes">
            <AccordionTrigger className="font-headline text-xl"><CheckCircle className="ml-2 h-5 w-5 text-primary" /> النتائج المتوقعة</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                {proposal.expected_outcome.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="success_criteria">
            <AccordionTrigger className="font-headline text-xl"><Milestone className="ml-2 h-5 w-5 text-primary" /> معايير النجاح</AccordionTrigger>
            <AccordionContent>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {proposal.success_criteria.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="evaluation">
            <AccordionTrigger className="font-headline text-xl"><BarChart className="ml-2 h-5 w-5 text-primary" /> التقييم</AccordionTrigger>
            <AccordionContent className="prose dark:prose-invert max-w-none text-muted-foreground">
                <ReactMarkdown>{proposal.evaluation}</ReactMarkdown>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="stakeholders">
            <AccordionTrigger className="font-headline text-xl"><Users className="ml-2 h-5 w-5 text-primary" /> أصحاب المصلحة</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {proposal.stakeholders.map((sh, i) => (
                  <div key={i} className="p-3 bg-muted/50 rounded-md">
                    <p className="font-semibold">{sh.name} <span className="text-sm font-normal text-muted-foreground">({sh.role})</span></p>
                    <p className="text-sm text-muted-foreground">{sh.interest}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="risks">
            <AccordionTrigger className="font-headline text-xl"><ShieldAlert className="ml-2 h-5 w-5 text-primary" /> المخاطر</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {proposal.risks.map((risk, i) => (
                   <div key={i} className="p-3 bg-muted/50 rounded-md">
                    <p className="font-semibold">{risk.description}</p>
                    <p className="text-sm text-muted-foreground"><strong>استراتيجية التخفيف:</strong> {risk.mitigation}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}


export default function ProposalGenerator() {
  const initialState: { error?: string; proposal?: ProjectProposal } = {};
  const [state, formAction] = useActionState(handleGenerateProposal, initialState);
  const { addHistoryEntry } = useHistory();
  const { agents, isLoaded } = useAgents();

  const agent = agents.find(a => a.id === 'generate-proposal');

  useEffect(() => {
    if (state.proposal) {
      addHistoryEntry({
        type: 'proposal',
        title: `مقترح مشروع: ${state.proposal.title}`,
        proposal: state.proposal,
      });
    }
  }, [state.proposal, addHistoryEntry]);


  return (
    <>
      <Card>
        <form action={formAction}>
          {agent && <input type="hidden" name="prompt" value={agent.prompt} />}
          <CardHeader>
            <CardTitle className="font-headline">فكرة المشروع</CardTitle>
            <CardDescription>
              اكتب وصفًا موجزًا لفكرة مشروعك. كلما كانت الفكرة أوضح، كان المقترح أفضل.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              name="projectIdea"
              placeholder="مثال: نظام لإدارة علاقات العملاء (CRM) لتحسين كفاءة المبيعات وخدمة العملاء."
              rows={5}
              required
            />
            {state?.error && (
               <p className="text-sm font-medium text-destructive mt-2">{state.error}</p>
            )}
          </CardContent>
          <CardFooter>
            <SubmitButton disabled={!agent?.isEnabled} />
             {!isLoaded ? <Loader2 className="h-4 w-4 animate-spin" /> : !agent?.isEnabled && (
                <p className="text-sm text-destructive mr-4">تم تعطيل هذا الوكيل.</p>
            )}
          </CardFooter>
        </form>
      </Card>

      {state?.proposal && (
        <div className="mt-8">
          <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle className="font-headline">مقترح المشروع المولد</AlertTitle>
              <AlertDescription>
                  هذا هو مقترح المشروع الذي تم إنشاؤه بواسطة الذكاء الاصطناعي بناءً على فكرتك.
              </AlertDescription>
          </Alert>
          <ProposalReport proposal={state.proposal} />
        </div>
      )}
    </>
  );
}
