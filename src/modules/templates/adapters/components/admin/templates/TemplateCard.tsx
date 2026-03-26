'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DeleteTemplateDialog } from './DeleteTemplateDialog';
import { ReportTemplate, DocxTemplate, PptxTemplate } from '@/infrastructure/utils/types';

type TemplateData = DocxTemplate | PptxTemplate | ReportTemplate;

interface TemplateCardProps {
  template: TemplateData;
  templateType: 'docx' | 'pptx' | 'report';
  onEdit: () => void;
}

export function TemplateCard({ template, templateType, onEdit }: TemplateCardProps) {
  const imageUrl = 'imageUrl' in template ? template.imageUrl : 'https://placehold.co/400x225.png';
  const dataAiHint = 'dataAiHint' in template ? template.dataAiHint : 'template card';

  const isDefault = 'isDefault' in template && template.isDefault;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle>{template.name}</CardTitle>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                        <MoreHorizontal className="h-4 w-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={onEdit}>Edit</DropdownMenuItem>
                    {!isDefault && (
                        <DeleteTemplateDialog templateId={template.id} templateName={template.name} templateType={templateType}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Delete</DropdownMenuItem>
                        </DeleteTemplateDialog>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {templateType === 'report' && 'content' in template && template.content ? (
            <div className="h-[225px] bg-muted/50 rounded-md p-4 overflow-y-auto">
                <p className="text-sm font-medium mb-2">Structure:</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                    {(template.content as any[]).slice(0, 3).map((chapter: any, i: number) => (
                        <li key={i}>
                            <span className="font-semibold">{chapter.title}</span>
                            <ul className="list-disc pl-5">
                                {(chapter.sections as any[]).slice(0, 2).map((section: any, j: number) => (
                                    <li key={j}>{section.title}</li>
                                ))}
                                {chapter.sections.length > 2 && <li>...</li>}
                            </ul>
                        </li>
                    ))}
                    {template.content.length > 3 && <li>...and more chapters</li>}
                </ul>
            </div>
        ) : (
            <Image src={imageUrl || 'https://placehold.co/400x225.png'} alt={template.name} width={400} height={225} className="w-full h-auto rounded-md object-cover" data-ai-hint={dataAiHint} />
        )}
      </CardContent>
    </Card>
  );
}
