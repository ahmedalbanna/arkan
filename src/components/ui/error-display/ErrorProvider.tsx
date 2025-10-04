/**
 * مكون ErrorProvider للعرض المركزي للأخطاء
 * يوفر واجهة موحدة لعرض جميع أنواع الأخطاء في التطبيق
 */

'use client';

import { ErrorContext } from '@/context/ErrorContext';
import { ErrorDisplay } from './ErrorDisplay';

export interface ErrorProviderProps {
    children: React.ReactNode;
    maxErrors?: number;
    autoCleanup?: boolean;
    cleanupInterval?: number;
    showToast?: boolean;
    showBanner?: boolean;
    showModal?: boolean;
    autoDismiss?: boolean;
    autoDismissDelay?: number;
    minSeverity?: 'low' | 'medium' | 'high' | 'critical';
    className?: string;
}

export function ErrorProvider({
    children,
    maxErrors = 50,
    autoCleanup = true,
    cleanupInterval = 300000,
    showToast = true,
    showBanner = false,
    showModal = false,
    autoDismiss = true,
    autoDismissDelay = 5000,
    minSeverity = 'low',
    className
}: ErrorProviderProps) {
    return (
        <ErrorContext.Provider value={{
            errors: [],
            isOnline: true,
            addError: () => { },
            removeError: () => { },
            clearAllErrors: () => { },
            handleError: () => ({} as any),
            getErrorStats: () => ({}),
            getErrorHistory: () => []
        }}>
            {children}

            {/* عرض الأخطاء */}
            <ErrorDisplay
                showToast={showToast}
                showBanner={showBanner}
                showModal={showModal}
                autoDismiss={autoDismiss}
                autoDismissDelay={autoDismissDelay}
                minSeverity={minSeverity}
                maxErrors={5}
                className={className}
            />
        </ErrorContext.Provider>
    );
}
