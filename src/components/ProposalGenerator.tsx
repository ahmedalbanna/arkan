'use client';

import { useFormStatus } from 'react-dom';
import { useActionState, useState } from 'react';
import { handleGenerateProposal } from '@/app/generate-proposal/actions';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Loader2, Sparkles, Calendar, BadgeEuro, Briefcase, Users, CheckCircle, ShieldAlert, BarChart, Pin, Milestone, Copy, Check, FileDown, FileText } from 'lucide-react';
import type { GenerateProposalOutput } from '@/ai/flows/generate-proposal';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

// New imports for file generation
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, HeadingLevel, AlignmentType, TextRun, Table, TableRow, TableCell, WidthType } from 'docx';


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="font-headline">
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

function ProposalReport({ proposal }: { proposal: GenerateProposalOutput }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (!proposal) return;
    const jsonString = JSON.stringify(proposal, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleExportPDF = () => {
    if (typeof window === 'undefined') return;

    const {
      title,
      category,
      objective,
      methodology,
      timeline,
      budget,
      expected_outcome,
      success_criteria,
      evaluation,
      stakeholders,
      risks,
    } = proposal;

    const reportHtml = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
              line-height: 1.6; 
              direction: rtl; 
              text-align: right;
              margin: 2rem;
            }
            h1, h2, h3 { color: #2E3192; }
            h1 { font-size: 2.5em; text-align: center; margin-bottom: 0.5em; }
            h2 { font-size: 1.75em; margin-top: 1.5em; margin-bottom: 0.8em; border-bottom: 2px solid #D4AF37; padding-bottom: 0.3em; }
            h3 { font-size: 1.25em; margin-top: 1.5em; margin-bottom: 0.5em; }
            p, li { margin-bottom: 1em; color: #333; }
            ul { padding-right: 20px; }
            strong { font-weight: bold; }
            .badge { display: inline-block; padding: 0.25em 0.6em; font-size: 75%; font-weight: 700; line-height: 1; text-align: center; white-space: nowrap; vertical-align: baseline; border-radius: 0.25rem; background-color: #F0F0F0; color: #333; margin-bottom: 1em; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; }
            .table th { background-color: #f2f2f2; }
            @media print { body { margin: 1in; } }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p class="badge">${category}</p>

          <h2>الهدف</h2>
          <p>${objective}</p>

          <h2>المنهجية</h2>
          <p>${methodology.replace(/\n/g, '<br/>')}</p>

          <h2>الجدول الزمني</h2>
          <p><strong>تاريخ البدء:</strong> ${timeline.startDate}</p>
          <p><strong>تاريخ الانتهاء:</strong> ${timeline.endDate}</p>
          <h3>المراحل:</h3>
          <ul>${timeline.phases.map(p => `<li>${p.name} (${p.durationWeeks} أسابيع)</li>`).join('')}</ul>

          <h2>الميزانية</h2>
          <p><strong>المبلغ الإجمالي:</strong> ${budget.totalAmount.toLocaleString()} ${budget.currency}</p>
          <h3>التفاصيل:</h3>
          <table class="table">
            <thead><tr><th>البند</th><th>التكلفة</th></tr></thead>
            <tbody>${budget.breakdown.map(b => `<tr><td>${b.item}</td><td>${b.cost.toLocaleString()} ${budget.currency}</td></tr>`).join('')}</tbody>
          </table>

          <h2>النتائج المتوقعة</h2>
          <ul>${expected_outcome.map(o => `<li>${o}</li>`).join('')}</ul>
          
          <h2>معايير النجاح</h2>
          <ul>${success_criteria.map(sc => `<li>${sc}</li>`).join('')}</ul>

          <h2>التقييم</h2>
          <p>${evaluation}</p>

          <h2>أصحاب المصلحة</h2>
          ${stakeholders.map(s => `
            <div>
              <h3>${s.name} (${s.role})</h3>
              <p>${s.interest}</p>
            </div>
          `).join('')}

          <h2>المخاطر واستراتيجيات التخفيف</h2>
          ${risks.map(r => `
            <div>
              <h3>${r.description}</h3>
              <p><strong>استراتيجية التخفيف:</strong> ${r.mitigation}</p>
            </div>
          `).join('')}

        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(reportHtml);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const handleExportDOCX = () => {
    const {
      title,
      category,
      objective,
      methodology,
      timeline,
      budget,
      expected_outcome,
      success_criteria,
      evaluation,
      stakeholders,
      risks,
    } = proposal;

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: title, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: category, heading: HeadingLevel.HEADING_5, alignment: AlignmentType.CENTER }),
          new Paragraph({ text: '' }),

          new Paragraph({ text: "الهدف", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: objective }),
          
          new Paragraph({ text: "المنهجية", heading: HeadingLevel.HEADING_1 }),
          ...methodology.split('\n').map(p => new Paragraph({ text: p })),

          new Paragraph({ text: "الجدول الزمني", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ children: [new TextRun({ text: "تاريخ البدء: ", bold: true }), new TextRun(timeline.startDate)] }),
          new Paragraph({ children: [new TextRun({ text: "تاريخ الانتهاء: ", bold: true }), new TextRun(timeline.endDate)] }),
          new Paragraph({ text: "المراحل:", heading: HeadingLevel.HEADING_2 }),
          ...timeline.phases.map(p => new Paragraph({ text: `${p.name} (${p.durationWeeks} أسابيع)`, bullet: { level: 0 } })),

          new Paragraph({ text: "الميزانية", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ children: [new TextRun({ text: "المبلغ الإجمالي: ", bold: true }), new TextRun(`${budget.totalAmount.toLocaleString()} ${budget.currency}`)] }),
          new Paragraph({ text: "التفاصيل:", heading: HeadingLevel.HEADING_2 }),
          new Table({
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "البند", bold: true })]})] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "التكلفة", bold: true })]})] }),
                    ],
                }),
                ...budget.breakdown.map(b => new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph(b.item)] }),
                        new TableCell({ children: [new Paragraph(`${b.cost.toLocaleString()} ${budget.currency}`)] }),
                    ]
                }))
            ],
            width: {
                size: 100,
                type: WidthType.PERCENTAGE,
            },
          }),

          new Paragraph({ text: "النتائج المتوقعة", heading: HeadingLevel.HEADING_1 }),
          ...expected_outcome.map(o => new Paragraph({ text: o, bullet: { level: 0 } })),

          new Paragraph({ text: "معايير النجاح", heading: HeadingLevel.HEADING_1 }),
          ...success_criteria.map(sc => new Paragraph({ text: sc, bullet: { level: 0 } })),

          new Paragraph({ text: "التقييم", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: evaluation }),

          new Paragraph({ text: "أصحاب المصلحة", heading: HeadingLevel.HEADING_1 }),
          ...stakeholders.flatMap(s => [
              new Paragraph({ text: `${s.name} (${s.role})`, heading: HeadingLevel.HEADING_2 }),
              new Paragraph({ text: s.interest }),
          ]),

          new Paragraph({ text: "المخاطر واستراتيجيات التخفيف", heading: HeadingLevel.HEADING_1 }),
           ...risks.flatMap(r => [
              new Paragraph({ text: r.description, heading: HeadingLevel.HEADING_2 }),
              new Paragraph({ children: [new TextRun({ text: "استراتيجية التخفيف: ", bold: true }), new TextRun(r.mitigation)] }),
          ]),
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `${title.replace(/ /g, '_')}_proposal.docx`);
    });
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
                            <Button variant="outline" size="icon" onClick={handleExportPDF} aria-label="Export PDF">
                                <FileDown className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>تصدير كملف PDF</p>
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
            <AccordionContent className="text-muted-foreground whitespace-pre-line">
              {proposal.methodology}
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
            <AccordionContent className="text-muted-foreground">
                {proposal.evaluation}
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
  const initialState = {};
  const [state, formAction] = useActionState(handleGenerateProposal, initialState);

  return (
    <>
      <Card>
        <form action={formAction}>
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
            <SubmitButton />
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
