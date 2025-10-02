/**
 * مكون اختيار أقسام التقرير مع معلومات ذكية
 */

'use client';

import type { SectionName } from '@/ai/schemas/enums';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { SingleSectionResult } from '@/services/intelligent-report-service';
import { SUPPORTED_SECTIONS, SectionUtils } from '@/services/intelligent-report-service';
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle,
    Clock,
    Target,
    Zap
} from 'lucide-react';

interface SectionSelectorProps {
    selectedSections: SectionName[];
    onSectionChange: (sections: SectionName[]) => void;
    mode: 'single' | 'multiple';
    sectionResults?: Record<string, SingleSectionResult>;
    dependencyValidation?: {
        isValid: boolean;
        missingDependencies: Record<string, SectionName[]>;
        recommendedOrder: SectionName[];
    };
    className?: string;
}

export function SectionSelector({
    selectedSections,
    onSectionChange,
    mode,
    sectionResults = {},
    dependencyValidation,
    className
}: SectionSelectorProps) {

    const allSections = SectionUtils.getAllSections();
    const sectionCategories = {
        'أساسي': SectionUtils.getSectionsByCategory('basic'),
        'تقني': SectionUtils.getSectionsByCategory('technical'),
        'تحليلي': SectionUtils.getSectionsByCategory('analysis'),
        'توثيقي': SectionUtils.getSectionsByCategory('documentation')
    };

    const handleSectionToggle = (section: SectionName, checked: boolean) => {
        if (mode === 'single') {
            onSectionChange([section]);
        } else {
            if (checked) {
                onSectionChange([...selectedSections, section]);
            } else {
                onSectionChange(selectedSections.filter(s => s !== section));
            }
        }
    };

    const handleSelectAll = () => {
        onSectionChange(allSections);
    };

    const handleSelectNone = () => {
        onSectionChange([]);
    };

    const handleSelectRecommended = () => {
        if (dependencyValidation?.recommendedOrder) {
            onSectionChange(dependencyValidation.recommendedOrder);
        }
    };

    const getSectionStatus = (section: SectionName) => {
        if (sectionResults[section]) {
            return 'completed';
        }
        if (selectedSections.includes(section)) {
            return 'selected';
        }
        return 'available';
    };

    const getSectionBadgeVariant = (status: string) => {
        switch (status) {
            case 'completed': return 'default';
            case 'selected': return 'secondary';
            default: return 'outline';
        }
    };

    const getSectionIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'selected': return <Target className="h-4 w-4 text-blue-600" />;
            default: return null;
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* أزرار التحكم السريع */}
            {mode === 'multiple' && (
                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        className="flex items-center gap-1"
                    >
                        اختيار الكل ({allSections.length})
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectNone}
                        className="flex items-center gap-1"
                    >
                        إلغاء الكل
                    </Button>
                    {dependencyValidation?.recommendedOrder && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSelectRecommended}
                            className="flex items-center gap-1"
                        >
                            <Zap className="h-3 w-3" />
                            الترتيب الموصى به
                        </Button>
                    )}
                </div>
            )}

            {/* تحذيرات التبعيات */}
            {mode === 'multiple' && dependencyValidation && !dependencyValidation.isValid && (
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        <div className="space-y-2">
                            <p>بعض الأقسام المختارة تحتاج لأقسام أخرى:</p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                {Object.entries(dependencyValidation.missingDependencies).map(([section, deps]) => (
                                    <li key={section}>
                                        <strong>{SUPPORTED_SECTIONS[section as SectionName]?.title}</strong> يحتاج: {deps.map(dep => SUPPORTED_SECTIONS[dep]?.title).join(', ')}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* الأقسام مجمعة حسب الفئة */}
            <div className="space-y-6">
                {Object.entries(sectionCategories).map(([categoryName, sections]) => (
                    <Card key={categoryName}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">{categoryName}</CardTitle>
                            <CardDescription>
                                {sections.length} قسم متاح في هذه الفئة
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {sections.map((section) => {
                                    const sectionInfo = SUPPORTED_SECTIONS[section];
                                    const status = getSectionStatus(section);
                                    const isSelected = selectedSections.includes(section);
                                    const hasDependencyIssue = dependencyValidation?.missingDependencies[section];

                                    return (
                                        <div
                                            key={section}
                                            className={`p-4 border rounded-lg transition-all cursor-pointer hover:shadow-md ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-200 dark:border-gray-700'
                                                } ${status === 'completed' ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''
                                                }`}
                                            onClick={() => handleSectionToggle(section, !isSelected)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onChange={(checked) => handleSectionToggle(section, checked)}
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-medium text-sm">
                                                                {sectionInfo.title}
                                                            </h4>
                                                            {getSectionIcon(status)}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mb-2">
                                                            {sectionInfo.description}
                                                        </p>

                                                        {/* معلومات القسم */}
                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {SectionUtils.formatEstimatedTime(sectionInfo.estimatedTime)}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Target className="h-3 w-3" />
                                                                {sectionInfo.qualityThreshold}/100
                                                            </div>
                                                        </div>

                                                        {/* التبعيات */}
                                                        {sectionInfo.dependencies.length > 0 && (
                                                            <div className="mt-2 flex items-center gap-1 text-xs">
                                                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                                <span className="text-muted-foreground">يحتاج:</span>
                                                                <div className="flex gap-1 flex-wrap">
                                                                    {sectionInfo.dependencies.map(dep => (
                                                                        <Badge
                                                                            key={dep}
                                                                            variant={selectedSections.includes(dep) ? "default" : "destructive"}
                                                                            className="text-xs px-1 py-0"
                                                                        >
                                                                            {SUPPORTED_SECTIONS[dep]?.title}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* تحذير التبعيات المفقودة */}
                                                        {hasDependencyIssue && (
                                                            <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                                                                <AlertTriangle className="h-3 w-3" />
                                                                <span>يحتاج أقسام مفقودة</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <Badge variant={getSectionBadgeVariant(status)} className="text-xs">
                                                    {status === 'completed' ? 'مكتمل' :
                                                        status === 'selected' ? 'مختار' : 'متاح'}
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* ملخص الاختيار */}
            {mode === 'multiple' && selectedSections.length > 0 && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-sm">
                                    <span className="font-medium">{selectedSections.length}</span> قسم مختار
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {Object.keys(sectionResults).length} مكتمل
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    ~{SectionUtils.formatEstimatedTime(
                                        selectedSections.reduce((total, section) =>
                                            total + SUPPORTED_SECTIONS[section].estimatedTime, 0
                                        )
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Zap className="h-4 w-4" />
                                    ~{Math.ceil(selectedSections.length * 0.8)} رصيد
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
