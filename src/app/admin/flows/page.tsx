'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, RefreshCw, Trash2, Edit, Play, Pause } from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import type { FlowConfiguration, FlowStatus } from '@/lib/models/flow-config';

export default function FlowsManagementPage() {
  const [flows, setFlows] = useState<FlowConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FlowStatus | 'all'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadFlows();
  }, [statusFilter]);

  const loadFlows = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      params.append('limit', '50');

      const response = await fetch(`/api/admin/flows?${params}`);
      if (!response.ok) throw new Error('Failed to load flows');
      
      const data = await response.json();
      setFlows(data.flows || []);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل تحميل التدفقات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFlow) return;

    try {
      const response = await fetch(`/api/admin/flows/${selectedFlow}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete flow');

      toast({
        title: 'نجح',
        description: 'تم حذف التدفق بنجاح',
      });

      loadFlows();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل حذف التدفق',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedFlow(null);
    }
  };

  const handleStatusToggle = async (flowId: string, currentStatus: FlowStatus) => {
    const newStatus: FlowStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      const response = await fetch(`/api/admin/flows/${flowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast({
        title: 'نجح',
        description: 'تم تحديث حالة التدفق',
      });

      loadFlows();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل تحديث حالة التدفق',
        variant: 'destructive',
      });
    }
  };

  const filteredFlows = flows.filter((flow) =>
    flow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flow.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: FlowStatus) => {
    const variants: Record<FlowStatus, 'default' | 'secondary' | 'destructive'> = {
      active: 'default',
      inactive: 'secondary',
      deprecated: 'destructive',
    };

    const labels: Record<FlowStatus, string> = {
      active: 'نشط',
      inactive: 'غير نشط',
      deprecated: 'منتهي',
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة التدفقات</h1>
          <p className="text-muted-foreground">إدارة تدفقات العمل والأتمتة</p>
        </div>
        <Button onClick={() => router.push('/admin/flow-builder')}>
          <Plus className="mr-2 h-4 w-4" />
          إنشاء تدفق جديد
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>التدفقات</CardTitle>
          <CardDescription>عرض وإدارة جميع التدفقات المتاحة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في التدفقات..."
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
                <SelectItem value="inactive">غير نشط</SelectItem>
                <SelectItem value="deprecated">منتهي</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadFlows}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : filteredFlows.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد تدفقات</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>الإصدار</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الخطوات</TableHead>
                  <TableHead>آخر تحديث</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFlows.map((flow) => (
                  <TableRow key={flow.id}>
                    <TableCell className="font-medium">{flow.name}</TableCell>
                    <TableCell className="max-w-md truncate">{flow.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{flow.version}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(flow.status)}</TableCell>
                    <TableCell>{flow.steps?.length || 0}</TableCell>
                    <TableCell>
                      {new Date(flow.metadata.updatedAt).toLocaleDateString('ar-EG')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/flow-builder?id=${flow.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusToggle(flow.id, flow.status)}
                        >
                          {flow.status === 'active' ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedFlow(flow.id);
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف التدفق نهائياً من النظام.
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
