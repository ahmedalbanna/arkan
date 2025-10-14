/**
 * مثال على استخدام hooks التحليلات الجديدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد للتحليلات
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    useAdvancedAnalyticsNew,
    useSimpleAnalyticsNew,
    type CustomReportData,
    type ExportReportData
} from '@/hooks/use-analytics-new';
import {
    BarChart3,
    Download,
    FileText,
    Loader2,
    RefreshCw,
    TrendingDown,
    TrendingUp,
    Users
} from 'lucide-react';
import React, { useState } from 'react';

/**
 * مكون التحليلات المتقدمة الجديد
 */
export function AdvancedAnalyticsNew() {
  const {
    userStats,
    systemStats,
    usageAnalytics,
    userUsageReport,
    agentAnalytics,
    performanceMetrics,
    isLoading,
    isError,
    error,
    selectedTimeRange,
    selectedMetric,
    isRefreshing,
    handleTimeRangeChange,
    handleMetricChange,
    handleRefresh,
    handleExportData,
    handleCreateCustomReport,
    isExporting,
    isCreatingCustomReport
  } = useAdvancedAnalyticsNew();

  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showCustomReportDialog, setShowCustomReportDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">جاري تحميل التحليلات...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600">
        <span>خطأ في تحميل التحليلات: {error?.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">التحليلات المتقدمة</h2>
          <p className="text-gray-600">مراقبة وتحليل أداء النظام</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                جاري التحديث...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                تحديث
              </>
            )}
          </Button>

          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                تصدير تقرير
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تصدير تقرير الاستخدام</DialogTitle>
                <DialogDescription>
                  اختر الفترة والتنسيق لتصدير التقرير
                </DialogDescription>
              </DialogHeader>
              <ExportReportForm
                onSubmit={(data) => {
                  handleExportData(data);
                  setShowExportDialog(false);
                }}
                isLoading={isExporting}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={showCustomReportDialog} onOpenChange={setShowCustomReportDialog}>
            <DialogTrigger asChild>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                تقرير مخصص
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إنشاء تقرير مخصص</DialogTitle>
                <DialogDescription>
                  أنشئ تقريراً مخصصاً حسب احتياجاتك
                </DialogDescription>
              </DialogHeader>
              <CustomReportForm
                onSubmit={(data) => {
                  handleCreateCustomReport(data);
                  setShowCustomReportDialog(false);
                }}
                isLoading={isCreatingCustomReport}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* فلاتر التحكم */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div>
              <Label htmlFor="time-range">الفترة الزمنية</Label>
              <Select value={selectedTimeRange} onValueChange={handleTimeRangeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">يوم واحد</SelectItem>
                  <SelectItem value="7d">أسبوع</SelectItem>
                  <SelectItem value="30d">شهر</SelectItem>
                  <SelectItem value="90d">3 أشهر</SelectItem>
                  <SelectItem value="1y">سنة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="metric">المقياس</Label>
              <Select value={selectedMetric} onValueChange={handleMetricChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="projects">المشاريع</SelectItem>
                  <SelectItem value="credits">الائتمانات</SelectItem>
                  <SelectItem value="usage">الاستخدام</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">إجمالي التوليدات</p>
                <p className="text-2xl font-bold">{userStats?.totalGenerations || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">الائتمانات المستخدمة</p>
                <p className="text-2xl font-bold">{userStats?.creditsUsed || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">المستخدمين النشطين</p>
                <p className="text-2xl font-bold">{systemStats?.activeUsers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">معدل الخطأ</p>
                <p className="text-2xl font-bold">{systemStats?.errorRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* التحليلات التفصيلية */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="users">المستخدمين</TabsTrigger>
          <TabsTrigger value="agents">الوكلاء</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* استخدام الوكلاء */}
            <Card>
              <CardHeader>
                <CardTitle>استخدام الوكلاء</CardTitle>
                <CardDescription>
                  أكثر الوكلاء استخداماً
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userStats?.agentUsageChartData?.slice(0, 5).map((agent, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{agent.name}</span>
                      <Badge variant="secondary">{agent.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* النشاط الأخير */}
            <Card>
              <CardHeader>
                <CardTitle>النشاط الأخير</CardTitle>
                <CardDescription>
                  آخر العمليات المنجزة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userStats?.recentActivity?.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">وكيل {activity.agentId}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.createdAt).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <Badge variant="outline">مكتمل</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تقرير استخدام المستخدمين</CardTitle>
              <CardDescription>
                إحصائيات استخدام المستخدمين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم المستخدم</TableHead>
                    <TableHead>إجمالي التوليدات</TableHead>
                    <TableHead>الائتمانات المستخدمة</TableHead>
                    <TableHead>آخر نشاط</TableHead>
                    <TableHead>الوكلاء المفضلة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userUsageReport?.slice(0, 10).map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell className="font-medium">{user.userName}</TableCell>
                      <TableCell>{user.totalGenerations}</TableCell>
                      <TableCell>{user.creditsUsed}</TableCell>
                      <TableCell>
                        {new Date(user.lastActivity).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.favoriteAgents.slice(0, 2).map((agent, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {agent}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تحليلات الوكلاء</CardTitle>
              <CardDescription>
                أداء الوكلاء وإحصائياتهم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم الوكيل</TableHead>
                    <TableHead>إجمالي الاستخدام</TableHead>
                    <TableHead>معدل النجاح</TableHead>
                    <TableHead>متوسط وقت الاستجابة</TableHead>
                    <TableHead>رضا المستخدمين</TableHead>
                    <TableHead>آخر استخدام</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentAnalytics?.slice(0, 10).map((agent) => (
                    <TableRow key={agent.agentId}>
                      <TableCell className="font-medium">{agent.agentName}</TableCell>
                      <TableCell>{agent.totalUsage}</TableCell>
                      <TableCell>
                        <Badge variant={agent.successRate > 90 ? 'default' : 'secondary'}>
                          {agent.successRate}%
                        </Badge>
                      </TableCell>
                      <TableCell>{agent.averageResponseTime}ms</TableCell>
                      <TableCell>
                        <Badge variant={agent.userSatisfaction > 4 ? 'default' : 'secondary'}>
                          {agent.userSatisfaction}/5
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(agent.lastUsed).toLocaleDateString('ar-SA')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* مقاييس الأداء */}
            <Card>
              <CardHeader>
                <CardTitle>مقاييس الأداء</CardTitle>
                <CardDescription>
                  أداء النظام العام
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">وقت الاستجابة</span>
                    <Badge variant="outline">{systemStats?.responseTime || 0}ms</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">معدل الخطأ</span>
                    <Badge variant={systemStats?.errorRate < 5 ? 'default' : 'destructive'}>
                      {systemStats?.errorRate || 0}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">وقت التشغيل</span>
                    <Badge variant="outline">{systemStats?.uptime || 0}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">إجمالي الطلبات</span>
                    <Badge variant="outline">{systemStats?.totalRequests || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* مقاييس الأداء التفصيلية */}
            <Card>
              <CardHeader>
                <CardTitle>مقاييس الأداء التفصيلية</CardTitle>
                <CardDescription>
                  تحليل مفصل لأداء النظام
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceMetrics && (
                    <div className="text-sm text-gray-600">
                      <p>البيانات متاحة للفترة المحددة</p>
                      <p className="text-xs mt-2">
                        آخر تحديث: {new Date().toLocaleString('ar-SA')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * مكون التحليلات المبسطة الجديد
 */
export function SimpleAnalyticsNew() {
  const {
    userStats,
    systemStats,
    isLoading,
    isError,
    error,
    refetch
  } = useSimpleAnalyticsNew();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">جاري تحميل التحليلات...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600">
        <span>خطأ في تحميل التحليلات: {error?.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">التحليلات المبسطة</h2>
          <p className="text-gray-600">نظرة سريعة على إحصائياتك</p>
        </div>

        <Button onClick={refetch} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          تحديث
        </Button>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">إجمالي التوليدات</p>
                <p className="text-2xl font-bold">{userStats?.totalGenerations || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">الائتمانات المستخدمة</p>
                <p className="text-2xl font-bold">{userStats?.creditsUsed || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">المستخدمين النشطين</p>
                <p className="text-2xl font-bold">{systemStats?.activeUsers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* استخدام الوكلاء */}
      <Card>
        <CardHeader>
          <CardTitle>استخدام الوكلاء</CardTitle>
          <CardDescription>
            أكثر الوكلاء استخداماً
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userStats?.agentUsageChartData?.slice(0, 5).map((agent, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium">{agent.name}</span>
                <Badge variant="secondary">{agent.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * نموذج تصدير التقرير
 */
function ExportReportForm({
  onSubmit,
  isLoading
}: {
  onSubmit: (data: ExportReportData) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<ExportReportData>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    format: 'pdf',
    includeUsers: true,
    includeAgents: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-date">تاريخ البداية</Label>
          <Input
            id="start-date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="end-date">تاريخ النهاية</Label>
          <Input
            id="end-date"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="format">تنسيق التقرير</Label>
        <Select value={formData.format} onValueChange={(value: 'pdf' | 'xlsx' | 'csv') => setFormData(prev => ({ ...prev, format: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="xlsx">Excel</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>تضمين في التقرير</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="include-users"
              checked={formData.includeUsers}
              onChange={(e) => setFormData(prev => ({ ...prev, includeUsers: e.target.checked }))}
            />
            <Label htmlFor="include-users">بيانات المستخدمين</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="include-agents"
              checked={formData.includeAgents}
              onChange={(e) => setFormData(prev => ({ ...prev, includeAgents: e.target.checked }))}
            />
            <Label htmlFor="include-agents">بيانات الوكلاء</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              جاري التصدير...
            </>
          ) : (
            'تصدير التقرير'
          )}
        </Button>
      </div>
    </form>
  );
}

/**
 * نموذج التقرير المخصص
 */
function CustomReportForm({
  onSubmit,
  isLoading
}: {
  onSubmit: (data: CustomReportData) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<CustomReportData>({
    name: '',
    description: '',
    metrics: [],
    filters: {},
    schedule: 'weekly',
  });

  const availableMetrics = [
    'totalUsers',
    'totalGenerations',
    'totalCreditsUsed',
    'averageResponseTime',
    'successRate',
    'activeUsers',
    'errorRate'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleMetricToggle = (metric: string) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metric)
        ? prev.metrics.filter(m => m !== metric)
        : [...prev.metrics, metric]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="report-name">اسم التقرير</Label>
        <Input
          id="report-name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="أدخل اسم التقرير"
          required
        />
      </div>

      <div>
        <Label htmlFor="report-description">وصف التقرير</Label>
        <Textarea
          id="report-description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="أدخل وصف التقرير"
          rows={3}
        />
      </div>

      <div>
        <Label>المقاييس المطلوبة</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {availableMetrics.map((metric) => (
            <div key={metric} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={metric}
                checked={formData.metrics.includes(metric)}
                onChange={() => handleMetricToggle(metric)}
              />
              <Label htmlFor={metric} className="text-sm">
                {metric === 'totalUsers' ? 'إجمالي المستخدمين' :
                 metric === 'totalGenerations' ? 'إجمالي التوليدات' :
                 metric === 'totalCreditsUsed' ? 'إجمالي الائتمانات المستخدمة' :
                 metric === 'averageResponseTime' ? 'متوسط وقت الاستجابة' :
                 metric === 'successRate' ? 'معدل النجاح' :
                 metric === 'activeUsers' ? 'المستخدمين النشطين' :
                 metric === 'errorRate' ? 'معدل الخطأ' : metric}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="schedule">جدولة التقرير</Label>
        <Select value={formData.schedule} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setFormData(prev => ({ ...prev, schedule: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">يومي</SelectItem>
            <SelectItem value="weekly">أسبوعي</SelectItem>
            <SelectItem value="monthly">شهري</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isLoading || formData.metrics.length === 0}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              جاري الإنشاء...
            </>
          ) : (
            'إنشاء التقرير المخصص'
          )}
        </Button>
      </div>
    </form>
  );
}

/**
 * مكون العرض الرئيسي
 */
export function AnalyticsDemo() {
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="advanced" className="space-y-6">
        <TabsList>
          <TabsTrigger value="advanced">التحليلات المتقدمة</TabsTrigger>
          <TabsTrigger value="simple">التحليلات المبسطة</TabsTrigger>
        </TabsList>

        <TabsContent value="advanced">
          <AdvancedAnalyticsNew />
        </TabsContent>

        <TabsContent value="simple">
          <SimpleAnalyticsNew />
        </TabsContent>
      </Tabs>
    </div>
  );
}
