// /**
//  * نظام تحسين Bundle Size و Code Splitting الذكي
//  * يوفر تحميل ديناميكي للأكواد وتحسين الأداء
//  */

// import React, { ComponentType, lazy, Suspense } from 'react';

// // أنواع البيانات
// export interface LazyComponentProps {
//     fallback?: React.ReactNode;
//     errorBoundary?: ComponentType<{ error: Error; retry: () => void }>;
// }

// export interface BundleMetrics {
//     loadTime: number;
//     bundleSize: number;
//     cacheHit: boolean;
//     componentName: string;
// }

// export interface BundleConfig {
//     preload?: boolean;
//     prefetch?: boolean;
//     cache?: boolean;
//     retryCount?: number;
//     timeout?: number;
// }

// // Cache للـ components المحملة
// class ComponentCache {
//     private static cache = new Map<string, any>();
//     private static loadTimes = new Map<string, number>();
//     private static maxCacheSize = 50;

//     static set(key: string, component: any, loadTime: number) {
//         if (this.cache.size >= this.maxCacheSize) {
//             const firstKey = this.cache.keys().next().value;
//             if (firstKey) {
//                 this.cache.delete(firstKey);
//                 this.loadTimes.delete(firstKey);
//             }
//         }

//         this.cache.set(key, component);
//         this.loadTimes.set(key, loadTime);
//     }

//     static get(key: string): { component: any; loadTime: number } | null {
//         const component = this.cache.get(key);
//         const loadTime = this.loadTimes.get(key) || 0;

//         if (component) {
//             return { component, loadTime };
//         }
//         return null;
//     }

//     static has(key: string): boolean {
//         return this.cache.has(key);
//     }

//     static clear() {
//         this.cache.clear();
//         this.loadTimes.clear();
//     }

//     static getStats() {
//         return {
//             cacheSize: this.cache.size,
//             maxSize: this.maxCacheSize,
//             hitRate: this.cache.size / this.maxCacheSize
//         };
//     }
// }

// // Error Boundary مخصص للـ lazy components
// class LazyErrorBoundary extends React.Component<
//     { children: React.ReactNode; onError?: (error: Error) => void },
//     { hasError: boolean; error?: Error }
// > {
//     constructor(props: any) {
//         super(props);
//         this.state = { hasError: false };
//     }

//     static getDerivedStateFromError(error: Error) {
//         return { hasError: true, error };
//     }

//     componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
//         console.error('Lazy component error:', error, errorInfo);
//         this.props.onError?.(error);
//     }

//     render() {
//         if (this.state.hasError) {
//             return React.createElement('div', {
//                 className: 'flex items-center justify-center p-4 text-red-500'
//             }, React.createElement('div', {
//                 className: 'text-center'
//             }, [
//                 React.createElement('h3', {
//                     className: 'text-lg font-semibold',
//                     key: 'title'
//                 }, 'خطأ في تحميل المكون'),
//                 React.createElement('p', {
//                     className: 'text-sm text-gray-600 mt-2',
//                     key: 'message'
//                 }, 'فشل في تحميل المكون المطلوب'),
//                 React.createElement('button', {
//                     onClick: () => this.setState({ hasError: false }),
//                     className: 'mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600',
//                     key: 'retry'
//                 }, 'إعادة المحاولة')
//             ]));
//         }

//         return this.props.children;
//     }
// }

// // Loading component محسن
// const SmartLoading: React.FC<{ componentName: string }> = ({ componentName }) => {
//     const [dots, setDots] = React.useState('');

//     React.useEffect(() => {
//         const interval = setInterval(() => {
//             setDots(prev => prev.length >= 3 ? '' : prev + '.');
//         }, 500);

//         return () => clearInterval(interval);
//     }, []);

//     return React.createElement('div', {
//         className: 'flex items-center justify-center p-8'
//     }, React.createElement('div', {
//         className: 'text-center'
//     }, [
//         React.createElement('div', {
//             className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4',
//             key: 'spinner'
//         }),
//         React.createElement('p', {
//             className: 'text-gray-600',
//             key: 'text'
//         }, `جاري تحميل ${componentName}${dots}`)
//     ]));
// };

// // دالة إنشاء lazy component محسن
// export function createLazyComponent<T extends ComponentType<any>>(
//     importPath: string,
//     componentName: string,
//     config: BundleConfig = {}
// ): React.ComponentType<T> {
//     const {
//         preload = false,
//         prefetch = false,
//         cache = true,
//         retryCount = 3,
//         timeout = 10000
//     } = config;

//     // إنشاء lazy component مع retry logic
//     const LazyComponent = lazy(() => {
//         const startTime = performance.now();

//         return Promise.race([
//             import(/* webpackChunkName: "[request]" */ importPath),
//             new Promise((_, reject) =>
//                 setTimeout(() => reject(new Error('Import timeout')), timeout)
//             )
//         ])
//             .then((module: any) => {
//                 const loadTime = performance.now() - startTime;

//                 // حفظ في الـ cache
//                 if (cache && module.default) {
//                     ComponentCache.set(componentName, module.default, loadTime);
//                 }

//                 // تسجيل الأداء
//                 if (typeof PerformanceTracker !== 'undefined') {
//                     PerformanceTracker.trackComponentLoad(componentName, loadTime, true);
//                 }

//                 return module;
//             })
//             .catch((error) => {
//                 const loadTime = performance.now() - startTime;
//                 if (typeof PerformanceTracker !== 'undefined') {
//                     PerformanceTracker.trackComponentLoad(componentName, loadTime, false);
//                 }

//                 console.error(`Failed to load component ${componentName}:`, error);
//                 throw error;
//             });
//     });

//     // Wrapper component مع error boundary
//     const WrappedComponent: React.FC<T> = (props) => {
//         React.useEffect(() => {
//             // Preload إذا كان مطلوب
//             if (preload) {
//                 import(/* webpackChunkName: "[request]" */ importPath).catch(console.error);
//             }

//             // Prefetch إذا كان مطلوب
//             if (prefetch) {
//                 const link = document.createElement('link');
//                 link.rel = 'prefetch';
//                 link.href = importPath;
//                 document.head.appendChild(link);
//             }
//         }, []);

//         return React.createElement(LazyErrorBoundary, {},
//             React.createElement(Suspense, {
//                 fallback: React.createElement(SmartLoading, { componentName })
//             }, React.createElement(LazyComponent, props))
//         );
//     };

//     WrappedComponent.displayName = `Lazy(${componentName})`;
//     return WrappedComponent;
// }

// // نظام تحميل ديناميكي للـ modules
// export class DynamicModuleLoader {
//     private static loadedModules = new Set<string>();
//     private static loadingPromises = new Map<string, Promise<any>>();

//     static async loadModule<T = any>(
//         modulePath: string,
//         options: { cache?: boolean; retry?: number } = {}
//     ): Promise<T> {
//         const { cache = true, retry = 3 } = options;

//         // التحقق من الـ cache
//         if (cache && this.loadedModules.has(modulePath)) {
//             return this.loadingPromises.get(modulePath);
//         }

//         // إنشاء promise للتحميل
//         const loadPromise = this.loadWithRetry(modulePath, retry);

//         if (cache) {
//             this.loadingPromises.set(modulePath, loadPromise);
//             this.loadedModules.add(modulePath);
//         }

//         return loadPromise;
//     }

//     private static async loadWithRetry<T = any>(
//         modulePath: string,
//         retryCount: number
//     ): Promise<T> {
//         let lastError: Error | null = null;

//         for (let i = 0; i <= retryCount; i++) {
//             try {
//                 const startTime = performance.now();
//                 // const importedModule = await import(modulePath);
//                 const loadTime = performance.now() - startTime;

//                 if (typeof PerformanceTracker !== 'undefined') {
//                     PerformanceTracker.trackModuleLoad(modulePath, loadTime, true);
//                 }
//                 return importedModule;
//             } catch (error) {
//                 lastError = error as Error;
//                 console.warn(`Module load attempt ${i + 1} failed for ${modulePath}:`, error);

//                 if (i < retryCount) {
//                     // انتظار متزايد قبل إعادة المحاولة
//                     await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
//                 }
//             }
//         }

//         if (typeof PerformanceTracker !== 'undefined') {
//             PerformanceTracker.trackModuleLoad(modulePath, 0, false);
//         }
//         throw lastError || new Error(`Failed to load module: ${modulePath}`);
//     }

//     static preloadModules(modulePaths: string[]): Promise<void[]> {
//         return Promise.all(
//             modulePaths.map(path =>
//                 this.loadModule(path, { cache: true, retry: 1 })
//                     .catch(error => console.warn(`Preload failed for ${path}:`, error))
//             )
//         );
//     }

//     static getLoadedModules(): string[] {
//         return Array.from(this.loadedModules);
//     }

//     static clearCache(): void {
//         this.loadedModules.clear();
//         this.loadingPromises.clear();
//     }
// }

// // نظام تحسين Bundle Size
// export class BundleOptimizer {
//     private static chunkSizes = new Map<string, number>();
//     private static criticalChunks = new Set<string>();

//     static registerChunkSize(chunkName: string, size: number): void {
//         this.chunkSizes.set(chunkName, size);

//         // تحديد الـ chunks الحرجة
//         if (size > 100000) { // أكبر من 100KB
//             this.criticalChunks.add(chunkName);
//         }
//     }

//     static getChunkAnalysis(): {
//         totalSize: number;
//         criticalChunks: string[];
//         largestChunks: Array<{ name: string; size: number }>;
//         recommendations: string[];
//     } {
//         const totalSize = Array.from(this.chunkSizes.values()).reduce((sum, size) => sum + size, 0);
//         const criticalChunks = Array.from(this.criticalChunks);
//         const largestChunks = Array.from(this.chunkSizes.entries())
//             .map(([name, size]) => ({ name, size }))
//             .sort((a, b) => b.size - a.size)
//             .slice(0, 5);

//         const recommendations: string[] = [];

//         if (totalSize > 1000000) { // أكبر من 1MB
//             recommendations.push('Consider code splitting for large bundles');
//         }

//         if (criticalChunks.length > 3) {
//             recommendations.push('Too many critical chunks, consider lazy loading');
//         }

//         const avgChunkSize = totalSize / this.chunkSizes.size;
//         if (avgChunkSize > 200000) { // أكبر من 200KB
//             recommendations.push('Average chunk size is large, consider more granular splitting');
//         }

//         return {
//             totalSize,
//             criticalChunks,
//             largestChunks,
//             recommendations
//         };
//     }

//     static optimizeImports(imports: string[]): string[] {
//         // تحسين الـ imports بناءً على الاستخدام
//         return imports.map(imp => {
//             // إزالة الـ imports غير المستخدمة
//             if (imp.includes('*')) {
//                 return imp.replace(/\* as \w+/, '');
//             }
//             return imp;
//         });
//     }
// }

// // Performance Tracker (سيتم تعريفه في ملف منفصل)
// declare class PerformanceTracker {
//     static trackComponentLoad(componentName: string, loadTime: number, success: boolean): void;
//     static trackModuleLoad(modulePath: string, loadTime: number, success: boolean): void;
// }

// // تصدير الـ utilities
// export {
//     ComponentCache,
//     LazyErrorBoundary,
//     SmartLoading
// };

