/**
 * مكون اختيار نوع المخطط
 * يعرض جميع أنواع المخططات المتاحة مع معلومات مفصلة
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DIAGRAM_TYPES,
    type DiagramCategory,
    type DiagramType
} from '@/services/intelligent-diagram-service';
import { Grid, List, Search } from 'lucide-react';
import { useState } from 'react';

interface DiagramTypeSelectorProps {
    selectedType: DiagramType;
    onTypeChange: (type: DiagramType) => void;
    className?: string;
}

export function DiagramTypeSelector({
    selectedType,
    onTypeChange,
    className
}: DiagramTypeSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<DiagramCategory | 'all'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // تصفية المخططات
    const filteredDiagrams = Object.entries(DIAGRAM_TYPES).filter(([key, diagram]) => {
        const matchesSearch = searchTerm === '' ||
            diagram.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            diagram.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            diagram.useCases.some(useCase => useCase.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = selectedCategory === 'all' || diagram.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // تجميع المخططات حسب الفئة
    const diagramsByCategory = Object.entries(DIAGRAM_TYPES).reduce((acc, [key, diagram]) => {
        if (!acc[diagram.category]) {
            acc[diagram.category] = [];
        }
        acc[diagram.category].push([key as DiagramType, diagram]);
        return acc;
    }, {} as Record<DiagramCategory, [DiagramType, typeof DIAGRAM_TYPES[DiagramType]][]>);

    const categoryLabels: Record<DiagramCategory, string> = {
        uml: 'مخططات UML',
        business: 'مخططات الأعمال',
        technical: 'مخططات تقنية',
        planning: 'مخططات التخطيط'
    };

    const categoryColors: Record<DiagramCategory, string> = {
        uml: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200',
        business: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200',
        technical: 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900 dark:border-purple-700 dark:text-purple-200',
        planning: 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-200'
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* شريط البحث والتصفية */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="البحث في المخططات..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)}>
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">جميع الفئات</SelectItem>
                            <SelectItem value="uml">UML</SelectItem>
                            <SelectItem value="business">أعمال</SelectItem>
                            <SelectItem value="technical">تقني</SelectItem>
                            <SelectItem value="planning">تخطيط</SelectItem>
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

            {/* عرض النتائج */}
            {searchTerm || selectedCategory !== 'all' ? (
                // عرض نتائج البحث/التصفية
                <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                        {filteredDiagrams.length} نتيجة من أصل {Object.keys(DIAGRAM_TYPES).length} مخطط
                    </div>

                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredDiagrams.map(([key, diagram]) => (
                                <DiagramCard
                                    key={key}
                                    type={key as DiagramType}
                                    diagram={diagram}
                                    isSelected={selectedType === key}
                                    onSelect={() => onTypeChange(key as DiagramType)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredDiagrams.map(([key, diagram]) => (
                                <DiagramListItem
                                    key={key}
                                    type={key as DiagramType}
                                    diagram={diagram}
                                    isSelected={selectedType === key}
                                    onSelect={() => onTypeChange(key as DiagramType)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                // عرض حسب الفئات
                <Tabs defaultValue="uml" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        {Object.entries(categoryLabels).map(([category, label]) => (
                            <TabsTrigger key={category} value={category}>
                                {label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {Object.entries(diagramsByCategory).map(([category, diagrams]) => (
                        <TabsContent key={category} value={category} className="space-y-4">
                            <div className={`p-4 rounded-lg border ${categoryColors[category as DiagramCategory]}`}>
                                <h3 className="font-semibold mb-2">{categoryLabels[category as DiagramCategory]}</h3>
                                <p className="text-sm opacity-80">
                                    {category === 'uml' && 'مخططات UML المعيارية لتصميم البرمجيات والأنظمة'}
                                    {category === 'business' && 'مخططات لتحليل العمليات التجارية وسير العمل'}
                                    {category === 'technical' && 'مخططات تقنية للبنية والتصميم التقني'}
                                    {category === 'planning' && 'مخططات التخطيط والجدولة الزمنية'}
                                </p>
                            </div>

                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {diagrams.map(([key, diagram]) => (
                                        <DiagramCard
                                            key={key}
                                            type={key}
                                            diagram={diagram}
                                            isSelected={selectedType === key}
                                            onSelect={() => onTypeChange(key)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {diagrams.map(([key, diagram]) => (
                                        <DiagramListItem
                                            key={key}
                                            type={key}
                                            diagram={diagram}
                                            isSelected={selectedType === key}
                                            onSelect={() => onTypeChange(key)}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            )}

            {filteredDiagrams.length === 0 && (searchTerm || selectedCategory !== 'all') && (
                <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لم يتم العثور على مخططات تطابق البحث</p>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('all');
                        }}
                        className="mt-2"
                    >
                        مسح البحث
                    </Button>
                </div>
            )}
        </div>
    );
}

// مكون بطاقة المخطط
interface DiagramCardProps {
    type: DiagramType;
    diagram: typeof DIAGRAM_TYPES[DiagramType];
    isSelected: boolean;
    onSelect: () => void;
}

function DiagramCard({ type, diagram, isSelected, onSelect }: DiagramCardProps) {
    return (
        <Card
            className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
                }`}
            onClick={onSelect}
        >
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="text-2xl">{diagram.icon}</div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-sm truncate">{diagram.title}</h4>
                            <Badge
                                variant="outline"
                                className="text-xs"
                            >
                                {diagram.complexity}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {diagram.description}
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <Badge
                                    variant="secondary"
                                    className="text-xs"
                                >
                                    {diagram.category === 'uml' ? 'UML' :
                                        diagram.category === 'business' ? 'أعمال' :
                                            diagram.category === 'technical' ? 'تقني' : 'تخطيط'}
                                </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {diagram.useCases.slice(0, 2).map((useCase, index) => (
                                    <div key={index} className="flex items-center gap-1">
                                        <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                                        <span className="truncate">{useCase}</span>
                                    </div>
                                ))}
                                {diagram.useCases.length > 2 && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                        +{diagram.useCases.length - 2} المزيد...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// مكون عنصر القائمة
interface DiagramListItemProps {
    type: DiagramType;
    diagram: typeof DIAGRAM_TYPES[DiagramType];
    isSelected: boolean;
    onSelect: () => void;
}

function DiagramListItem({ type, diagram, isSelected, onSelect }: DiagramListItemProps) {
    return (
        <Card
            className={`cursor-pointer transition-all hover:shadow-sm ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
                }`}
            onClick={onSelect}
        >
            <CardContent className="p-3">
                <div className="flex items-center gap-4">
                    <div className="text-xl">{diagram.icon}</div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{diagram.title}</h4>
                            <Badge variant="outline" className="text-xs">
                                {diagram.complexity}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                                {diagram.category === 'uml' ? 'UML' :
                                    diagram.category === 'business' ? 'أعمال' :
                                        diagram.category === 'technical' ? 'تقني' : 'تخطيط'}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                            {diagram.description}
                        </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {diagram.useCases.length} حالة استخدام
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
