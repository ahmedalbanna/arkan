'use client';

import React, { useState } from 'react';
import type { ProjectProposal } from '@/ai/schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pin, Briefcase, Users, ShieldAlert, BadgeEuro, Calendar, CheckCircle, Flag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface EditableFieldProps {
    value: string | number;
    path: string;
    onUpdate: (path: string, value: any) => void;
    multiline?: boolean;
    type?: string;
    className?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({ value, path, onUpdate, multiline = false, type = 'text', className = '' }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);

    const handleSave = () => {
        if (currentValue !== value) {
            onUpdate(path, currentValue);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !multiline) {
            handleSave();
        }
        if (e.key === 'Escape') {
            setCurrentValue(value);
            setIsEditing(false);
        }
    };
    
    if (isEditing) {
        if (multiline) {
            return (
                <Textarea
                    value={String(currentValue)}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    onBlur={handleSave}
                    autoFocus
                    className="bg-background/80"
                    rows={5}
                />
            );
        }
        return (
            <Input
                type={type}
                value={String(currentValue)}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                autoFocus
                className="bg-background/80"
            />
        );
    }
    
    return (
        <div onDoubleClick={() => setIsEditing(true)} className={`min-h-[2.5rem] p-2 -m-2 rounded-md hover:bg-muted/50 cursor-pointer ${className}`}>
            {multiline ? <ReactMarkdown className="prose dark:prose-invert max-w-none text-muted-foreground">{String(value)}</ReactMarkdown> : <div className="text-muted-foreground">{String(value)}</div>}
        </div>
    );
};


export default function ProposalViewer({ proposal, onUpdate }: { proposal: ProjectProposal; onUpdate: (path: string, value: any) => void; }) {
    if (!proposal) return null;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Badge variant="secondary" className="w-fit mb-2">
                        <EditableField value={proposal.category} path="category" onUpdate={onUpdate} />
                    </Badge>
                    <CardTitle className="font-headline text-2xl text-primary">
                        <EditableField value={proposal.title} path="title" onUpdate={onUpdate} />
                    </CardTitle>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-lg"><Pin className="h-5 w-5 text-primary" /> Objective</CardTitle>
                </CardHeader>
                <CardContent>
                    <EditableField value={proposal.objective} path="objective" onUpdate={onUpdate} multiline />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-lg"><Briefcase className="h-5 w-5 text-primary" /> Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                     <EditableField value={proposal.methodology} path="methodology" onUpdate={onUpdate} multiline />
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline text-lg"><Calendar className="h-5 w-5 text-primary" /> Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2"><strong>Start Date:</strong> <EditableField value={proposal.timeline.startDate} path="timeline.startDate" onUpdate={onUpdate} type="date" /></div>
                        <div><strong>End Date:</strong> <span className="text-muted-foreground">{proposal.timeline.endDate}</span></div>
                        <h4 className="font-semibold">Phases:</h4>
                        <ul className="space-y-2 text-muted-foreground">
                            {proposal.timeline.phases.map((phase, index) => (
                                <li key={index} className="flex justify-between items-center gap-2">
                                    <EditableField value={phase.name} path={`timeline.phases.${index}.name`} onUpdate={onUpdate} />
                                    <div className="flex items-center gap-1">
                                      (<EditableField value={phase.durationWeeks} path={`timeline.phases.${index}.durationWeeks`} onUpdate={onUpdate} type="number" className="w-16 text-center" /> weeks)
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline text-lg"><BadgeEuro className="h-5 w-5 text-primary" /> Budget</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex gap-2">
                          <strong>Total:</strong> 
                          <span className="text-muted-foreground">{proposal.budget.totalAmount.toLocaleString()}</span>
                          <EditableField value={proposal.budget.currency} path="budget.currency" onUpdate={onUpdate} className="w-20" />
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="text-left">Cost</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {proposal.budget.breakdown.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell><EditableField value={item.item} path={`budget.breakdown.${index}.item`} onUpdate={onUpdate} /></TableCell>
                                        <TableCell className="text-left"><EditableField value={item.cost} path={`budget.breakdown.${index}.cost`} onUpdate={onUpdate} type="number" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-lg"><Flag className="h-5 w-5 text-primary" /> Expected Outcomes</CardTitle>
                </CardHeader>
                <CardContent>
                     <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        {proposal.expected_outcome.map((outcome, index) => (
                            <li key={index}><EditableField value={outcome} path={`expected_outcome.${index}`} onUpdate={onUpdate} multiline /></li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-lg"><CheckCircle className="h-5 w-5 text-primary" /> Success Criteria & Evaluation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <h4 className="font-semibold">Criteria:</h4>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        {proposal.success_criteria.map((criterion, index) => (
                            <li key={index}><EditableField value={criterion} path={`success_criteria.${index}`} onUpdate={onUpdate} multiline /></li>
                        ))}
                    </ul>
                     <h4 className="font-semibold pt-4 border-t">Evaluation Plan:</h4>
                     <EditableField value={proposal.evaluation} path="evaluation" onUpdate={onUpdate} multiline />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-lg"><Users className="h-5 w-5 text-primary" /> Stakeholders</CardTitle>
                </CardHeader>
                <CardContent>
                    {proposal.stakeholders.map((stakeholder, index) => (
                        <div key={index} className="mb-4 not-last:border-b not-last:pb-4">
                            <strong><EditableField value={stakeholder.name} path={`stakeholders.${index}.name`} onUpdate={onUpdate} /></strong> - 
                            <EditableField value={stakeholder.role} path={`stakeholders.${index}.role`} onUpdate={onUpdate} />
                            <EditableField value={stakeholder.interest} path={`stakeholders.${index}.interest`} onUpdate={onUpdate} multiline />
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-lg"><ShieldAlert className="h-5 w-5 text-primary" /> Risks & Mitigations</CardTitle>
                </CardHeader>
                <CardContent>
                    {proposal.risks.map((risk, index) => (
                        <div key={index} className="mb-4 not-last:border-b not-last:pb-4">
                            <div><strong>Risk:</strong> <EditableField value={risk.description} path={`risks.${index}.description`} onUpdate={onUpdate} multiline/></div>
                            <div><strong>Mitigation:</strong> <EditableField value={risk.mitigation} path={`risks.${index}.mitigation`} onUpdate={onUpdate} multiline/></div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
