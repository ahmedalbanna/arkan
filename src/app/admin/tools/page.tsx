'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw, Trash2, Edit, ToggleLeft, ToggleRight, Settings } from 'lucide-react';
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
  DialogFooter,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks';
import type { ToolConfiguration, ToolCategory } from '@/lib/models/tool-config';

export default function ToolsManagementPage() {
  const [tools, setTools] = useState<ToolConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ToolCategory | 'all'>('all');
  const [enabledFilter, setEnabledFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolConfiguration | null>(null);
  const [editForm, setEditForm] = useState<Partial<ToolConfiguration>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadTools();
  }, [categoryFilter, enabledFilter]);

  const loadTools = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      if (enabledFilter !== 'all') {
        params.append('enabled', enabledFilter === 'enabled' ? 'true' : 'false');
      }
      params.append('limit', '50');

      const response = await fetch(`/api/admin/tools?${params}`);
      if (!response.ok) throw new Error('Failed to load tools');
      
      const data = await response.json();
      setTools(data.tools || []);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل تحميل الأدوات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTool) return;

    try {
      const response = await fetch(`/api/admin/tools/${selectedTool.name}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete tool');

      toast({
        title: 'نجح',
        description: 'تم حذف الأداة بنجاح',
      });

      loadTools();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل حذف الأداة',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedTool(null);
    }
  };

  const handleToggleEnabled = async (tool: ToolConfiguration) => {
    try {
      const response = await fetch(`/api/admin/tools/${tool.name}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !tool.enabled }),
      });

      if (!response.ok) throw new Error('Failed to update tool');

      toast({
        title: 'نجح',
        description: tool.enabled ? 'تم تعطيل الأداة' : 'تم تفعيل الأداة',
      });

      loadTools();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل تحديث الأداة',
        variant: 'destructive',
      });
    }
  };

  const handleSaveTool = async () => {
    try {
      const method = selectedTool ? 'PATCH' : 'POST';
      const url = selectedTool 
        ? `/api/admin/tools/${selectedTool.name}`
        : '/api/admin/tools';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error('Failed to save tool');

      toast({
        title: 'نجح',
        description: selectedTool ? 'تم تحديث الأداة' : 'تم إنشاء الأداة',
      });

      setEditorOpen(false);
      setSelectedTool(null);
      setEditForm({});
      loadTools();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل حفظ الأداة',
        variant: 'destructive',
      });
    }
  };

  const openEditor = (tool?: ToolConfiguration) => {
    if (tool) {
      setSelectedTool(tool);
      setEditForm(tool);
    } else {
      setSelectedTool(null);
      setEditForm({
        enabled: true,
        isBuiltIn: false,
        category: 'content-generation' as ToolCategory,
      });
    }
    setEditorOpen(true);
  };

  const filteredTools = tools.filter((tool) =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryBadge = (category: ToolCategory) => {
    const labels: Record<ToolCategory, string> = {
      'content-generation': 'إنشاء محتوى',
      'content-enhancement': 'تحسين محتوى',
      'analysis': 'تحليل',
      'research': 'بحث',
      'formatting': 'تنسيق',
      'translation': 'ترجمة',
      'integration': 'تكامل',
      'utility': 'أدوات مساعدة',
    };

    return (
      <Badge variant="outline">
        {labels[category] || category}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة الأدوات</h1>
          <p className="text-muted-foreground">إدارة أدوات النظام والتكاملات</p>
        </div>
        <Button onClick={() => openEditor()}>
          <Plus className="mr-2 h-4 w-4" />
          إضافة أداة جديدة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الأدوات</CardTitle>
          <CardDescription>عرض وإدارة جميع الأدوات المتاحة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في الأدوات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="تصفية حسب الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                <SelectItem value="content-generation">إنشاء محتوى</SelectItem>
                <SelectItem value="content-enhancement">تحسين محتوى</SelectItem>
                <SelectItem value="analysis">تحليل</SelectItem>
                <SelectItem value="research">بحث</SelectItem>
                <SelectItem value="formatting">تنسيق</SelectItem>
                <SelectItem value="translation">ترجمة</SelectItem>
                <SelectItem value="integration">تكامل</SelectItem>
                <SelectItem value="utility">أدوات مساعدة</SelectItem>
              </SelectContent>
            </Select>
            <Select value={enabledFilter} onValueChange={(value: any) => setEnabledFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="تصفية حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="enabled">مفعّل</SelectItem>
                <SelectItem value="disabled">معطّل</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadTools}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد أدوات</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الاستخدامات</TableHead>
                  <TableHead>آخر تحديث</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTools.map((tool) => (
                  <TableRow key={tool.name}>
                    <TableCell className="font-medium">{tool.name}</TableCell>
                    <TableCell className="max-w-md truncate">{tool.description}</TableCell>
                    <TableCell>{getCategoryBadge(tool.category)}</TableCell>
                    <TableCell>
                      <Badge variant={tool.isBuiltIn ? 'default' : 'secondary'}>
                        {tool.isBuiltIn ? 'مدمج' : 'مخصص'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={tool.enabled ? 'default' : 'secondary'}>
                        {tool.enabled ? 'مفعّل' : 'معطّل'}
                      </Badge>
                    </TableCell>
                    <TableCell>{tool.metadata.stats?.totalCalls || 0}</TableCell>
                    <TableCell>
                      {new Date(tool.metadata.updatedAt).toLocaleDateString('ar-EG')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleEnabled(tool)}
                        >
                          {tool.enabled ? (
                            <ToggleRight className="h-4 w-4" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditor(tool)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!tool.isBuiltIn && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTool(tool);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTool ? 'تعديل الأداة' : 'إضافة أداة جديدة'}
            </DialogTitle>
            <DialogDescription>
              قم بتعديل أو إضافة أداة جديدة للنظام
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم الأداة</Label>
              <Input
                id="name"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="اسم الأداة بالإنجليزية"
                disabled={!!selectedTool}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="وصف الأداة"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">الفئة</Label>
              <Select 
                value={editForm.category} 
                onValueChange={(value: ToolCategory) => setEditForm({ ...editForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="content-generation">إنشاء محتوى</SelectItem>
                  <SelectItem value="content-enhancement">تحسين محتوى</SelectItem>
                  <SelectItem value="analysis">تحليل</SelectItem>
                  <SelectItem value="research">بحث</SelectItem>
                  <SelectItem value="formatting">تنسيق</SelectItem>
                  <SelectItem value="translation">ترجمة</SelectItem>
                  <SelectItem value="integration">تكامل</SelectItem>
                  <SelectItem value="utility">أدوات مساعدة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id="enabled"
                checked={editForm.enabled || false}
                onCheckedChange={(checked) => setEditForm({ ...editForm, enabled: checked })}
              />
              <Label htmlFor="enabled">تفعيل الأداة</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveTool}>
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الأداة نهائياً من النظام.
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
