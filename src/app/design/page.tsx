
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, GripVertical, FileText, Table, Image as ImageIcon, Download } from 'lucide-react';
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

function CustomizationPanel({ setStyles, setContent }: { setStyles: React.Dispatch<React.SetStateAction<any>>, setContent: React.Dispatch<React.SetStateAction<any>> }) {
  const handleStyleChange = (key: string, value: string) => {
    setStyles((prev: any) => ({ ...prev, [key]: value }));
  };
  const handleContentChange = (key: string, value: string) => {
    setContent((prev: any) => ({ ...prev, [key]: value }));
  };

  const components = [
    { name: 'Header', icon: FileText },
    { name: 'Table', icon: Table },
    { name: 'Image', icon: ImageIcon }
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>لوحة التخصيص</CardTitle>
        <CardDescription>
          تعديل محتوى وأنماط القالب الخاص بك.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Content Management */}
        <div>
          <h3 className="text-lg font-semibold mb-2">إدارة المحتوى</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-title">عنوان القالب</Label>
              <Input id="template-title" defaultValue="تقرير المشروع السنوي" onChange={(e) => handleContentChange('title', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-body">محتوى النص</Label>
              <Textarea id="template-body" defaultValue="هذا هو ملخص للتقدم المحرز في المشروع خلال العام الماضي..." rows={5} onChange={(e) => handleContentChange('body', e.target.value)} />
            </div>
          </div>
        </div>

        <Separator />

        {/* Style Editor */}
        <div>
          <h3 className="text-lg font-semibold mb-2">محرر الأنماط</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="font-family">الخط</Label>
              <Select defaultValue="Inter" onValueChange={(value) => handleStyleChange('fontFamily', value)}>
                <SelectTrigger id="font-family">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-size">حجم الخط</Label>
              <Select defaultValue="16px" onValueChange={(value) => handleStyleChange('fontSize', value)}>
                <SelectTrigger id="font-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="14px">14px</SelectItem>
                  <SelectItem value="16px">16px</SelectItem>
                  <SelectItem value="18px">18px</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="header-color">لون العنوان</Label>
              <Input id="header-color" type="color" defaultValue="#111827" onChange={(e) => handleStyleChange('headerColor', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="text-color">لون النص</Label>
              <Input id="text-color" type="color" defaultValue="#4b5563" onChange={(e) => handleStyleChange('textColor', e.target.value)} />
            </div>
          </div>
        </div>

        <Separator />

        {/* Component Library */}
        <div>
          <h3 className="text-lg font-semibold mb-2">مكتبة المكونات</h3>
          <div className="grid grid-cols-3 gap-2">
            {components.map((component) => (
              <div key={component.name} className="flex flex-col items-center justify-center p-2 border rounded-md bg-muted/50 cursor-grab">
                <component.icon className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs mt-1 text-muted-foreground">{component.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />
        
        {/* Export Options */}
        <div>
           <h3 className="text-lg font-semibold mb-2">خيارات التصدير</h3>
           <div className="flex gap-2">
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" /> DOCX
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" /> PPTX
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" /> PDF
              </Button>
           </div>
        </div>

      </CardContent>
    </Card>
  )
}

function PreviewPanel({ styles, content }: { styles: any, content: any }) {
  return (
    <Card className="h-full min-h-[500px] lg:h-[calc(100vh-160px)]">
      <CardHeader>
        <CardTitle>معاينة القالب</CardTitle>
        <CardDescription>هذه معاينة حية للتغييرات التي تجريها.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[calc(100vh-280px)] rounded-lg border-2 border-dashed bg-muted p-8 overflow-y-auto">
          <div style={{ fontFamily: styles.fontFamily, fontSize: styles.fontSize, color: styles.textColor }}>
            <h1 style={{ color: styles.headerColor, fontSize: '2em' }} className="font-bold mb-4 pb-2 border-b">{content.title}</h1>
            <p className="whitespace-pre-wrap leading-relaxed">
              {content.body}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


export default function DesignPage() {
  const [styles, setStyles] = useState({
    fontFamily: 'Inter',
    fontSize: '16px',
    headerColor: '#111827',
    textColor: '#4b5563',
  });
  const [content, setContent] = useState({
    title: 'تقرير المشروع السنوي',
    body: 'هذا هو ملخص للتقدم المحرز في المشروع خلال العام الماضي...',
  });

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Palette className="w-10 h-10" />
          استوديو التصميم
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          أنشئ وخصص ميزاتك الجديدة هنا.
        </p>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <CustomizationPanel setStyles={setStyles} setContent={setContent} />
            </div>
            <div className="lg:col-span-2">
                <PreviewPanel styles={styles} content={content} />
            </div>
        </div>
    </div>
  );
}
