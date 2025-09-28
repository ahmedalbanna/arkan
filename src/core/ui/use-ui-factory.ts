/**
 * Hook Factory لـ UI/UX Hooks
 * يوفر طريقة مبسطة لإنشاء hooks واجهة المستخدم
 */

import { useCallback, useState } from 'react';
import { useToast } from '../../hooks/use-toast';

export interface UIConfig {
    componentName: string;
    initialState?: any;
    customFeatures?: {
        getValidationRules?: () => any;
        getUIStates?: () => string[];
        getEventHandlers?: () => any;
    };
}

/**
 * Hook Factory لـ UI Hooks البسيطة
 * @param config إعدادات المكون
 * @returns Hook جاهز للاستخدام
 */
export function createUIHook(config: UIConfig) {
    return function useUILogic() {
        const [state, setState] = useState(config.initialState || {});
        const [isLoading, setIsLoading] = useState(false);
        const [error, setError] = useState<string | null>(null);
        const { toast } = useToast();

        // تحديث الحالة
        const updateState = useCallback((updates: any) => {
            setState(prev => ({ ...prev, ...updates }));
        }, []);

        // إعادة تعيين الحالة
        const resetState = useCallback(() => {
            setState(config.initialState || {});
            setError(null);
        }, [config.initialState]);

        // معالجة الأخطاء
        const handleError = useCallback((error: any) => {
            const errorMessage = error?.message || 'An error occurred';
            setError(errorMessage);
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive'
            });
        }, [toast]);

        // معالجة النجاح
        const handleSuccess = useCallback((message: string) => {
            toast({
                title: 'Success',
                description: message,
                variant: 'default'
            });
        }, [toast]);

        // بدء التحميل
        const startLoading = useCallback(() => {
            setIsLoading(true);
            setError(null);
        }, []);

        // إيقاف التحميل
        const stopLoading = useCallback(() => {
            setIsLoading(false);
        }, []);

        return {
            // الحالة
            state,
            isLoading,
            error,

            // الوظائف
            updateState,
            resetState,
            handleError,
            handleSuccess,
            startLoading,
            stopLoading,

            // الميزات المخصصة
            getValidationRules: config.customFeatures?.getValidationRules,
            getUIStates: config.customFeatures?.getUIStates,
            getEventHandlers: config.customFeatures?.getEventHandlers,
        };
    };
}

/**
 * Hook Factory لـ UI Hooks المتقدمة
 * @param config إعدادات المكون
 * @param advancedFeatures ميزات متقدمة
 * @returns Hook جاهز للاستخدام مع ميزات متقدمة
 */
export function createAdvancedUIHook(
    config: UIConfig,
    advancedFeatures?: {
        getAnimationStates?: () => string[];
        getResponsiveBreakpoints?: () => any;
        getAccessibilityFeatures?: () => any;
        getThemeOptions?: () => any[];
        getLocalizationKeys?: () => string[];
        getPerformanceMetrics?: () => any;
    }
) {
    return function useAdvancedUILogic() {
        const baseHook = createUIHook(config)();

        return {
            ...baseHook,

            // الميزات المتقدمة
            getAnimationStates: advancedFeatures?.getAnimationStates,
            getResponsiveBreakpoints: advancedFeatures?.getResponsiveBreakpoints,
            getAccessibilityFeatures: advancedFeatures?.getAccessibilityFeatures,
            getThemeOptions: advancedFeatures?.getThemeOptions,
            getLocalizationKeys: advancedFeatures?.getLocalizationKeys,
            getPerformanceMetrics: advancedFeatures?.getPerformanceMetrics,
        };
    };
}

/**
 * Hook Factory للمكونات التفاعلية
 * @param config إعدادات المكون
 * @returns Hook جاهز للاستخدام
 */
export function createInteractiveUIHook(config: UIConfig) {
    return function useInteractiveUILogic() {
        const baseHook = createUIHook(config)();
        const [interactions, setInteractions] = useState<any[]>([]);
        const [isHovered, setIsHovered] = useState(false);
        const [isFocused, setIsFocused] = useState(false);

        // تسجيل التفاعلات
        const logInteraction = useCallback((type: string, data: any) => {
            setInteractions(prev => [...prev, { type, data, timestamp: Date.now() }]);
        }, []);

        // معالجة الأحداث
        const handleMouseEnter = useCallback(() => {
            setIsHovered(true);
            logInteraction('mouseEnter', {});
        }, [logInteraction]);

        const handleMouseLeave = useCallback(() => {
            setIsHovered(false);
            logInteraction('mouseLeave', {});
        }, [logInteraction]);

        const handleFocus = useCallback(() => {
            setIsFocused(true);
            logInteraction('focus', {});
        }, [logInteraction]);

        const handleBlur = useCallback(() => {
            setIsFocused(false);
            logInteraction('blur', {});
        }, [logInteraction]);

        return {
            ...baseHook,

            // التفاعلات
            interactions,
            isHovered,
            isFocused,
            logInteraction,

            // معالجات الأحداث
            handleMouseEnter,
            handleMouseLeave,
            handleFocus,
            handleBlur,
        };
    };
}

/**
 * أمثلة على الاستخدام:
 *
 * // مكون بسيط
 * const useProjectCard = createUIHook({
 *   componentName: 'ProjectCard',
 *   initialState: {
 *     isExpanded: false,
 *     isSelected: false,
 *     project: null
 *   },
 *   customFeatures: {
 *     getValidationRules: () => ({
 *       project: { required: true, type: 'object' }
 *     }),
 *     getUIStates: () => ['loading', 'loaded', 'error', 'empty'],
 *     getEventHandlers: () => ({
 *       onExpand: () => {},
 *       onSelect: () => {},
 *       onDelete: () => {}
 *     })
 *   }
 * });
 *
 * // مكون متقدم
 * const useAdvancedTeamCard = createAdvancedUIHook(
 *   config,
 *   {
 *     getAnimationStates: () => ['idle', 'hover', 'selected', 'loading'],
 *     getResponsiveBreakpoints: () => ({
 *       mobile: '768px',
 *       tablet: '1024px',
 *       desktop: '1280px'
 *     }),
 *     getAccessibilityFeatures: () => ({
 *       ariaLabel: 'Team member card',
 *       role: 'button',
 *       tabIndex: 0
 *     }),
 *     getThemeOptions: () => [
 *       { name: 'light', label: 'Light Theme' },
 *       { name: 'dark', label: 'Dark Theme' },
 *       { name: 'auto', label: 'Auto Theme' }
 *     ],
 *     getLocalizationKeys: () => [
 *       'teamCard.title',
 *       'teamCard.description',
 *       'teamCard.actions'
 *     ],
 *     getPerformanceMetrics: () => ({
 *       renderTime: 0,
 *       interactionTime: 0,
 *       memoryUsage: 0
 *     })
 *   }
 * );
 *
 * // مكون تفاعلي
 * const useInteractiveCard = createInteractiveUIHook({
 *   componentName: 'InteractiveCard',
 *   initialState: {
 *     isActive: false,
 *     position: { x: 0, y: 0 }
 *   }
 * });
 */
