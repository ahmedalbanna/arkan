/**
 * أنواع Hooks المحسنة لتحسين Type Safety
 *
 * هذا الملف يحتوي على أنواع محسنة للـ Hooks مع استبدال `any`
 * بأنواع محددة ومفصلة
 */

import { Dispatch, SetStateAction } from 'react';

// ==================== أنواع الحالة الأساسية ====================

/**
 * حالة التحميل محسنة
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * حالة المعالجة محسنة
 */
export type ProcessingState = 'idle' | 'processing' | 'completed' | 'failed';

/**
 * حالة النموذج محسنة
 */
export type FormState = 'idle' | 'validating' | 'submitting' | 'success' | 'error';

// ==================== أنواع البيانات المحسنة ====================

/**
 * بيانات الاستجابة محسنة
 */
export interface ResponseData<T = unknown> {
    data: T;
    success: boolean;
    message?: string;
    metadata?: Record<string, unknown>;
}

/**
 * بيانات الخطأ محسنة
 */
export interface ErrorData {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string;
}

/**
 * بيانات التخزين المؤقت محسنة
 */
export interface CacheData<T = unknown> {
    key: string;
    value: T;
    expiresAt: string;
    metadata?: Record<string, unknown>;
}

// ==================== أنواع الـ Hooks الأساسية ====================

/**
 * Hook الحالة الأساسي محسن
 */
export interface UseStateResult<T> {
    state: T;
    setState: Dispatch<SetStateAction<T>>;
    reset: () => void;
}

/**
 * Hook التحميل محسن
 */
export interface UseLoadingResult {
    loading: boolean;
    setLoading: (loading: boolean) => void;
    startLoading: () => void;
    stopLoading: () => void;
}

/**
 * Hook المعالجة محسن
 */
export interface UseProcessingResult {
    processing: boolean;
    setProcessing: (processing: boolean) => void;
    startProcessing: () => void;
    stopProcessing: () => void;
}

/**
 * Hook البيانات محسن
 */
export interface UseDataResult<T = unknown> {
    data: T | null;
    loading: boolean;
    error: ErrorData | null;
    refetch: () => Promise<void>;
    setData: (data: T | null) => void;
    clearError: () => void;
}

// ==================== أنواع الـ Hooks المتقدمة ====================

/**
 * Hook النموذج محسن
 */
export interface UseFormResult<T = Record<string, unknown>> {
    values: T;
    errors: Record<keyof T, string>;
    touched: Record<keyof T, boolean>;
    isSubmitting: boolean;
    isValid: boolean;
    isDirty: boolean;
    setValue: (name: keyof T, value: unknown) => void;
    setError: (name: keyof T, error: string) => void;
    setTouched: (name: keyof T, touched: boolean) => void;
    handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => (event: React.FormEvent) => void;
    handleChange: (name: keyof T) => (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleBlur: (name: keyof T) => (event: React.FocusEvent<HTMLInputElement>) => void;
    reset: () => void;
    validate: () => boolean;
}

/**
 * Hook التحقق من الصحة محسن
 */
export interface UseValidationResult<T = Record<string, unknown>> {
    isValid: boolean;
    errors: Record<keyof T, string>;
    validate: (values: T) => boolean;
    validateField: (name: keyof T, value: unknown) => string | null;
    clearErrors: () => void;
    setError: (name: keyof T, error: string) => void;
}

/**
 * Hook التخزين المؤقت محسن
 */
export interface UseCacheResult<T = unknown> {
    data: T | null;
    loading: boolean;
    error: ErrorData | null;
    setData: (data: T) => void;
    clearCache: () => void;
    refresh: () => Promise<void>;
    isExpired: boolean;
    expiresAt: string | null;
}

/**
 * Hook التخزين المحلي محسن
 */
export interface UseLocalStorageResult<T = unknown> {
    value: T | null;
    setValue: (value: T) => void;
    removeValue: () => void;
    clearStorage: () => void;
}

/**
 * Hook التخزين المؤقت للجلسة محسن
 */
export interface UseSessionStorageResult<T = unknown> {
    value: T | null;
    setValue: (value: T) => void;
    removeValue: () => void;
    clearStorage: () => void;
}

// ==================== أنواع الـ Hooks المتخصصة ====================

/**
 * Hook الملفات محسن
 */
export interface UseFileUploadResult {
    files: File[];
    loading: boolean;
    error: ErrorData | null;
    progress: number;
    uploadFile: (file: File) => Promise<void>;
    uploadFiles: (files: File[]) => Promise<void>;
    removeFile: (index: number) => void;
    clearFiles: () => void;
    setProgress: (progress: number) => void;
}

/**
 * Hook البحث محسن
 */
export interface UseSearchResult<T = unknown> {
    query: string;
    results: T[];
    loading: boolean;
    error: ErrorData | null;
    hasMore: boolean;
    setQuery: (query: string) => void;
    search: (query: string) => Promise<void>;
    loadMore: () => Promise<void>;
    clearResults: () => void;
}

/**
 * Hook التصفية محسن
 */
export interface UseFilterResult<T = unknown> {
    filters: Record<string, unknown>;
    filteredData: T[];
    loading: boolean;
    error: ErrorData | null;
    setFilter: (key: string, value: unknown) => void;
    clearFilter: (key: string) => void;
    clearAllFilters: () => void;
    applyFilters: (data: T[]) => T[];
}

/**
 * Hook الترتيب محسن
 */
export interface UseSortResult<T = unknown> {
    sortField: string | null;
    sortDirection: 'asc' | 'desc';
    sortedData: T[];
    setSort: (field: string, direction: 'asc' | 'desc') => void;
    toggleSort: (field: string) => void;
    clearSort: () => void;
}

/**
 * Hook الترقيم محسن
 */
export interface UsePaginationResult<T = unknown> {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    paginatedData: T[];
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    nextPage: () => void;
    previousPage: () => void;
    goToPage: (page: number) => void;
}

// ==================== أنواع الـ Hooks المتقدمة ====================

/**
 * Hook التحديث التلقائي محسن
 */
export interface UseAutoUpdateResult<T = unknown> {
    data: T | null;
    loading: boolean;
    error: ErrorData | null;
    lastUpdated: string | null;
    interval: number;
    setInterval: (interval: number) => void;
    startAutoUpdate: () => void;
    stopAutoUpdate: () => void;
    isAutoUpdating: boolean;
}

/**
 * Hook التحديث المتفاوت محسن
 */
export interface UseDebounceResult<T = unknown> {
    value: T;
    debouncedValue: T;
    isDebouncing: boolean;
    setValue: (value: T) => void;
    clearDebounce: () => void;
}

/**
 * Hook التحديث المتراكم محسن
 */
export interface UseThrottleResult<T = unknown> {
    value: T;
    throttledValue: T;
    isThrottling: boolean;
    setValue: (value: T) => void;
    clearThrottle: () => void;
}

/**
 * Hook التحديث المشروط محسن
 */
export interface UseConditionalResult<T = unknown> {
    value: T;
    setValue: (value: T) => void;
    isConditionMet: boolean;
    setCondition: (condition: boolean) => void;
    executeWhenCondition: (callback: () => void) => void;
}

// ==================== أنواع الـ Hooks المتخصصة ====================

/**
 * Hook المفاتيح محسن
 */
export interface UseKeyboardResult {
    pressedKeys: Set<string>;
    isKeyPressed: (key: string) => boolean;
    onKeyDown: (event: KeyboardEvent) => void;
    onKeyUp: (event: KeyboardEvent) => void;
    addKeyListener: (key: string, callback: () => void) => void;
    removeKeyListener: (key: string, callback: () => void) => void;
}

/**
 * Hook الماوس محسن
 */
export interface UseMouseResult {
    x: number;
    y: number;
    isPressed: boolean;
    onMouseMove: (event: MouseEvent) => void;
    onMouseDown: (event: MouseEvent) => void;
    onMouseUp: (event: MouseEvent) => void;
}

/**
 * Hook التمرير محسن
 */
export interface UseScrollResult {
    scrollX: number;
    scrollY: number;
    scrollDirection: 'up' | 'down' | 'left' | 'right' | null;
    isScrolling: boolean;
    onScroll: (event: Event) => void;
}

/**
 * Hook الحجم محسن
 */
export interface UseResizeResult {
    width: number;
    height: number;
    onResize: (event: Event) => void;
}

// ==================== أنواع الـ Hooks المتقدمة ====================

/**
 * Hook التخزين المؤقت المتقدم محسن
 */
export interface UseAdvancedCacheResult<T = unknown> {
    data: T | null;
    loading: boolean;
    error: ErrorData | null;
    cache: Map<string, CacheData<T>>;
    setData: (key: string, data: T, ttl?: number) => void;
    getData: (key: string) => T | null;
    removeData: (key: string) => void;
    clearCache: () => void;
    getCacheStats: () => { size: number; keys: string[] };
}

/**
 * Hook المعالجة المتقدمة محسن
 */
export interface UseAdvancedProcessingResult<T = unknown> {
    data: T | null;
    loading: boolean;
    error: ErrorData | null;
    progress: number;
    process: (input: unknown) => Promise<void>;
    cancel: () => void;
    retry: () => Promise<void>;
    isProcessing: boolean;
    isCancelled: boolean;
}

/**
 * Hook التحقق من الصحة المتقدم محسن
 */
export interface UseAdvancedValidationResult<T = Record<string, unknown>> {
    isValid: boolean;
    errors: Record<keyof T, string>;
    warnings: Record<keyof T, string>;
    validate: (values: T) => boolean;
    validateField: (name: keyof T, value: unknown) => { isValid: boolean; error?: string; warning?: string };
    clearErrors: () => void;
    clearWarnings: () => void;
    setError: (name: keyof T, error: string) => void;
    setWarning: (name: keyof T, warning: string) => void;
}

// ==================== أنواع المساعدات ====================

/**
 * دالة التحقق من النوع للـ Hook
 */
export type HookTypeGuard<T> = (value: unknown) => value is T;

/**
 * دالة التحويل للـ Hook
 */
export type HookTransformer<T, U> = (value: T) => U;

/**
 * دالة المعالج للـ Hook
 */
export type HookHandler<T = unknown> = (value: T) => void | Promise<void>;

/**
 * دالة التحقق من صحة الـ Hook
 */
export type HookValidator<T> = (value: T) => boolean | string;

// ==================== أنواع Generic محسنة ====================

/**
 * نتيجة العملية للـ Hook محسنة
 */
export interface HookProcessResult<T = unknown, E = ErrorData> {
    success: boolean;
    data?: T;
    error?: E;
    message?: string;
    metadata?: Record<string, unknown>;
}

/**
 * خيارات العملية للـ Hook محسنة
 */
export interface HookProcessOptions {
    timeout?: number;
    retries?: number;
    validate?: boolean;
    log?: boolean;
    cache?: boolean;
    debounce?: number;
    throttle?: number;
}

// جميع الأنواع مُصدَّرة بالفعل في بداية الملف
