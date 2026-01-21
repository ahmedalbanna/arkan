'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw, Trash2, Edit, Copy, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks';
import type { PromptConfiguration, PromptStatus } from '@/lib/models/prompt-config';
import { PromptEditor } from '@/components/admin/prompt-editor/PromptEditor';
import { PromptTester } from '@/components/admin/prompt-editor/PromptTester';

export default function PromptsManagementPage() {
  const [prompts, setPrompts] = useState<PromptConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PromptStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [testerOpen, setTesterOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptConfiguration | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPrompts();
  }, [statusFilter, categoryFilter]);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      params.append('limit', '50');

      const response = await fetch(`/api/admin/prompts?${params}`);
      if (!response.ok) throw new Error('Failed to load prompts');
      
      const data = await response.json();
      setPrompts(data.prompts || []);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل تحميل المطالبات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPrompt) return;

    try {
      const response = await fetch(`/api/admin/prompts/${selectedPrompt.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete prompt');

      toast({
        title: 'نجح',
        description: 'تم حذف المطالبة بنجاح',
      });

      loadPrompts();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل حذف المطالبة',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedPrompt(null);
    }
  };

  const handleDuplicate = async (prompt: PromptConfiguration) => {
    try {
      const newPrompt = {
        ...prompt,
        id: `${prompt.id}-copy`,
        name: `${prompt.name} (نسخة)`,
        status: 'draft' as PromptStatus,
      };

      const response = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrompt),
      });

      if (!response.ok) throw new Error('Failed to duplicate prompt');

      toast({
        title: 'نجح',
        description: 'تم نسخ المطالبة بنجاح',
      });

      loadPrompts();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل نسخ المطالبة',
        variant: 'destructive',
      });
    }
  };

  const handleSavePrompt = async (prompt: PromptConfiguration) => {
    try {
      const method = selectedPrompt ? 'PATCH' : 'POST';
      const url = selectedPrompt 
        ? `/api/admin/prompts/${selectedPrompt.id}`
        : '/api/admin/prompts';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt),
      });

      if (!response.ok) throw new Error('Failed to save prompt');

      toast({
        title: 'نجح',
        description: selectedPrompt ? 'تم تحديث المطالبة' : 'تم إنشاء المطالبة',
      });

      setEditorOpen(false);
      setSelectedPrompt(null);
      loadPrompts();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل حفظ المطالبة',
        variant: 'destructive',
      });
    }
  };

  const filteredPrompts = prompts.filter((prompt) =>
    prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: PromptStatus) => {
    const variants: Record<PromptStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      draft: 'secondary',
      archived: 'outline',
      deprecated: 'destructive',
    };

    const labels: Record<PromptStatus, string> = {
      active: 'نشط',
      draft: 'مسودة',
      archived: 'مؤرشف',
      deprecated: 'منتهي',
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const categories = Array.from(new Set(prompts.map(p => p.metadata.category).filter(Boolean)));

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة المطالبات</h1>
          <p className="text-muted-foreground">إدارة قوالب المطالبات والنماذج</p>
        </div>
        <Button onClick={() => {
          setSelectedPrompt(null);
          setEditorOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          إنشاء مطالبة جديدة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>المطالبات</CardTitle>
          <CardDescription>عرض وإدارة جميع المطالبات المتاحة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في المطالبات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="تصفية حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="draft">مسودة</SelectItem>
                <SelectItem value="archived">مؤرشف</SelectItem>
                <SelectItem value="deprecated">منتهي</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="تصفية حسب الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadPrompts}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : filteredPrompts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد مطالبات</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>الإصدار</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الاستخدامات</TableHead>
                  <TableHead>آخر تحديث</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrompts.map((prompt) => (
                  <TableRow key={prompt.id}>
                    <TableCell className="font-medium">{prompt.name}</TableCell>
                    <TableCell className="max-w-md truncate">{prompt.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{prompt.metadata.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{prompt.version}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(prompt.status)}</TableCell>
                    <TableCell>{prompt.metadata.stats?.totalCalls || 0}</TableCell>
                    <TableCell>
                      {new Date(prompt.metadata.updatedAt).toLocaleDateString('ar-EG')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPrompt(prompt);
                            setTesterOpen(true);
                          }}
                        >
                          <TestTube className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPrompt(prompt);
                            setEditorOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicate(prompt)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPrompt(prompt);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPrompt ? 'تعديل المطالبة' : 'إنشاء مطالبة جديدة'}
            </DialogTitle>
            <DialogDescription>
              قم بتعديل أو إنشاء مطالبة جديدة للنظام
            </DialogDescription>
          </DialogHeader>
          <PromptEditor
            prompt={selectedPrompt || undefined}
            onSave={handleSavePrompt}
            onCancel={() => {
              setEditorOpen(false);
              setSelectedPrompt(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={testerOpen} onOpenChange={setTesterOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>اختبار المطالبة</DialogTitle>
            <DialogDescription>
              اختبر المطالبة بمتغيرات مختلفة
            </DialogDescription>
          </DialogHeader>
          {selectedPrompt && (
            <PromptTester prompt={selectedPrompt} />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المطالبة نهائياً من النظام.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
