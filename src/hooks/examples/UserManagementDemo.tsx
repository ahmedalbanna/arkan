/**
 * مثال على استخدام hooks إدارة المستخدمين الجديدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد لإدارة المستخدمين
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
import {
    useAdvancedUserManagementNew,
    useCreateUserDialogNew,
    useUpdateUserDialogNew,
    type CreateUserFormValues,
    type UpdateUserFormValues
} from '@/hooks/use-user-management-new';
import {
    AlertTriangle,
    Edit,
    Loader2,
    Plus,
    Trash2,
    User,
    UserCheck,
    UserX,
    Users
} from 'lucide-react';

/**
 * مكون إدارة المستخدمين الجديد
 */
export function UserManagementNew() {
  const {
    allUsers,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    handleDeleteUser,
    handleResetPassword,
    handleUpdateCredits,
    handleToggleStatus,
    isDeleting,
    isResettingPassword,
    isUpdatingCredits,
    isTogglingStatus
  } = useAdvancedUserManagementNew();

  const createUserDialog = useCreateUserDialogNew();
  const updateUserDialog = useUpdateUserDialogNew();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">جاري تحميل المستخدمين...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600">
        <AlertTriangle className="h-8 w-8" />
        <span className="ml-2">خطأ في تحميل المستخدمين: {error?.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة المستخدمين</h2>
          <p className="text-gray-600">إدارة المستخدمين باستخدام النظام الجديد</p>
        </div>

        <Dialog open={createUserDialog.isOpen} onOpenChange={createUserDialog.setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              إضافة مستخدم
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة مستخدم جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات المستخدم الجديد
              </DialogDescription>
            </DialogHeader>
            <CreateUserForm {...createUserDialog} />
          </DialogContent>
        </Dialog>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold">{allUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">المستخدمين النشطين</p>
                <p className="text-2xl font-bold">
                  {allUsers.filter(u => u.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">المدراء</p>
                <p className="text-2xl font-bold">
                  {allUsers.filter(u => u.role === 'admin').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <UserX className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">المستخدمين المعطلين</p>
                <p className="text-2xl font-bold">
                  {allUsers.filter(u => !u.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* جدول المستخدمين */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المستخدمين</CardTitle>
          <CardDescription>
            إدارة جميع المستخدمين في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>الائتمانات</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.credits}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'default' : 'destructive'}>
                      {user.isActive ? 'نشط' : 'معطل'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateUserDialog.openDialog(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(user.id, !user.isActive)}
                        disabled={isTogglingStatus}
                      >
                        {user.isActive ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* زر تحميل المزيد */}
          {hasNextPage && (
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    جاري التحميل...
                  </>
                ) : (
                  'تحميل المزيد'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* حوار تحديث المستخدم */}
      <Dialog open={updateUserDialog.isOpen} onOpenChange={updateUserDialog.setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تحديث المستخدم</DialogTitle>
            <DialogDescription>
              تحديث بيانات المستخدم المحدد
            </DialogDescription>
          </DialogHeader>
          <UpdateUserForm {...updateUserDialog} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * نموذج إنشاء مستخدم جديد
 */
function CreateUserForm({
  form,
  mutation,
  onSubmit
}: {
  form: any;
  mutation: any;
  onSubmit: (data: CreateUserFormValues) => void;
}) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">الاسم</Label>
        <Input
          id="name"
          {...form.register('name')}
          placeholder="أدخل اسم المستخدم"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input
          id="email"
          type="email"
          {...form.register('email')}
          placeholder="أدخل البريد الإلكتروني"
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">كلمة المرور</Label>
        <Input
          id="password"
          type="password"
          {...form.register('password')}
          placeholder="أدخل كلمة المرور"
        />
        {form.formState.errors.password && (
          <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="role">الدور</Label>
        <Select onValueChange={(value) => form.setValue('role', value as 'user' | 'admin')}>
          <SelectTrigger>
            <SelectValue placeholder="اختر الدور" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">مستخدم</SelectItem>
            <SelectItem value="admin">مدير</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="credits">الائتمانات</Label>
        <Input
          id="credits"
          type="number"
          {...form.register('credits')}
          placeholder="أدخل عدد الائتمانات"
        />
        {form.formState.errors.credits && (
          <p className="text-sm text-red-600">{form.formState.errors.credits.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              جاري الإنشاء...
            </>
          ) : (
            'إنشاء المستخدم'
          )}
        </Button>
      </div>
    </form>
  );
}

/**
 * نموذج تحديث المستخدم
 */
function UpdateUserForm({
  form,
  mutation,
  onSubmit,
  selectedUser
}: {
  form: any;
  mutation: any;
  onSubmit: (data: UpdateUserFormValues) => void;
  selectedUser: any;
}) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">الاسم</Label>
        <Input
          id="name"
          {...form.register('name')}
          placeholder="أدخل اسم المستخدم"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input
          id="email"
          type="email"
          {...form.register('email')}
          placeholder="أدخل البريد الإلكتروني"
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="role">الدور</Label>
        <Select onValueChange={(value) => form.setValue('role', value as 'user' | 'admin')}>
          <SelectTrigger>
            <SelectValue placeholder="اختر الدور" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">مستخدم</SelectItem>
            <SelectItem value="admin">مدير</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="credits">الائتمانات</Label>
        <Input
          id="credits"
          type="number"
          {...form.register('credits')}
          placeholder="أدخل عدد الائتمانات"
        />
        {form.formState.errors.credits && (
          <p className="text-sm text-red-600">{form.formState.errors.credits.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              جاري التحديث...
            </>
          ) : (
            'تحديث المستخدم'
          )}
        </Button>
      </div>
    </form>
  );
}

/**
 * مكون العرض الرئيسي
 */
export function UserManagementDemo() {
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="management" className="space-y-6">
        <TabsList>
          <TabsTrigger value="management">إدارة المستخدمين</TabsTrigger>
        </TabsList>

        <TabsContent value="management">
          <UserManagementNew />
        </TabsContent>
      </Tabs>
    </div>
  );
}
