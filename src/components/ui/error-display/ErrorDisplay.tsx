/**
 * مكون العرض المركزي للأخطاء
 * يوفر واجهة موحدة لعرض جميع أنواع الأخطاء
 */

import { useErrorContext } from '@/context/ErrorContext';
import { EnhancedError, ErrorSeverity } from '@/core/types/error-types';
import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../button';
import { Card, CardContent } from '../card';
import { ErrorBanner } from './ErrorBanner';
import { ErrorModal } from './ErrorModal';
import { ErrorToast } from './ErrorToast';

export interface ErrorDisplayProps {
    // إعدادات العرض
    showToast?: boolean;
    showBanner?: boolean;
    showModal?: boolean;

    // إعدادات الإغلاق التلقائي
    autoDismiss?: boolean;
    autoDismissDelay?: number;

    // إعدادات التصفية
    minSeverity?: ErrorSeverity;
    maxErrors?: number;

    // معالجات الأحداث
    onError?: (error: EnhancedError) => void;
    onRetry?: (error: EnhancedError) => void;
    onFallback?: (error: EnhancedError) => void;
    onDismiss?: (error: EnhancedError) => void;

    className?: string;
}

export function ErrorDisplay({
    showToast = true,
    showBanner = false,
    showModal = false,
    autoDismiss = true,
    autoDismissDelay = 5000,
    minSeverity = 'low',
    maxErrors = 5,
    onError,
    onRetry,
    onFallback,
    onDismiss,
    className
}: ErrorDisplayProps) {
    const { errors, removeError } = useErrorContext();
    const [toastErrors, setToastErrors] = useState<EnhancedError[]>([]);
    const [bannerErrors, setBannerErrors] = useState<EnhancedError[]>([]);
    const [modalError, setModalError] = useState<EnhancedError | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // تصفية الأخطاء حسب الشدة
    const filteredErrors = errors.filter(error => {
        const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
        return severityOrder[error.severity] >= severityOrder[minSeverity];
    });

    // تحديث أخطاء Toast
    useEffect(() => {
        if (showToast) {
            const newToastErrors = filteredErrors
                .filter(error => !toastErrors.some(toast => toast.code === error.code))
                .slice(0, maxErrors);

            if (newToastErrors.length > 0) {
                setToastErrors(prev => [...newToastErrors, ...prev].slice(0, maxErrors));
            }
        }
    }, [errors, showToast, maxErrors, filteredErrors, toastErrors]);

    // تحديث أخطاء Banner
    useEffect(() => {
        if (showBanner) {
            const criticalErrors = filteredErrors.filter(error => error.severity === 'critical');
            setBannerErrors(criticalErrors.slice(0, 3));
        }
    }, [errors, showBanner, filteredErrors]);

    // معالجة إعادة المحاولة
    const handleRetry = (error: EnhancedError) => {
        onRetry?.(error);
        removeError(error.code);

        if (showToast) {
            setToastErrors(prev => prev.filter(e => e.code !== error.code));
        }
        if (showBanner) {
            setBannerErrors(prev => prev.filter(e => e.code !== error.code));
        }
    };

    // معالجة الحل الاحتياطي
    const handleFallback = (error: EnhancedError) => {
        onFallback?.(error);
        removeError(error.code);

        if (showToast) {
            setToastErrors(prev => prev.filter(e => e.code !== error.code));
        }
        if (showBanner) {
            setBannerErrors(prev => prev.filter(e => e.code !== error.code));
        }
    };

    // معالجة الإغلاق
    const handleDismiss = (error: EnhancedError) => {
        onDismiss?.(error);
        removeError(error.code);

        if (showToast) {
            setToastErrors(prev => prev.filter(e => e.code !== error.code));
        }
        if (showBanner) {
            setBannerErrors(prev => prev.filter(e => e.code !== error.code));
        }
    };

    // فتح Modal للخطأ
    const openErrorModal = (error: EnhancedError) => {
        setModalError(error);
        setIsModalOpen(true);
    };

    // إغلاق Modal
    const closeErrorModal = () => {
        setIsModalOpen(false);
        setModalError(null);
    };

    return (
        <div className={className}>
            {/* Toast Errors */}
            {showToast && (
                <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
                    {toastErrors.map((error) => (
                        <ErrorToast
                            key={error.code}
                            error={error}
                            onRetry={() => handleRetry(error)}
                            onFallback={() => handleFallback(error)}
                            onDismiss={() => handleDismiss(error)}
                            autoDismiss={autoDismiss}
                            autoDismissDelay={autoDismissDelay}
                        />
                    ))}
                </div>
            )}

            {/* Banner Errors */}
            {showBanner && (
                <div className="space-y-2">
                    {bannerErrors.map((error) => (
                        <ErrorBanner
                            key={error.code}
                            error={error}
                            onRetry={() => handleRetry(error)}
                            onFallback={() => handleFallback(error)}
                            onDismiss={() => handleDismiss(error)}
                        />
                    ))}
                </div>
            )}

            {/* Error Modal */}
            {showModal && modalError && (
                <ErrorModal
                    error={modalError}
                    isOpen={isModalOpen}
                    onClose={closeErrorModal}
                    onRetry={() => handleRetry(modalError)}
                    onFallback={() => handleFallback(modalError)}
                    showTechnicalDetails={true}
                />
            )}
        </div>
    );
}

// مكون مبسط للاستخدام السريع
interface SimpleErrorDisplayProps {
    error: EnhancedError | null;
    onRetry?: () => void;
    onDismiss?: () => void;
    showDetails?: boolean;
    className?: string;
}

export function SimpleErrorDisplay({
    error,
    onRetry,
    onDismiss,
    showDetails = false,
    className
}: SimpleErrorDisplayProps) {
    const [showModal, setShowModal] = useState(false);

    if (!error) return null;

    return (
        <div className={className}>
            <Card className="border-l-4 border-l-red-500 bg-red-50">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                            <div className="flex-1">
                                <h4 className="font-medium text-red-800">{error.userMessage}</h4>
                                <p className="text-sm text-red-700 mt-1">{error.userGuidance}</p>

                                {showDetails && (
                                    <div className="mt-2">
                                        <Button
                                            onClick={() => setShowModal(true)}
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                        >
                                            عرض التفاصيل
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {error.isRetryable && onRetry && (
                                <Button
                                    onClick={onRetry}
                                    size="sm"
                                    variant="outline"
                                    className="text-xs"
                                >
                                    إعادة المحاولة
                                </Button>
                            )}

                            {onDismiss && (
                                <Button
                                    onClick={onDismiss}
                                    size="sm"
                                    variant="ghost"
                                    className="p-1 h-6 w-6"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Modal للتفاصيل */}
            {showModal && (
                <ErrorModal
                    error={error}
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onRetry={onRetry}
                    showTechnicalDetails={true}
                />
            )}
        </div>
    );
}
