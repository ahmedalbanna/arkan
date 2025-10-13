/**
 * أنواع المكونات المحسنة لتحسين Type Safety
 *
 * هذا الملف يحتوي على أنواع محسنة للمكونات مع استبدال `any`
 * بأنواع محددة ومفصلة
 */

import React from 'react';
import { TypedError } from './improved-types';

// ==================== أنواع المكونات الأساسية ====================

/**
 * خصائص المكون الأساسية محسنة
 */
export interface BaseComponentProps {
    className?: string;
    children?: React.ReactNode;
    id?: string;
    'data-testid'?: string;
    'data-cy'?: string;
    style?: React.CSSProperties;
    role?: string;
    ariaLabel?: string;
    ariaDescribedBy?: string;
}

/**
 * حالة المكون محسنة
 */
export interface ComponentState {
    loading: boolean;
    error?: TypedError;
    data?: unknown;
    isVisible?: boolean;
    isEnabled?: boolean;
}

/**
 * خصائص المكون التفاعلي محسنة
 */
export interface InteractiveComponentProps extends BaseComponentProps {
    onClick?: (event: React.MouseEvent) => void;
    onDoubleClick?: (event: React.MouseEvent) => void;
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
    onFocus?: (event: React.FocusEvent) => void;
    onBlur?: (event: React.FocusEvent) => void;
    disabled?: boolean;
    tabIndex?: number;
}

// ==================== أنواع النماذج المحسنة ====================

/**
 * حالة النموذج محسنة
 */
export interface FormState<T = Record<string, unknown>> {
    values: T;
    errors: Record<keyof T, string>;
    touched: Record<keyof T, boolean>;
    isSubmitting: boolean;
    isValid: boolean;
    isDirty: boolean;
}

/**
 * خيارات النموذج محسنة
 */
export interface FormOptions {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    validateOnSubmit?: boolean;
    debounceMs?: number;
    initialValues?: Record<string, unknown>;
    validationSchema?: Record<string, unknown>;
}

/**
 * حقل النموذج محسن
 */
export interface FormField<T = unknown> {
    name: string;
    value: T;
    error?: string;
    touched: boolean;
    required: boolean;
    disabled: boolean;
    placeholder?: string;
    label?: string;
    helpText?: string;
    validation?: {
        required?: boolean;
        min?: number;
        max?: number;
        pattern?: RegExp;
        custom?: (value: T) => string | null;
    };
}

// ==================== أنواع الأزرار المحسنة ====================

/**
 * خصائص الزر محسنة
 */
export interface ButtonProps extends InteractiveComponentProps {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    type?: 'button' | 'submit' | 'reset';
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    tooltip?: string;
}

/**
 * خصائص زر التحميل محسنة
 */
export interface LoadingButtonProps extends ButtonProps {
    loading: boolean;
    loadingText?: string;
    spinner?: React.ReactNode;
}

// ==================== أنواع الإدخال المحسنة ====================

/**
 * خصائص الإدخال الأساسية محسنة
 */
export interface BaseInputProps extends InteractiveComponentProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    label?: string;
    helpText?: string;
    maxLength?: number;
    minLength?: number;
}

/**
 * خصائص الإدخال النصي محسنة
 */
export interface InputProps extends BaseInputProps {
    type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';
    autoComplete?: string;
    autoFocus?: boolean;
    readOnly?: boolean;
    pattern?: string;
}

/**
 * خصائص منطقة النص محسنة
 */
export interface TextareaProps extends BaseInputProps {
    rows?: number;
    cols?: number;
    resize?: 'none' | 'both' | 'horizontal' | 'vertical';
    autoResize?: boolean;
    maxRows?: number;
    minRows?: number;
}

/**
 * خصائص التحديد محسنة
 */
export interface SelectProps extends BaseInputProps {
    options: SelectOption[];
    multiple?: boolean;
    searchable?: boolean;
    clearable?: boolean;
    placeholder?: string;
    noOptionsText?: string;
    loading?: boolean;
}

/**
 * خيار التحديد محسن
 */
export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
    icon?: React.ReactNode;
    group?: string;
}

// ==================== أنواع المودال المحسنة ====================

/**
 * خصائص المودال محسنة
 */
export interface ModalProps extends BaseComponentProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closable?: boolean;
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
    showCloseButton?: boolean;
    footer?: React.ReactNode;
    header?: React.ReactNode;
    body?: React.ReactNode;
}

/**
 * خصائص مودال التأكيد محسنة
 */
export interface ConfirmModalProps extends ModalProps {
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    variant?: 'default' | 'warning' | 'danger';
    loading?: boolean;
}

// ==================== أنواع التبويبات المحسنة ====================

/**
 * خصائص التبويبات محسنة
 */
export interface TabsProps extends BaseComponentProps {
    value: string;
    onChange: (value: string) => void;
    orientation?: 'horizontal' | 'vertical';
    variant?: 'default' | 'pills' | 'underline';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

/**
 * خصائص التبويب محسنة
 */
export interface TabProps extends BaseComponentProps {
    value: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    badge?: string | number;
    content?: React.ReactNode;
}

// ==================== أنواع الإشعارات المحسنة ====================

/**
 * خصائص الإشعار محسنة
 */
export interface ToastProps extends BaseComponentProps {
    id: string;
    title?: string;
    description?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top' | 'bottom';
    closable?: boolean;
    action?: ToastAction;
    onClose?: () => void;
}

/**
 * إجراء الإشعار محسن
 */
export interface ToastAction {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
}

// ==================== أنواع الجداول المحسنة ====================

/**
 * خصائص الجدول محسنة
 */
export interface TableProps<T = Record<string, unknown>> extends BaseComponentProps {
    data: T[];
    columns: TableColumn<T>[];
    loading?: boolean;
    emptyMessage?: string;
    pagination?: TablePagination;
    sorting?: TableSorting;
    selection?: TableSelection<T>;
    actions?: TableAction<T>[];
    stickyHeader?: boolean;
    striped?: boolean;
    hoverable?: boolean;
}

/**
 * عمود الجدول محسن
 */
export interface TableColumn<T = Record<string, unknown>> {
    key: keyof T;
    title: string;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    sortable?: boolean;
    filterable?: boolean;
    searchable?: boolean;
    align?: 'left' | 'center' | 'right';
    render?: (value: T[keyof T], row: T, index: number) => React.ReactNode;
    headerRender?: () => React.ReactNode;
}

/**
 * ترقيم الجدول محسن
 */
export interface TablePagination {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    pageSizeOptions?: number[];
}

/**
 * ترتيب الجدول محسن
 */
export interface TableSorting {
    field: string;
    direction: 'asc' | 'desc';
    onSort: (field: string, direction: 'asc' | 'desc') => void;
}

/**
 * اختيار الجدول محسن
 */
export interface TableSelection<T = Record<string, unknown>> {
    selectedRows: T[];
    onSelectionChange: (selectedRows: T[]) => void;
    selectable?: boolean;
    multiple?: boolean;
    getRowKey: (row: T) => string | number;
}

/**
 * إجراء الجدول محسن
 */
export interface TableAction<T = Record<string, unknown>> {
    key: string;
    label: string;
    icon?: React.ReactNode;
    onClick: (row: T) => void;
    disabled?: (row: T) => boolean;
    visible?: (row: T) => boolean;
    variant?: 'default' | 'outline' | 'ghost' | 'destructive';
}

// ==================== أنواع التحميل المحسنة ====================

/**
 * خصائص التحميل محسنة
 */
export interface LoadingProps extends BaseComponentProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
    text?: string;
    overlay?: boolean;
    fullScreen?: boolean;
}

/**
 * خصائص الهيكل العظمي محسنة
 */
export interface SkeletonProps extends BaseComponentProps {
    width?: number | string;
    height?: number | string;
    variant?: 'text' | 'rectangular' | 'circular';
    animation?: 'pulse' | 'wave' | 'none';
    lines?: number;
}

// ==================== أنواع الأخطاء المحسنة ====================

/**
 * خصائص عرض الخطأ محسنة
 */
export interface ErrorDisplayProps extends BaseComponentProps {
    error: TypedError;
    title?: string;
    description?: string;
    showDetails?: boolean;
    onRetry?: () => void;
    onDismiss?: () => void;
    variant?: 'default' | 'inline' | 'fullscreen';
}

/**
 * خصائص صفحة الخطأ محسنة
 */
export interface ErrorPageProps extends BaseComponentProps {
    error: TypedError;
    title?: string;
    description?: string;
    showDetails?: boolean;
    onRetry?: () => void;
    onGoHome?: () => void;
    showContact?: boolean;
}

// ==================== أنواع التنقل المحسنة ====================

/**
 * خصائص التنقل محسنة
 */
export interface NavigationProps extends BaseComponentProps {
    items: NavigationItem[];
    activeItem?: string;
    onItemClick?: (item: NavigationItem) => void;
    orientation?: 'horizontal' | 'vertical';
    variant?: 'default' | 'pills' | 'tabs';
    size?: 'sm' | 'md' | 'lg';
}

/**
 * عنصر التنقل محسن
 */
export interface NavigationItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    href?: string;
    disabled?: boolean;
    badge?: string | number;
    children?: NavigationItem[];
}

// ==================== أنواع المساعدات ====================

/**
 * دالة التحقق من صحة المكون
 */
export type ComponentValidator<T> = (props: T) => boolean | string;

/**
 * دالة معالجة المكون
 */
export type ComponentHandler<T = unknown> = (value: T) => void | Promise<void>;

/**
 * دالة عرض المكون
 */
export type ComponentRenderer<T = unknown> = (props: T) => React.ReactNode;

// ==================== أنواع Generic محسنة ====================

/**
 * نتيجة العملية للمكون محسنة
 */
export interface ComponentResult<T = unknown, E = TypedError> {
    success: boolean;
    data?: T;
    error?: E;
    message?: string;
    metadata?: Record<string, unknown>;
}

/**
 * خيارات العملية للمكون محسنة
 */
export interface ComponentOptions {
    validate?: boolean;
    log?: boolean;
    cache?: boolean;
    debounce?: number;
    throttle?: number;
}

// ==================== أنواع الأدوات المساعدة ====================

/**
 * دالة المساعدة للتحقق من صحة خصائص المكون
 */
export function isValidComponentProps(props: unknown): props is BaseComponentProps {
    return (
        typeof props === 'object' &&
        props !== null &&
        (typeof (props as BaseComponentProps).className === 'string' ||
            typeof (props as BaseComponentProps).className === 'undefined') &&
        (typeof (props as BaseComponentProps).id === 'string' ||
            typeof (props as BaseComponentProps).id === 'undefined')
    );
}

/**
 * دالة المساعدة للتحقق من صحة حالة المكون
 */
export function isValidComponentState(state: unknown): state is ComponentState {
    return (
        typeof state === 'object' &&
        state !== null &&
        'loading' in state &&
        typeof (state as ComponentState).loading === 'boolean'
    );
}

/**
 * دالة المساعدة للتحقق من صحة خصائص النموذج
 */
export function isValidFormProps<T>(props: unknown): props is FormState<T> {
    return (
        typeof props === 'object' &&
        props !== null &&
        'values' in props &&
        'errors' in props &&
        'touched' in props &&
        'isSubmitting' in props &&
        'isValid' in props &&
        typeof (props as FormState<T>).isSubmitting === 'boolean' &&
        typeof (props as FormState<T>).isValid === 'boolean'
    );
}

// جميع الأنواع مُصدَّرة بالفعل في بداية الملف
