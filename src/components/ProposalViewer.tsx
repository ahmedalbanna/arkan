'use client';

import type { ProjectProposal } from '@/ai/schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pin, Briefcase, Users, ShieldAlert, BadgeEuro, Calendar, CheckCircle, Flag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ProposalViewer({ proposal }: { proposal: ProjectProposal }) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Badge variant="secondary" className="w-fit mb-2">{proposal.category}</Badge>
                    <CardTitle className="font-headline text-2xl text-primary">{proposal.title}</CardTitle>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-lg"><Pin className="h-5 w-5 text-primary" /> الهدف</CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none text-muted-foreground">
                    <ReactMarkdown>{proposal.objective}</ReactMarkdown>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-lg"><Briefcase className="h-5 w-5 text-primary" /> المنهجية</CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none text-muted-foreground">
                    <ReactMarkdown>{proposal.methodology}</ReactMarkdown>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline text-lg"><Calendar className="h-5 w-5 text-primary" /> الجدول الزمني</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p><strong>تاريخ البدء:</strong> {proposal.timeline.startDate}</p>
                        <p><strong>تاريخ الانتهاء:</strong> {proposal.timeline.endDate}</p>
                        <h4 className="font-semibold">المراحل:</h4>
                        <ul className="list-disc pr-5 space-y-1 text-muted-foreground">
                            {proposal.timeline.phases.map((phase, index) => (
                                <li key={index}>{phase.name} ({phase.durationWeeks} أسابيع)</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline text-lg"><BadgeEuro className="h-5 w-5 text-primary" /> الميزانية</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4"><strong>الإجمالي:</strong> {proposal.budget.totalAmount.toLocaleString()} {proposal.budget.currency}</p>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>البند</TableHead>
                                    <TableHead className="text-left">التكلفة</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {proposal.budget.breakdown.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.item}</TableCell>
                                        <TableCell className="text-left">{item.cost.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-lg"><Flag className="h-5 w-5 text-primary" /> النتائج المتوقعة</CardTitle>
                </CardHeader>
                <CardContent>
                     <ul className="list-disc pr-5 space-y-1 text-muted-foreground">
                        {proposal.expected_outcome.map((outcome, index) => (
                            <li key={index}>{outcome}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-lg"><CheckCircle className="h-5 w-5 text-primary" /> معايير النجاح والتقييم</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <h4 className="font-semibold">المعايير:</h4>
                    <ul className="list-disc pr-5 space-y-1 text-muted-foreground">
                        {proposal.success_criteria.map((criterion, index) => (
                            <li key={index}>{criterion}</li>
                        ))}
                    </ul>
                     <h4 className="font-semibold pt-4 border-t">خطة التقييم:</h4>
                     <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                        <ReactMarkdown>{proposal.evaluation}</ReactMarkdown>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-lg"><Users className="h-5 w-5 text-primary" /> أصحاب المصلحة</CardTitle>
                </CardHeader>
                <CardContent>
                    {proposal.stakeholders.map((stakeholder, index) => (
                        <div key={index} className="mb-4 not-last:border-b not-last:pb-4">
                            <p><strong>{stakeholder.name}</strong> ({stakeholder.role})</p>
                            <p className="text-sm text-muted-foreground">{stakeholder.interest}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-lg"><ShieldAlert className="h-5 w-5 text-primary" /> المخاطر والتخفيف</CardTitle>
                </CardHeader>
                <CardContent>
                    {proposal.risks.map((risk, index) => (
                        <div key={index} className="mb-4 not-last:border-b not-last:pb-4">
                            <p><strong>الخطر:</strong> {risk.description}</p>
                            <p className="text-sm text-muted-foreground"><strong>التخفيف:</strong> {risk.mitigation}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
