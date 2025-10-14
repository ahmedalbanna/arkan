/**
 * مثال على استخدام النظام الجديد في مكون حقيقي
 *
 * هذا الملف يوضح كيفية استخدام hooks الجديدة في مكونات React
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Loader2, User, Users } from 'lucide-react';
import React, { useState } from 'react';

// استخدام النظام الجديد
import { useWritingToolNew } from '@/hooks/examples/new-system-usage';
import { useAdmins, useLogin, useUsers, useUserStatsNew } from '@/hooks/use-user-new';

/**
 * مكون تسجيل الدخول باستخدام النظام الجديد
 */
export function LoginFormNew() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(credentials);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          تسجيل الدخول - النظام الجديد
        </CardTitle>
        <CardDescription>
          استخدم النظام الجديد للخدمات مع معالجة الأخطاء المحسنة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              placeholder="أدخل بريدك الإلكتروني"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              placeholder="أدخل كلمة المرور"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري تسجيل الدخول...
              </>
            ) : (
              'تسجيل الدخول'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * مكون إدارة المستخدمين باستخدام النظام الجديد
 */
export function UsersManagementNew() {
  const { data: usersData, isLoading, error } = useUsers();
  const { data: adminsData, isLoading: adminsLoading } = useAdmins();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">جاري تحميل المستخدمين...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>حدث خطأ في تحميل المستخدمين</p>
            <p className="text-sm text-gray-500 mt-2">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const allUsers = usersData?.pages.flatMap(page => page.users) || [];
  const admins = adminsData || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            إدارة المستخدمين - النظام الجديد
          </CardTitle>
          <CardDescription>
            عرض المستخدمين باستخدام النظام الجديد مع معالجة الأخطاء المحسنة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Badge variant="outline">إجمالي المستخدمين</Badge>
              <span className="font-semibold">{allUsers.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">المديرين</Badge>
              <span className="font-semibold">{admins.length}</span>
            </div>
          </div>

          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users">المستخدمين</TabsTrigger>
              <TabsTrigger value="admins">المديرين</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <div className="grid gap-4">
                {allUsers.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                            </Badge>
                            <Badge variant="outline">
                              {user.credits} ائتمان
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                          </p>
                          <Badge variant={user.isActive ? 'default' : 'destructive'}>
                            {user.isActive ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="admins" className="space-y-4">
              <div className="grid gap-4">
                {admins.map((admin) => (
                  <Card key={admin.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{admin.name}</h3>
                          <p className="text-sm text-gray-500">{admin.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="default">مدير</Badge>
                            <Badge variant="outline">
                              {admin.credits} ائتمان
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(admin.createdAt).toLocaleDateString('ar-SA')}
                          </p>
                          <Badge variant={admin.isActive ? 'default' : 'destructive'}>
                            {admin.isActive ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * مكون أدوات الكتابة باستخدام النظام الجديد
 */
export function WritingToolsNew() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [selectedTool, setSelectedTool] = useState('improve');

  const improveMutation = useWritingToolNew('improve');
  const summarizeMutation = useWritingToolNew('summarize');
  const paraphraseMutation = useWritingToolNew('paraphrase');

  const handleToolAction = (tool: string) => {
    const mutations = {
      improve: improveMutation,
      summarize: summarizeMutation,
      paraphrase: paraphraseMutation
    };

    const mutation = mutations[tool as keyof typeof mutations];
    if (mutation) {
      mutation.mutate(
        { text },
        {
          onSuccess: (data) => {
            setResult(data.result || data.content || 'تمت المعالجة بنجاح');
          }
        }
      );
    }
  };

  const currentMutation = {
    improve: improveMutation,
    summarize: summarizeMutation,
    paraphrase: paraphraseMutation
  }[selectedTool];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          أدوات الكتابة - النظام الجديد
        </CardTitle>
        <CardDescription>
          استخدام النظام الجديد لأدوات الذكاء الاصطناعي مع معالجة الأخطاء المحسنة
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="text">النص المراد معالجته</Label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="أدخل النص المراد معالجته..."
            className="w-full h-32 p-3 border rounded-md resize-none"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => handleToolAction('improve')}
            disabled={!text || currentMutation?.isPending}
            variant={selectedTool === 'improve' ? 'default' : 'outline'}
          >
            {improveMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري التحسين...
              </>
            ) : (
              'تحسين النص'
            )}
          </Button>

          <Button
            onClick={() => handleToolAction('summarize')}
            disabled={!text || currentMutation?.isPending}
            variant={selectedTool === 'summarize' ? 'default' : 'outline'}
          >
            {summarizeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري التلخيص...
              </>
            ) : (
              'تلخيص النص'
            )}
          </Button>

          <Button
            onClick={() => handleToolAction('paraphrase')}
            disabled={!text || currentMutation?.isPending}
            variant={selectedTool === 'paraphrase' ? 'default' : 'outline'}
          >
            {paraphraseMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري إعادة الصياغة...
              </>
            ) : (
              'إعادة صياغة'
            )}
          </Button>
        </div>

        {result && (
          <div className="space-y-2">
            <Label>النتيجة</Label>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="whitespace-pre-wrap">{result}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * مكون التحليلات باستخدام النظام الجديد
 */
export function AnalyticsNew() {
  const { data: userStats, isLoading, error } = useUserStatsNew();

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">جاري تحميل التحليلات...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>حدث خطأ في تحميل التحليلات</p>
            <p className="text-sm text-gray-500 mt-2">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          التحليلات - النظام الجديد
        </CardTitle>
        <CardDescription>
          عرض إحصائيات المستخدم باستخدام النظام الجديد مع معالجة الأخطاء المحسنة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {userStats?.totalGenerations || 0}
            </div>
            <p className="text-sm text-gray-500">إجمالي التوليدات</p>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {userStats?.creditsUsed || 0}
            </div>
            <p className="text-sm text-gray-500">الائتمانات المستخدمة</p>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {userStats?.agentUsageChartData?.length || 0}
            </div>
            <p className="text-sm text-gray-500">الوكلاء المستخدمة</p>
          </div>
        </div>

        {userStats?.agentUsageChartData && userStats.agentUsageChartData.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">استخدام الوكلاء</h3>
            <div className="space-y-2">
              {userStats.agentUsageChartData.map((agent, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <span className="font-medium">{agent.name}</span>
                  <Badge variant="outline">{agent.count} استخدام</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {userStats?.recentActivity && userStats.recentActivity.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">النشاط الأخير</h3>
            <div className="space-y-2">
              {userStats.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <span className="font-medium">{activity.userName}</span>
                    <p className="text-sm text-gray-500">استخدم وكيل: {activity.agentId}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(activity.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * مكون رئيسي يجمع جميع الأمثلة
 */
export function NewSystemDemo() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">عرض النظام الجديد</h1>
        <p className="text-gray-600">
          أمثلة على استخدام النظام الجديد للخدمات مع معالجة الأخطاء المحسنة
        </p>
      </div>

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
          <TabsTrigger value="users">المستخدمين</TabsTrigger>
          <TabsTrigger value="writing">أدوات الكتابة</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <LoginFormNew />
        </TabsContent>

        <TabsContent value="users">
          <UsersManagementNew />
        </TabsContent>

        <TabsContent value="writing">
          <WritingToolsNew />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsNew />
        </TabsContent>
      </Tabs>
    </div>
  );
}
