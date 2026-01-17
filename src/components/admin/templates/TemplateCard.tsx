'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DeleteTemplateDialog } from './DeleteTemplateDialog';
import { ReportTemplate, DocxTemplate, PptxTemplate } from '@/lib/models';

type TemplateData = DocxTemplate | PptxTemplate | ReportTemplate;

interface TemplateCardProps {
  template: TemplateData;
  templateType: 'docx' | 'pptx' | 'report';
  onEdit: () => void;
}

export function TemplateCard({ template, templateType, onEdit }: TemplateCardProps) {
  const imageUrl = 'imageUrl' in template ? template.imageUrl : 'https://placehold.co/400x225.png';
  const dataAiHint = 'dataAiHint' in template ? template.dataAiHint : 'template card';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle>{template.name}</CardTitle>
            <DeleteTemplateDialog templateId={template.id} templateName={template.name} templateType={templateType}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                            <MoreHorizontal className="h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={onEdit}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </DeleteTemplateDialog>
        </div>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {template instanceof ReportTemplate ? (
            <div className="h-[225px] bg-muted/50 rounded-md p-4 overflow-y-auto">
                <p className="text-sm font-medium mb-2">Sections:</p>
                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    {template.content?.flatMap(c => c.sections.map(s => s.title)).slice(0, 7).map((title, i) => <li key={i}>{title}</li>)}
                    {template.content && template.content.flatMap(c => c.sections).length > 7 && <li>...and more</li>}
                </ul>
            </div>
        ) : (
            <Image src={imageUrl || 'https://placehold.co/400x225.png'} alt={template.name} width={400} height={225} className="w-full h-auto rounded-md object-cover" data-ai-hint={dataAiHint} />
        )}
      </CardContent>
    </Card>
  );
}
