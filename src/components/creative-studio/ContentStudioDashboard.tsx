 /**
 * Content Studio Dashboard - Main Entry Point
 * لوحة التحكم الرئيسية لاستوديو المحتوى الإبداعي
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Film, 
  Music, 
  FileText,
  Sparkles,
  Plus,
  Clock,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ContentType, ContentMetadata, getTemplatesByType } from '@/lib/models/creative-content-config';
import { useCreativeStudio } from '@/hooks/creative-studio/use-creative-studio';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ContentTypeOption {
  type: ContentType;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: typeof BookOpen;
  color: string;
  gradient: string;
}

const CONTENT_TYPES: ContentTypeOption[] = [
  {
    type: 'story',
    name: 'Story',
    nameAr: 'قصة',
    description: 'Short stories and narratives',
    descriptionAr: 'قصص قصيرة وروايات',
    icon: BookOpen,
    color: 'text-blue-500',
    gradient: 'from-blue-500/20 to-blue-600/20',
  },
  {
    type: 'novel',
    name: 'Novel',
    nameAr: 'رواية',
    description: 'Long-form novels with chapters',
    descriptionAr: 'روايات طويلة متعددة الفصول',
    icon: BookOpen,
    color: 'text-purple-500',
    gradient: 'from-purple-500/20 to-purple-600/20',
  },
  {
    type: 'movie-script',
    name: 'Movie Script',
    nameAr: 'سيناريو فيلم',
    description: 'Professional movie screenplays',
    descriptionAr: 'سيناريوهات أفلام احترافية',
    icon: Film,
    color: 'text-red-500',
    gradient: 'from-red-500/20 to-red-600/20',
  },
  {
    type: 'tv-script',
    name: 'TV Script',
    nameAr: 'سيناريو مسلسل',
    description: 'TV series scripts and episodes',
    descriptionAr: 'سيناريوهات مسلسلات وحلقات',
    icon: Film,
    color: 'text-orange-500',
    gradient: 'from-orange-500/20 to-orange-600/20',
  },
  {
    type: 'song-lyrics',
    name: 'Song Lyrics',
    nameAr: 'كلمات أغنية',
    description: 'Song lyrics with structure',
    descriptionAr: 'كلمات أغاني بهيكل منظم',
    icon: Music,
    color: 'text-pink-500',
    gradient: 'from-pink-500/20 to-pink-600/20',
  },
  {
    type: 'poem',
    name: 'Poem',
    nameAr: 'قصيدة',
    description: 'Poetry in various styles',
    descriptionAr: 'قصائد بأساليب مختلفة',
    icon: Music,
    color: 'text-indigo-500',
    gradient: 'from-indigo-500/20 to-indigo-600/20',
  },
];

interface CreateProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: ContentType | null;
}

function CreateProjectDialog({ isOpen, onClose, contentType }: CreateProjectDialogProps) {
  const router = useRouter();
  const { createProject } = useCreativeStudio();
  const [formData, setFormData] = useState<Partial<ContentMetadata>>({
    title: '',
    author: '',
    genre: '',
    description: '',
    language: 'ar',
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const templates = contentType ? getTemplatesByType(contentType) : [];

  const handleCreate = () => {
    if (!contentType || !formData.title) return;

    createProject(
      contentType,
      formData as ContentMetadata,
      selectedTemplate || undefined
    );

    // Navigate to studio
    router.push('/creative-studio/new');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>إنشاء مشروع جديد</DialogTitle>
          <DialogDescription>
            املأ التفاصيل لبدء مشروعك الإبداعي
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {/* Template Selection */}
            {templates.length > 0 && (
              <div className="space-y-2">
                <Label>اختر قالب (اختياري)</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="بدون قالب - ابدأ من الصفر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">بدون قالب</SelectItem>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.icon} {template.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">العنوان *</Label>
              <Input
                id="title"
                placeholder="اكتب عنوان المشروع..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Author */}
            <div className="space-y-2">
              <Label htmlFor="author">المؤلف</Label>
              <Input
                id="author"
                placeholder="اسم المؤلف..."
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </div>

            {/* Genre */}
            <div className="space-y-2">
              <Label htmlFor="genre">النوع</Label>
              <Input
                id="genre"
                placeholder="مثال: دراما، كوميديا، رومانسي..."
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">وصف المشروع</Label>
              <Textarea
                id="description"
                placeholder="وصف موجز عن المشروع..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language">اللغة</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={handleCreate} disabled={!formData.title}>
            <Sparkles className="mr-2 h-4 w-4" />
            إنشاء المشروع
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ContentStudioDashboard() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Mock recent projects - Replace with actual data
  const recentProjects = [
    {
      id: '1',
      title: 'رواية الأمل',
      type: 'novel' as ContentType,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      progress: 45,
    },
    {
      id: '2',
      title: 'سيناريو فيلم المغامرة',
      type: 'movie-script' as ContentType,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      progress: 70,
    },
    {
      id: '3',
      title: 'أغنية الحرية',
      type: 'song-lyrics' as ContentType,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      progress: 100,
    },
  ];

  const handleSelectType = (type: ContentType) => {
    setSelectedType(type);
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Sparkles className="h-10 w-10 text-primary" />
          استوديو المحتوى الإبداعي
        </h1>
        <p className="text-muted-foreground text-lg">
          ابدع قصصك، سيناريوهاتك، وكلمات أغانيك بتحكم كامل في كل خطوة
        </p>
      </div>

      {/* Content Type Selection */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">اختر نوع المحتوى</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CONTENT_TYPES.map((contentType) => {
            const Icon = contentType.icon;
            return (
              <Card
                key={contentType.type}
                className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 bg-gradient-to-br ${contentType.gradient} border-2 hover:border-primary`}
                onClick={() => handleSelectType(contentType.type)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Icon className={`h-6 w-6 ${contentType.color}`} />
                        {contentType.nameAr}
                      </CardTitle>
                      <CardDescription>{contentType.descriptionAr}</CardDescription>
                    </div>
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">المشاريع الأخيرة</h2>
            <Button variant="ghost" onClick={() => router.push('/creative-studio/projects')}>
              عرض الكل
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map((project) => {
              const contentType = CONTENT_TYPES.find(ct => ct.type === project.type);
              const Icon = contentType?.icon || FileText;
              
              return (
                <Card
                  key={project.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/creative-studio/${project.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Icon className={`h-5 w-5 ${contentType?.color}`} />
                          {project.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(project.updatedAt, { 
                            addSuffix: true,
                            locale: ar 
                          })}
                        </div>
                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">التقدم</span>
                            <span className="font-medium">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle delete
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Project Dialog */}
      <CreateProjectDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        contentType={selectedType}
      />
    </div>
  );
}
