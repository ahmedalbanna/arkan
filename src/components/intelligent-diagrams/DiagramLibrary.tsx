/**
 * مكتبة المخططات - عرض وإدارة المخططات المحفوظة
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    useDiagramLibrary,
    type DiagramFilter,
    type SavedDiagram
} from '@/hooks/use-intelligent-diagrams';
import { toast } from '@/hooks/use-toast';
import {
    DIAGRAM_TYPES,
    type DiagramType
} from '@/services/intelligent-diagram-service';
import {
    Clock,
    Copy,
    Download,
    Edit,
    Eye,
    Folder,
    Grid,
    List,
    MoreVertical,
    Plus,
    Search,
    Star,
    Trash2
} from 'lucide-react';
import { useState } from 'react';
import { DiagramPreview } from './DiagramPreview';

interface DiagramLibraryProps {
    onSelectDiagram?: (diagram: SavedDiagram) => void;
    onCreateNew?: () => void;
    className?: string;
}

export function DiagramLibrary({
    onSelectDiagram,
    onCreateNew,
    className
}: DiagramLibraryProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<DiagramType | 'all'>('all');
    const [sortBy, setSortBy] = useState<'recent' | 'name' | 'type' | 'quality'>('recent');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedDiagram, setSelectedDiagram] = useState<SavedDiagram | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const filter: DiagramFilter = {
        searchTerm: searchTerm || undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        sortBy
    };

    const library = useDiagramLibrary(filter);

    // معالجة اختيار مخطط
    const handleSelectDiagram = (diagram: SavedDiagram) => {
        setSelectedDiagram(diagram);
        onSelectDiagram?.(diagram);
    };

    // معالجة معاينة مخطط
    const handlePreviewDiagram = (diagram: SavedDiagram) => {
        setSelectedDiagram(diagram);
        setShowPreview(true);
    };

    // معالجة حذف مخطط
    const handleDeleteDiagram = async (diagram: SavedDiagram) => {
        if (confirm(`هل أنت متأكد من حذف المخطط "${diagram.title}"؟`)) {
            try {
                await library.deleteDiagram(diagram.id);
                toast({
                    title: "تم الحذف",
                    description: "تم حذف المخطط بنجاح",
                });
            } catch (error) {
                toast({
                    title: "خطأ في الحذف",
                    description: "فشل في حذف المخطط",
                    variant: "destructive",
                });
            }
        }
    };

    // معالجة تبديل المفضلة
    const handleToggleFavorite = async (diagram: SavedDiagram) => {
        try {
            await library.toggleFavorite(diagram.id);
            toast({
                title: diagram.isFavorite ? "تم الإزالة من المفضلة" : "تم الإضافة للمفضلة",
                description: `تم ${diagram.isFavorite ? 'إزالة' : 'إضافة'} المخطط ${diagram.isFavorite ? 'من' : 'إلى'} المفضلة`,
            });
        } catch (error) {
            toast({
                title: "خطأ",
                description: "فشل في تحديث المفضلة",
                variant: "destructive",
            });
        }
    };

    // معالجة نسخ مخطط
    const handleDuplicateDiagram = async (diagram: SavedDiagram) => {
        try {
            const newDiagram = await library.duplicateDiagram(diagram.id);
            toast({
                title: "تم النسخ",
                description: `تم إنشاء نسخة من المخطط باسم "${newDiagram.title}"`,
            });
        } catch (error) {
            toast({
                title: "خطأ في النسخ",
                description: "فشل في نسخ المخطط",
                variant: "destructive",
            });
        }
    };

    // معالجة تحميل مخطط
    const handleDownloadDiagram = (diagram: SavedDiagram) => {
        const blob = new Blob([diagram.plantUmlCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${diagram.title.replace(/\s+/g, '_')}.puml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* رأس المكتبة */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                <Folder className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">مكتبة المخططات</CardTitle>
                                <p className="text-muted-foreground">
                                    إدارة وتنظيم مخططاتك المحفوظة
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                                {library.diagrams.length} مخطط
                            </Badge>
                            <Button onClick={onCreateNew} className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                مخطط جديد
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* أدوات البحث والتصفية */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* البحث */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="البحث في المخططات..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* التصفية */}
                        <div className="flex gap-2">
                            <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="نوع المخطط" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">جميع الأنواع</SelectItem>
                                    {Object.entries(DIAGRAM_TYPES).map(([key, type]) => (
                                        <SelectItem key={key} value={key}>
                                            {type.icon} {type.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="recent">الأحدث</SelectItem>
                                    <SelectItem value="name">الاسم</SelectItem>
                                    <SelectItem value="type">النوع</SelectItem>
                                    <SelectItem value="quality">الجودة</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex border rounded-lg">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className="rounded-r-none"
                                >
                                    <Grid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className="rounded-l-none"
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* المحتوى */}
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">الكل ({library.diagrams.length})</TabsTrigger>
                    <TabsTrigger value="favorites">
                        المفضلة ({library.diagrams.filter(d => d.isFavorite).length})
                    </TabsTrigger>
                    <TabsTrigger value="recent">الحديثة</TabsTrigger>
                    <TabsTrigger value="shared">المشتركة</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    <DiagramGrid
                        diagrams={library.diagrams}
                        viewMode={viewMode}
                        onSelect={handleSelectDiagram}
                        onPreview={handlePreviewDiagram}
                        onDelete={handleDeleteDiagram}
                        onToggleFavorite={handleToggleFavorite}
                        onDuplicate={handleDuplicateDiagram}
                        onDownload={handleDownloadDiagram}
                    />
                </TabsContent>

                <TabsContent value="favorites" className="space-y-4">
                    <DiagramGrid
                        diagrams={library.diagrams.filter(d => d.isFavorite)}
                        viewMode={viewMode}
                        onSelect={handleSelectDiagram}
                        onPreview={handlePreviewDiagram}
                        onDelete={handleDeleteDiagram}
                        onToggleFavorite={handleToggleFavorite}
                        onDuplicate={handleDuplicateDiagram}
                        onDownload={handleDownloadDiagram}
                    />
                </TabsContent>

                <TabsContent value="recent" className="space-y-4">
                    <DiagramGrid
                        diagrams={library.diagrams.slice(0, 10)}
                        viewMode={viewMode}
                        onSelect={handleSelectDiagram}
                        onPreview={handlePreviewDiagram}
                        onDelete={handleDeleteDiagram}
                        onToggleFavorite={handleToggleFavorite}
                        onDuplicate={handleDuplicateDiagram}
                        onDownload={handleDownloadDiagram}
                    />
                </TabsContent>

                <TabsContent value="shared" className="space-y-4">
                    <DiagramGrid
                        diagrams={library.diagrams.filter(d => d.isShared)}
                        viewMode={viewMode}
                        onSelect={handleSelectDiagram}
                        onPreview={handlePreviewDiagram}
                        onDelete={handleDeleteDiagram}
                        onToggleFavorite={handleToggleFavorite}
                        onDuplicate={handleDuplicateDiagram}
                        onDownload={handleDownloadDiagram}
                    />
                </TabsContent>
            </Tabs>

            {/* نافذة المعاينة */}
            {showPreview && selectedDiagram && (
                <DiagramPreview
                    diagram={{
                        ...selectedDiagram,
                        suggestions: [],
                        relatedDiagrams: [],
                        metadata: selectedDiagram.metadata || {
                            qualityScore: 85,
                            executionTime: 1200,
                            modelUsed: 'gemini-pro',
                            iterations: 1
                        }
                    }}
                    isOpen={showPreview}
                    onClose={() => setShowPreview(false)}
                />
            )}
        </div>
    );
}

// مكون شبكة المخططات
interface DiagramGridProps {
    diagrams: SavedDiagram[];
    viewMode: 'grid' | 'list';
    onSelect: (diagram: SavedDiagram) => void;
    onPreview: (diagram: SavedDiagram) => void;
    onDelete: (diagram: SavedDiagram) => void;
    onToggleFavorite: (diagram: SavedDiagram) => void;
    onDuplicate: (diagram: SavedDiagram) => void;
    onDownload: (diagram: SavedDiagram) => void;
}

function DiagramGrid({
    diagrams,
    viewMode,
    onSelect,
    onPreview,
    onDelete,
    onToggleFavorite,
    onDuplicate,
    onDownload
}: DiagramGridProps) {
    if (diagrams.length === 0) {
        return (
            <Card className="p-12">
                <div className="text-center text-muted-foreground">
                    <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">لا توجد مخططات</p>
                    <p className="text-sm">ابدأ بإنشاء مخطط جديد</p>
                </div>
            </Card>
        );
    }

    if (viewMode === 'grid') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {diagrams.map((diagram) => (
                    <DiagramCard
                        key={diagram.id}
                        diagram={diagram}
                        onSelect={() => onSelect(diagram)}
                        onPreview={() => onPreview(diagram)}
                        onDelete={() => onDelete(diagram)}
                        onToggleFavorite={() => onToggleFavorite(diagram)}
                        onDuplicate={() => onDuplicate(diagram)}
                        onDownload={() => onDownload(diagram)}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {diagrams.map((diagram) => (
                <DiagramListItem
                    key={diagram.id}
                    diagram={diagram}
                    onSelect={() => onSelect(diagram)}
                    onPreview={() => onPreview(diagram)}
                    onDelete={() => onDelete(diagram)}
                    onToggleFavorite={() => onToggleFavorite(diagram)}
                    onDuplicate={() => onDuplicate(diagram)}
                    onDownload={() => onDownload(diagram)}
                />
            ))}
        </div>
    );
}

// مكون بطاقة المخطط
interface DiagramCardProps {
    diagram: SavedDiagram;
    onSelect: () => void;
    onPreview: () => void;
    onDelete: () => void;
    onToggleFavorite: () => void;
    onDuplicate: () => void;
    onDownload: () => void;
}

function DiagramCard({
    diagram,
    onSelect,
    onPreview,
    onDelete,
    onToggleFavorite,
    onDuplicate,
    onDownload
}: DiagramCardProps) {
    const diagramType = DIAGRAM_TYPES[diagram.type];

    return (
        <Card className="group cursor-pointer transition-all hover:shadow-md">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="text-lg">{diagramType?.icon || '📊'}</div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{diagram.title}</h4>
                            <p className="text-xs text-muted-foreground">
                                {diagramType?.title || diagram.type}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {diagram.isFavorite && (
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <MoreVertical className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={onPreview}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    معاينة
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onSelect}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    تحرير
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onDuplicate}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    نسخ
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onDownload}>
                                    <Download className="h-4 w-4 mr-2" />
                                    تحميل
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={onToggleFavorite}>
                                    <Star className="h-4 w-4 mr-2" />
                                    {diagram.isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    حذف
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0" onClick={onSelect}>
                <div className="space-y-3">
                    {diagram.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                            {diagram.description}
                        </p>
                    )}

                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                {diagram.elementCount} عنصر
                            </Badge>
                            {diagram.qualityScore && (
                                <Badge variant="secondary" className="text-xs">
                                    {diagram.qualityScore}/100
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(diagram.updatedAt).toLocaleDateString('ar')}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// مكون عنصر القائمة
interface DiagramListItemProps {
    diagram: SavedDiagram;
    onSelect: () => void;
    onPreview: () => void;
    onDelete: () => void;
    onToggleFavorite: () => void;
    onDuplicate: () => void;
    onDownload: () => void;
}

function DiagramListItem({
    diagram,
    onSelect,
    onPreview,
    onDelete,
    onToggleFavorite,
    onDuplicate,
    onDownload
}: DiagramListItemProps) {
    const diagramType = DIAGRAM_TYPES[diagram.type];

    return (
        <Card className="group cursor-pointer transition-all hover:shadow-sm" onClick={onSelect}>
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <div className="text-xl">{diagramType?.icon || '📊'}</div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm truncate">{diagram.title}</h4>
                            {diagram.isFavorite && (
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{diagramType?.title || diagram.type}</span>
                            <span>•</span>
                            <span>{diagram.elementCount} عنصر</span>
                            {diagram.qualityScore && (
                                <>
                                    <span>•</span>
                                    <span>جودة: {diagram.qualityScore}/100</span>
                                </>
                            )}
                            <span>•</span>
                            <span>{new Date(diagram.updatedAt).toLocaleDateString('ar')}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onPreview();
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={onPreview}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    معاينة
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onSelect}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    تحرير
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onDuplicate}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    نسخ
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onDownload}>
                                    <Download className="h-4 w-4 mr-2" />
                                    تحميل
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={onToggleFavorite}>
                                    <Star className="h-4 w-4 mr-2" />
                                    {diagram.isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    حذف
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
