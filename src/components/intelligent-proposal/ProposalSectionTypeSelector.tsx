/**
 * مكون اختيار نوع قسم المقترح
 * يعرض جميع أنواع أقسام المقترح المتاحة مع معلومات مفصلة
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    PROPOSAL_SECTION_TYPES,
    type ProposalSectionCategory,
    type ProposalSectionType
} from '@/services/intelligent-proposal-service';
import { Grid, List, Search } from 'lucide-react';
import { useState } from 'react';

interface ProposalSectionTypeSelectorProps {
    selectedType: ProposalSectionType;
    onTypeChange: (type: ProposalSectionType) => void;
    className?: string;
}

export function ProposalSectionTypeSelector({
    selectedType,
    onTypeChange,
    className
}: ProposalSectionTypeSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ProposalSectionCategory | 'all'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // تصفية أقسام المقترح
    const filteredSections = Object.entries(PROPOSAL_SECTION_TYPES).filter(([key, section]) => {
        const matchesSearch = searchTerm === '' ||
            section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            section.keyElements.some(element => element.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // تجميع الأقسام حسب الفئة
    const sectionsByCategory = Object.entries(PROPOSAL_SECTION_TYPES).reduce((acc, [key, section]) => {
        if (!acc[section.category]) {
            acc[section.category] = [];
        }
        acc[section.category].push([key as ProposalSectionType, section]);
        return acc;
    }, {} as Record<ProposalSectionCategory, [ProposalSectionType, typeof PROPOSAL_SECTION_TYPES[ProposalSectionType]][]>);

    const categoryLabels: Record<ProposalSectionCategory, string> = {
        overview: 'نظرة عامة',
        planning: 'تخطيط',
        execution: 'تنفيذ',
        management: 'إدارة',
        evaluation: 'تقييم'
    };

    const categoryColors: Record<ProposalSectionCategory, string> = {
        overview: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200',
        planning: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200',
        execution: 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900 dark:border-purple-700 dark:text-purple-200',
        management: 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-200',
        evaluation: 'bg-pink-50 border-pink-200 text-pink-800 dark:bg-pink-900 dark:border-pink-700 dark:text-pink-200'
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* شريط البحث والتصفية */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="البحث في أقسام المقترح..."
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
                            <SelectItem value="overview">نظرة عامة</SelectItem>
                            <SelectItem value="planning">تخطيط</SelectItem>
                            <SelectItem value="execution">تنفيذ</SelectItem>
                            <SelectItem value="management">إدارة</SelectItem>
                            <SelectItem value="evaluation">تقييم</SelectItem>
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
                        {filteredSections.length} نتيجة من أصل {Object.keys(PROPOSAL_SECTION_TYPES).length} قسم
                    </div>

                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredSections.map(([key, section]) => (
                                <SectionCard
                                    key={key}
                                    type={key as ProposalSectionType}
                                    section={section}
                                    isSelected={selectedType === key}
                                    onSelect={() => onTypeChange(key as ProposalSectionType)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredSections.map(([key, section]) => (
                                <SectionListItem
                                    key={key}
                                    type={key as ProposalSectionType}
                                    section={section}
                                    isSelected={selectedType === key}
                                    onSelect={() => onTypeChange(key as ProposalSectionType)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                // عرض حسب الفئات
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        {Object.entries(categoryLabels).map(([category, label]) => (
                            <TabsTrigger key={category} value={category}>
                                {label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {Object.entries(sectionsByCategory).map(([category, sections]) => (
                        <TabsContent key={category} value={category} className="space-y-4">
                            <div className={`p-4 rounded-lg border ${categoryColors[category as ProposalSectionCategory]}`}>
                                <h3 className="font-semibold mb-2">{categoryLabels[category as ProposalSectionCategory]}</h3>
                                <p className="text-sm opacity-80">
                                    {category === 'overview' && 'أقسام النظرة العامة والتلخيص للمقترح'}
                                    {category === 'planning' && 'أقسام التخطيط وتحديد النطاق والأهداف'}
                                    {category === 'execution' && 'أقسام التنفيذ والمنهجية والمخرجات'}
                                    {category === 'management' && 'أقسام الإدارة والميزانية وإدارة المخاطر'}
                                    {category === 'evaluation' && 'أقسام التقييم ومعايير النجاح'}
                                </p>
                            </div>

                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {sections.map(([key, section]) => (
                                        <SectionCard
                                            key={key}
                                            type={key as ProposalSectionType}
                                            section={section}
                                            isSelected={selectedType === key}
                                            onSelect={() => onTypeChange(key as ProposalSectionType)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {sections.map(([key, section]) => (
                                        <SectionListItem
                                            key={key}
                                            type={key as ProposalSectionType}
                                            section={section}
                                            isSelected={selectedType === key}
                                            onSelect={() => onTypeChange(key as ProposalSectionType)}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            )}

            {filteredSections.length === 0 && (searchTerm || selectedCategory !== 'all') && (
                <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لم يتم العثور على أقسام تطابق البحث</p>
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

// مكون بطاقة القسم
interface SectionCardProps {
    type: ProposalSectionType;
    section: typeof PROPOSAL_SECTION_TYPES[ProposalSectionType];
    isSelected: boolean;
    onSelect: () => void;
}

function SectionCard({ type, section, isSelected, onSelect }: SectionCardProps) {
    return (
        <Card
            className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
                }`}
            onClick={onSelect}
        >
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className="text-2xl">{section.icon}</div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-sm truncate">{section.title}</h4>
                            <Badge
                                variant="outline"
                                className="text-xs"
                            >
                                {section.complexity === 'basic' ? 'بسيط' :
                                    section.complexity === 'detailed' ? 'مفصل' : 'شامل'}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                            {section.description}
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-1">
                                <Badge
                                    variant="secondary"
                                    className="text-xs"
                                >
                                    {section.category === 'overview' ? 'نظرة عامة' :
                                        section.category === 'planning' ? 'تخطيط' :
                                            section.category === 'execution' ? 'تنفيذ' :
                                                section.category === 'management' ? 'إدارة' : 'تقييم'}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    {section.estimatedLength} كلمة
                                </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {section.keyElements.slice(0, 2).map((element, index) => (
                                    <div key={index} className="flex items-center gap-1">
                                        <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                                        <span className="truncate">{element}</span>
                                    </div>
                                ))}
                                {section.keyElements.length > 2 && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                        +{section.keyElements.length - 2} المزيد...
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
interface SectionListItemProps {
    type: ProposalSectionType;
    section: typeof PROPOSAL_SECTION_TYPES[ProposalSectionType];
    isSelected: boolean;
    onSelect: () => void;
}

function SectionListItem({ type, section, isSelected, onSelect }: SectionListItemProps) {
    return (
        <Card
            className={`cursor-pointer transition-all hover:shadow-sm ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
                }`}
            onClick={onSelect}
        >
            <CardContent className="p-3">
                <div className="flex items-center gap-4">
                    <div className="text-xl">{section.icon}</div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{section.title}</h4>
                            <Badge variant="outline" className="text-xs">
                                {section.complexity === 'basic' ? 'بسيط' :
                                    section.complexity === 'detailed' ? 'مفصل' : 'شامل'}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                                {section.category === 'overview' ? 'نظرة عامة' :
                                    section.category === 'planning' ? 'تخطيط' :
                                        section.category === 'execution' ? 'تنفيذ' :
                                            section.category === 'management' ? 'إدارة' : 'تقييم'}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                            {section.description}
                        </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        <div>{section.estimatedLength} كلمة</div>
                        <div>{section.keyElements.length} عنصر</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
