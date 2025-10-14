/**
 * مثال على استخدام hooks المدفوعات الجديدة
 *
 * هذا الملف يوضح كيفية استخدام النظام الجديد للمدفوعات
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
    useAdvancedPaymentManagementNew,
    useSimplePaymentManagementNew,
    type CreditPurchaseData,
    type PaymentReportData,
    type VerifyPaymentVariables
} from '@/hooks/use-payment-new';
import {
    CheckCircle,
    CreditCard,
    Download,
    Loader2,
    Plus,
    Receipt,
    RefreshCw,
    XCircle
} from 'lucide-react';
import React, { useState } from 'react';

/**
 * مكون إدارة المدفوعات المتقدمة الجديد
 */
export function AdvancedPaymentManagementNew() {
  const {
    pendingTransactions,
    verifiedTransactions,
    rejectedTransactions,
    userTransactions,
    transactionStats,
    isLoading,
    isError,
    error,
    handleDeductCredits,
    handlePurchaseCredits,
    handleSubmitPaymentProof,
    handleVerifyPayment,
    handleExportReport,
    isDeductingCredits,
    isPurchasingCredits,
    isSubmittingProof,
    isVerifyingPayment,
    isExportingReport,
    fetchNextPendingPage,
    fetchNextVerifiedPage,
    fetchNextRejectedPage,
    hasNextPendingPage,
    hasNextVerifiedPage,
    hasNextRejectedPage
  } = useAdvancedPaymentManagementNew();

  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">جاري تحميل المعاملات...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600">
        <span>خطأ في تحميل المعاملات: {error?.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة المدفوعات المتقدمة</h2>
          <p className="text-gray-600">إدارة جميع المعاملات المالية</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث
          </Button>

          <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                شراء ائتمانات
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>شراء ائتمانات جديدة</DialogTitle>
                <DialogDescription>
                  اختر عدد الائتمانات وطريقة الدفع
                </DialogDescription>
              </DialogHeader>
              <PurchaseCreditsForm
                onSubmit={(data) => {
                  handlePurchaseCredits(data);
                  setShowPurchaseDialog(false);
                }}
                isLoading={isPurchasingCredits}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                تصدير تقرير
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تصدير تقرير المدفوعات</DialogTitle>
                <DialogDescription>
                  اختر الفترة والتنسيق لتصدير التقرير
                </DialogDescription>
              </DialogHeader>
              <ExportReportForm
                onSubmit={(data) => {
                  handleExportReport(data);
                  setShowExportDialog(false);
                }}
                isLoading={isExportingReport}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">إجمالي المعاملات</p>
                <p className="text-2xl font-bold">{transactionStats?.totalTransactions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">المؤكدة</p>
                <p className="text-2xl font-bold">{transactionStats?.verifiedAmount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Loader2 className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">المعلقة</p>
                <p className="text-2xl font-bold">{transactionStats?.pendingAmount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">المرفوضة</p>
                <p className="text-2xl font-bold">{transactionStats?.rejectedAmount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">إجمالي المبلغ</p>
                <p className="text-2xl font-bold">{transactionStats?.totalAmount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* إدارة المعاملات */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">المعلقة ({pendingTransactions.length})</TabsTrigger>
          <TabsTrigger value="verified">المؤكدة ({verifiedTransactions.length})</TabsTrigger>
          <TabsTrigger value="rejected">المرفوضة ({rejectedTransactions.length})</TabsTrigger>
          <TabsTrigger value="user">معاملاتي ({userTransactions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>المعاملات المعلقة</CardTitle>
              <CardDescription>
                المعاملات التي تحتاج إلى مراجعة وتأكيد
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المعرف</TableHead>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الائتمانات</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{transaction.userId}</TableCell>
                      <TableCell>{transaction.amount}</TableCell>
                      <TableCell>{transaction.credits}</TableCell>
                      <TableCell>
                        {new Date(transaction.createdAt).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowVerifyDialog(true);
                            }}
                            disabled={isVerifyingPayment}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              const variables: VerifyPaymentVariables = {
                                transactionId: transaction.id,
                                userId: transaction.userId,
                                creditsToGrant: transaction.credits,
                                status: 'rejected',
                                adminNotes: 'مرفوض من قبل المدير'
                              };
                              handleVerifyPayment(variables);
                            }}
                            disabled={isVerifyingPayment}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {hasNextPendingPage && (
                <div className="flex justify-center mt-4">
                  <Button
                    onClick={() => fetchNextPendingPage()}
                    variant="outline"
                  >
                    تحميل المزيد
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verified" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>المعاملات المؤكدة</CardTitle>
              <CardDescription>
                المعاملات التي تم تأكيدها بنجاح
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المعرف</TableHead>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الائتمانات</TableHead>
                    <TableHead>تاريخ التأكيد</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verifiedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{transaction.userId}</TableCell>
                      <TableCell>{transaction.amount}</TableCell>
                      <TableCell>{transaction.credits}</TableCell>
                      <TableCell>
                        {new Date(transaction.updatedAt).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">مؤكدة</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {hasNextVerifiedPage && (
                <div className="flex justify-center mt-4">
                  <Button
                    onClick={() => fetchNextVerifiedPage()}
                    variant="outline"
                  >
                    تحميل المزيد
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>المعاملات المرفوضة</CardTitle>
              <CardDescription>
                المعاملات التي تم رفضها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المعرف</TableHead>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الائتمانات</TableHead>
                    <TableHead>تاريخ الرفض</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rejectedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{transaction.userId}</TableCell>
                      <TableCell>{transaction.amount}</TableCell>
                      <TableCell>{transaction.credits}</TableCell>
                      <TableCell>
                        {new Date(transaction.updatedAt).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">مرفوضة</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {hasNextRejectedPage && (
                <div className="flex justify-center mt-4">
                  <Button
                    onClick={() => fetchNextRejectedPage()}
                    variant="outline"
                  >
                    تحميل المزيد
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معاملاتي</CardTitle>
              <CardDescription>
                تاريخ معاملاتي المالية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المعرف</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الائتمانات</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{transaction.amount}</TableCell>
                      <TableCell>{transaction.credits}</TableCell>
                      <TableCell>
                        {new Date(transaction.createdAt).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          transaction.status === 'verified' ? 'default' :
                          transaction.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {transaction.status === 'verified' ? 'مؤكدة' :
                           transaction.status === 'pending' ? 'معلقة' : 'مرفوضة'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* حوار التحقق من المعاملة */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>التحقق من المعاملة</DialogTitle>
            <DialogDescription>
              تأكيد أو رفض المعاملة المحددة
            </DialogDescription>
          </DialogHeader>
          <VerifyTransactionForm
            transaction={selectedTransaction}
            onSubmit={(variables) => {
              handleVerifyPayment(variables);
              setShowVerifyDialog(false);
            }}
            isLoading={isVerifyingPayment}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * مكون إدارة المدفوعات المبسطة الجديد
 */
export function SimplePaymentManagementNew() {
  const {
    userTransactions,
    transactionStats,
    isLoading,
    isError,
    error,
    handlePurchaseCredits,
    isPurchasingCredits
  } = useSimplePaymentManagementNew();

  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">جاري تحميل المعاملات...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600">
        <span>خطأ في تحميل المعاملات: {error?.message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة المدفوعات المبسطة</h2>
          <p className="text-gray-600">إدارة معاملاتك المالية</p>
        </div>

        <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              شراء ائتمانات
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>شراء ائتمانات جديدة</DialogTitle>
              <DialogDescription>
                اختر عدد الائتمانات وطريقة الدفع
              </DialogDescription>
            </DialogHeader>
            <PurchaseCreditsForm
              onSubmit={(data) => {
                handlePurchaseCredits(data);
                setShowPurchaseDialog(false);
              }}
              isLoading={isPurchasingCredits}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">إجمالي المعاملات</p>
                <p className="text-2xl font-bold">{transactionStats?.totalTransactions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">المؤكدة</p>
                <p className="text-2xl font-bold">{transactionStats?.verifiedAmount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">إجمالي المبلغ</p>
                <p className="text-2xl font-bold">{transactionStats?.totalAmount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* معاملاتي */}
      <Card>
        <CardHeader>
          <CardTitle>معاملاتي</CardTitle>
          <CardDescription>
            تاريخ معاملاتي المالية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المعرف</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الائتمانات</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.id}</TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>{transaction.credits}</TableCell>
                  <TableCell>
                    {new Date(transaction.createdAt).toLocaleDateString('ar-SA')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      transaction.status === 'verified' ? 'default' :
                      transaction.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {transaction.status === 'verified' ? 'مؤكدة' :
                       transaction.status === 'pending' ? 'معلقة' : 'مرفوضة'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * نموذج شراء الائتمانات
 */
function PurchaseCreditsForm({
  onSubmit,
  isLoading
}: {
  onSubmit: (data: CreditPurchaseData) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<CreditPurchaseData>({
    credits: 100,
    amount: 10,
    currency: 'USD',
    paymentMethod: 'credit_card',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="credits">عدد الائتمانات</Label>
        <Input
          id="credits"
          type="number"
          value={formData.credits}
          onChange={(e) => setFormData(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
          min="1"
          required
        />
      </div>

      <div>
        <Label htmlFor="amount">المبلغ</Label>
        <Input
          id="amount"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
          min="0.01"
          step="0.01"
          required
        />
      </div>

      <div>
        <Label htmlFor="currency">العملة</Label>
        <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">دولار أمريكي</SelectItem>
            <SelectItem value="EUR">يورو</SelectItem>
            <SelectItem value="SAR">ريال سعودي</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="payment-method">طريقة الدفع</Label>
        <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="credit_card">بطاقة ائتمان</SelectItem>
            <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
            <SelectItem value="paypal">PayPal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              جاري المعالجة...
            </>
          ) : (
            'شراء الائتمانات'
          )}
        </Button>
      </div>
    </form>
  );
}

/**
 * نموذج تصدير التقرير
 */
function ExportReportForm({
  onSubmit,
  isLoading
}: {
  onSubmit: (data: PaymentReportData) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<PaymentReportData>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    format: 'pdf',
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
 * نموذج التحقق من المعاملة
 */
function VerifyTransactionForm({
  transaction,
  onSubmit,
  isLoading
}: {
  transaction: any;
  onSubmit: (variables: VerifyPaymentVariables) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<VerifyPaymentVariables>({
    transactionId: transaction?.id || '',
    userId: transaction?.userId || '',
    creditsToGrant: transaction?.credits || 0,
    status: 'verified',
    adminNotes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!transaction) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded">
        <h4 className="font-semibold mb-2">تفاصيل المعاملة</h4>
        <p><strong>المعرف:</strong> {transaction.id}</p>
        <p><strong>المستخدم:</strong> {transaction.userId}</p>
        <p><strong>المبلغ:</strong> {transaction.amount}</p>
        <p><strong>الائتمانات:</strong> {transaction.credits}</p>
      </div>

      <div>
        <Label htmlFor="status">القرار</Label>
        <Select value={formData.status} onValueChange={(value: 'verified' | 'rejected') => setFormData(prev => ({ ...prev, status: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="verified">تأكيد</SelectItem>
            <SelectItem value="rejected">رفض</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="admin-notes">ملاحظات المدير</Label>
        <Textarea
          id="admin-notes"
          value={formData.adminNotes}
          onChange={(e) => setFormData(prev => ({ ...prev, adminNotes: e.target.value }))}
          placeholder="أدخل ملاحظاتك..."
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              جاري المعالجة...
            </>
          ) : (
            formData.status === 'verified' ? 'تأكيد المعاملة' : 'رفض المعاملة'
          )}
        </Button>
      </div>
    </form>
  );
}

/**
 * مكون العرض الرئيسي
 */
export function PaymentDemo() {
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="advanced" className="space-y-6">
        <TabsList>
          <TabsTrigger value="advanced">إدارة متقدمة</TabsTrigger>
          <TabsTrigger value="simple">إدارة مبسطة</TabsTrigger>
        </TabsList>

        <TabsContent value="advanced">
          <AdvancedPaymentManagementNew />
        </TabsContent>

        <TabsContent value="simple">
          <SimplePaymentManagementNew />
        </TabsContent>
      </Tabs>
    </div>
  );
}
