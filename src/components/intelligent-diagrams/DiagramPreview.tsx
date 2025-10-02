/**
 * مكون معاينة المخطط
 * يعرض المخطط المولد مع خيارات التحرير والتصدير
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { type DiagramResult } from '@/services/intelligent-diagram-service';
import {
    AlertTriangle,
    CheckCircle,
    Code,
    Copy,
    Download,
    Edit,
    Eye,
    FileText,
    Image as ImageIcon,
    Info,
    Maximize2,
    Minimize2,
    RotateCw,
    Share2,
    Sparkles
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface DiagramPreviewProps {
    diagram: DiagramResult;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: (newCode: string) => void;
    className?: string;
}

export function DiagramPreview({
    diagram,
    isOpen,
    onClose,
    onEdit,
    className
}: DiagramPreviewProps) {
    const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'info'>('preview');
    const [editedCode, setEditedCode] = useState(diagram.plantUmlCode);
    const [isEditing, setIsEditing] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [imageError, setImageError] = useState<string>('');
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const codeRef = useRef<HTMLTextAreaElement>(null);

    // تحديث الكود المحرر عند تغيير المخطط
    useEffect(() => {
        setEditedCode(diagram.plantUmlCode);
    }, [diagram.plantUmlCode]);

    // توليد صورة المخطط
    useEffect(() => {
        if (isOpen && activeTab === 'preview') {
            generateDiagramImage();
        }
    }, [isOpen, activeTab, editedCode]);

    const generateDiagramImage = async () => {
        setIsGeneratingImage(true);
        setImageError('');

        try {
            // استخدام PlantUML Server لتوليد الصورة
            const encodedCode = encodeURIComponent(editedCode);
            const plantUmlServerUrl = `http://www.plantuml.com/plantuml/png/${btoa(editedCode)}`;

            // التحقق من صحة الصورة
            const img = new Image();
            img.onload = () => {
                setImageUrl(plantUmlServerUrl);
                setIsGeneratingImage(false);
            };
            img.onerror = () => {
                setImageError('فشل في توليد صورة المخطط. تحقق من صحة كود PlantUML.');
                setIsGeneratingImage(false);
            };
            img.src = plantUmlServerUrl;

        } catch (error) {
            setImageError('حدث خطأ أثناء توليد صورة المخطط.');
            setIsGeneratingImage(false);
        }
    };

    // نسخ الكود
    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(editedCode);
            toast({
                title: "تم النسخ",
                description: "تم نسخ كود PlantUML إلى الحافظة",
            });
        } catch (error) {
            toast({
                title: "خطأ في النسخ",
                description: "فشل في نسخ الكود إلى الحافظة",
                variant: "destructive",
            });
        }
    };

    // حفظ التعديلات
    const handleSaveEdit = () => {
        onEdit?.(editedCode);
        setIsEditing(false);
        generateDiagramImage();
        toast({
            title: "تم الحفظ",
            description: "تم حفظ التعديلات على المخطط",
        });
    };

    // إلغاء التعديل
    const handleCancelEdit = () => {
        setEditedCode(diagram.plantUmlCode);
        setIsEditing(false);
    };

    // تحميل الملف
    const handleDownload = (format: 'puml' | 'png' | 'svg') => {
        switch (format) {
            case 'puml':
                downloadAsFile(editedCode, `${diagram.title.replace(/\s+/g, '_')}.puml`, 'text/plain');
                break;
            case 'png':
                if (imageUrl) {
                    downloadImage(imageUrl, `${diagram.title.replace(/\s+/g, '_')}.png`);
                }
                break;
            case 'svg':
                const svgUrl = `http://www.plantuml.com/plantuml/svg/${btoa(editedCode)}`;
                downloadImage(svgUrl, `${diagram.title.replace(/\s+/g, '_')}.svg`);
                break;
        }
    };

    // تحميل ملف نصي
    const downloadAsFile = (content: string, filename: string, mimeType: string) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // تحميل صورة
    const downloadImage = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            toast({
                title: "خطأ في التحميل",
                description: "فشل في تحميل الصورة",
                variant: "destructive",
            });
        }
    };

    // مشاركة المخطط
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: diagram.title,
                    text: diagram.description,
                    url: window.location.href
                });
            } catch (error) {
                // المستخدم ألغى المشاركة
            }
        } else {
            // نسخ الرابط
            await navigator.clipboard.writeText(window.location.href);
            toast({
                title: "تم النسخ",
                description: "تم نسخ رابط المخطط إلى الحافظة",
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={`max-w-6xl h-[90vh] ${isFullscreen ? 'max-w-full h-screen' : ''} ${className}`}>
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-500" />
                            <DialogTitle className="text-xl">{diagram.title}</DialogTitle>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            جودة: {diagram.metadata.qualityScore}/100
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                        >
                            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleShare}>
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="flex-1 flex flex-col">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="preview" className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            معاينة
                        </TabsTrigger>
                        <TabsTrigger value="code" className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            الكود
                        </TabsTrigger>
                        <TabsTrigger value="info" className="flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            المعلومات
                        </TabsTrigger>
                    </TabsList>

                    {/* معاينة المخطط */}
                    <TabsContent value="preview" className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                    {diagram.elementCount} عنصر
                                </Badge>
                                <Badge variant="outline">
                                    {diagram.type}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={generateDiagramImage}
                                    disabled={isGeneratingImage}
                                >
                                    <RotateCw className={`h-4 w-4 ${isGeneratingImage ? 'animate-spin' : ''}`} />
                                    تحديث
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownload('png')}
                                    disabled={!imageUrl}
                                >
                                    <Download className="h-4 w-4" />
                                    PNG
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownload('svg')}
                                >
                                    <Download className="h-4 w-4" />
                                    SVG
                                </Button>
                            </div>
                        </div>

                        <Card className="flex-1 flex flex-col">
                            <CardContent className="p-0 flex-1 flex items-center justify-center">
                                {isGeneratingImage ? (
                                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                        <p>جاري توليد صورة المخطط...</p>
                                    </div>
                                ) : imageError ? (
                                    <Alert className="m-4">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>{imageError}</AlertDescription>
                                    </Alert>
                                ) : imageUrl ? (
                                    <div className="w-full h-full overflow-auto p-4">
                                        <img
                                            src={imageUrl}
                                            alt={diagram.title}
                                            className="max-w-full h-auto mx-auto"
                                            style={{ minHeight: '200px' }}
                                        />
                                    </div>
                                ) : (
                                    <div className="text-muted-foreground">
                                        <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>لا توجد صورة متاحة</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* عرض الكود */}
                    <TabsContent value="code" className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                    {editedCode.split('\n').length} سطر
                                </Badge>
                                <Badge variant="outline">
                                    PlantUML
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                {isEditing ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCancelEdit}
                                        >
                                            إلغاء
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleSaveEdit}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            حفظ
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCopyCode}
                                        >
                                            <Copy className="h-4 w-4" />
                                            نسخ
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            <Edit className="h-4 w-4" />
                                            تحرير
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDownload('puml')}
                                        >
                                            <Download className="h-4 w-4" />
                                            تحميل
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        <Card className="flex-1 flex flex-col">
                            <CardContent className="p-0 flex-1">
                                <Textarea
                                    ref={codeRef}
                                    value={editedCode}
                                    onChange={(e) => setEditedCode(e.target.value)}
                                    readOnly={!isEditing}
                                    className="w-full h-full resize-none border-0 font-mono text-sm"
                                    placeholder="كود PlantUML..."
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* معلومات المخطط */}
                    <TabsContent value="info" className="flex-1 overflow-auto">
                        <div className="space-y-6">
                            {/* معلومات أساسية */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Info className="h-5 w-5" />
                                        معلومات المخطط
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm font-medium mb-1">العنوان</div>
                                            <div className="text-sm text-muted-foreground">{diagram.title}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium mb-1">النوع</div>
                                            <Badge variant="outline">{diagram.type}</Badge>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium mb-1">عدد العناصر</div>
                                            <div className="text-sm text-muted-foreground">{diagram.elementCount}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium mb-1">نقاط الجودة</div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm font-semibold text-green-600">
                                                    {diagram.metadata.qualityScore}/100
                                                </div>
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full"
                                                        style={{ width: `${diagram.metadata.qualityScore}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {diagram.description && (
                                        <div>
                                            <div className="text-sm font-medium mb-1">الوصف</div>
                                            <div className="text-sm text-muted-foreground">{diagram.description}</div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* إحصائيات الأداء */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5" />
                                        إحصائيات الأداء
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm font-medium mb-1">وقت التوليد</div>
                                            <div className="text-sm text-muted-foreground">
                                                {diagram.metadata.executionTime}ms
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium mb-1">النموذج المستخدم</div>
                                            <div className="text-sm text-muted-foreground">
                                                {diagram.metadata.modelUsed}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium mb-1">عدد التكرارات</div>
                                            <div className="text-sm text-muted-foreground">
                                                {diagram.metadata.iterations}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium mb-1">حجم الكود</div>
                                            <div className="text-sm text-muted-foreground">
                                                {editedCode.length} حرف
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* التوصيات */}
                            {diagram.suggestions.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                                            توصيات للتحسين
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {diagram.suggestions.map((suggestion, index) => (
                                                <li key={index} className="flex items-start gap-2 text-sm">
                                                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                                                    <span className="text-muted-foreground">{suggestion}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            {/* العناصر المكتشفة */}
                            {diagram.elements.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            العناصر المكتشفة
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {diagram.elements.map((element, index) => (
                                                <Badge key={index} variant="secondary" className="text-xs">
                                                    {element}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
