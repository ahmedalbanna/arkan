/**
 * مثال عملي لاستخدام نظام تحسين الأداء الجديد
 * يوضح كيفية استخدام جميع الميزات الجديدة
 */

import React, { useState, useEffect } from 'react';
import {
    createLazyComponent,
    DynamicModuleLoader,
    BundleOptimizer,
    MemoryManager,
    PerformanceTracker,
    useMemoryOptimization,
    usePerformanceTracking
} from '@/core';

// مثال على استخدام Lazy Loading
const LazyComponent = createLazyComponent(
    () => import('../components/HeavyComponent'),
    'HeavyComponent',
    {
        preload: true,
        prefetch: true,
        cache: true,
        retryCount: 3,
        timeout: 10000
    }
);

// مثال على استخدام Dynamic Module Loading
const useDynamicModuleExample = () => {
    const [module, setModule] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const loadModule = async () => {
        setLoading(true);
        try {
            const dynamicModule = await DynamicModuleLoader.loadModule(
                '@/lib/heavy-library',
                { cache: true, retry: 3 }
            );
            setModule(dynamicModule);
        } catch (error) {
            console.error('Failed to load module:', error);
        } finally {
            setLoading(false);
        }
    };

    return { module, loading, loadModule };
};

// مثال على استخدام Memory Optimization
const useMemoryOptimizedComponent = (componentName: string) => {
    const memoryStats = useMemoryOptimization(componentName);
    const [data, setData] = useState<any>(null);

    const loadData = async (key: string, fetcher: () => Promise<any>) => {
        // التحقق من الـ cache أولاً
        const cachedData = MemoryManager.get(key);
        if (cachedData) {
            setData(cachedData);
            return;
        }

        // تحميل البيانات وحفظها في الـ cache
        const newData = await fetcher();
        MemoryManager.set(key, newData, 300000); // 5 minutes TTL
        setData(newData);
    };

    const clearCache = () => {
        MemoryManager.clear();
        setData(null);
    };

    return {
        data,
        memoryStats,
        loadData,
        clearCache
    };
};

// مثال على استخدام Performance Tracking
const usePerformanceOptimizedHook = (hookName: string) => {
    const performanceStats = usePerformanceTracking(hookName);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const executeOptimizedFunction = async (fn: () => Promise<any>) => {
        setLoading(true);
        try {
            const result = await PerformanceTracker.trackAsyncFunctionPerformance(
                hookName,
                fn,
                { timestamp: Date.now() }
            );
            setResult(result);
        } catch (error) {
            console.error('Function execution failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return {
        result,
        loading,
        performanceStats,
        executeOptimizedFunction
    };
};

// مثال شامل لاستخدام جميع الميزات
export const PerformanceOptimizationExample: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'memory' | 'performance' | 'bundle'>('memory');
    const [memoryStats, setMemoryStats] = useState<any>(null);
    const [performanceStats, setPerformanceStats] = useState<any>(null);
    const [bundleStats, setBundleStats] = useState<any>(null);

    // استخدام Memory Optimization
    const { data, memoryStats: memStats, loadData, clearCache } = useMemoryOptimizedComponent('ExampleComponent');

    // استخدام Performance Tracking
    const { result, loading, performanceStats: perfStats, executeOptimizedFunction } = usePerformanceOptimizedHook('ExampleHook');

    // استخدام Dynamic Module Loading
    const { module, loading: moduleLoading, loadModule } = useDynamicModuleExample();

    useEffect(() => {
        // تحديث الإحصائيات كل 5 ثوان
        const interval = setInterval(() => {
            setMemoryStats(MemoryManager.getMemoryStats());
            setPerformanceStats(PerformanceTracker.getPerformanceStats());
            setBundleStats(BundleOptimizer.getChunkAnalysis());
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleLoadData = () => {
        loadData('example-data', async () => {
            // محاكاة تحميل البيانات
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { message: 'Data loaded successfully', timestamp: Date.now() };
        });
    };

    const handleExecuteFunction = () => {
        executeOptimizedFunction(async () => {
            // محاكاة وظيفة معقدة
            await new Promise(resolve => setTimeout(resolve, 2000));
            return { result: 'Function executed successfully', timestamp: Date.now() };
        });
    };

    const handlePreloadModules = () => {
        DynamicModuleLoader.preloadModules([
            '@/lib/chart-library',
            '@/lib/math-utils',
            '@/lib/date-helpers'
        ]);
    };

    return (
        <div className= "p-6 max-w-4xl mx-auto" >
        <h1 className="text-3xl font-bold mb-6" >🚀 Performance Optimization Example </h1>

    {/* Tabs */ }
    <div className="flex space-x-4 mb-6" >
        <button
          onClick={ () => setActiveTab('memory') }
    className = {`px-4 py-2 rounded ${activeTab === 'memory' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`
}
        >
    Memory Management
        </button>
        < button
onClick = {() => setActiveTab('performance')}
className = {`px-4 py-2 rounded ${activeTab === 'performance' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
    Performance Tracking
        </button>
        < button
onClick = {() => setActiveTab('bundle')}
className = {`px-4 py-2 rounded ${activeTab === 'bundle' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
    Bundle Optimization
        </button>
        </div>

{/* Memory Management Tab */ }
{
    activeTab === 'memory' && (
        <div className="space-y-6" >
            <h2 className="text-2xl font-semibold" >💾 Memory Management </h2>

                < div className = "grid grid-cols-1 md:grid-cols-2 gap-6" >
                    <div className="bg-white p-4 rounded-lg shadow" >
                        <h3 className="text-lg font-semibold mb-4" > Cache Operations </h3>
                            < div className = "space-y-3" >
                                <button
                  onClick={ handleLoadData }
    className = "w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
        Load Data(with Cache)
    </button>
        < button
    onClick = { clearCache }
    className = "w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
        Clear Cache
            </button>
            </div>
    {
        data && (
            <div className="mt-4 p-3 bg-gray-100 rounded" >
                <pre className="text-sm" > { JSON.stringify(data, null, 2) } </pre>
                    </div>
              )
    }
    </div>

        < div className = "bg-white p-4 rounded-lg shadow" >
            <h3 className="text-lg font-semibold mb-4" > Memory Statistics </h3>
    {
        memStats && (
            <div className="space-y-2" >
                <div className="flex justify-between" >
                    <span>Usage: </span>
                        < span className = "font-mono" > { Math.round(memStats.percentage * 100) } % </span>
                            </div>
                            < div className = "flex justify-between" >
                                <span>Used: </span>
                                    < span className = "font-mono" > {(memStats.used / 1024 / 1024).toFixed(2)
    } MB </span>
        </div>
        < div className = "flex justify-between" >
            <span>Total: </span>
                < span className = "font-mono" > {(memStats.total / 1024 / 1024).toFixed(2)
} MB </span>
    </div>
    </div>
              )}
</div>
    </div>
    </div>
      )}

{/* Performance Tracking Tab */ }
{
    activeTab === 'performance' && (
        <div className="space-y-6" >
            <h2 className="text-2xl font-semibold" >⚡ Performance Tracking </h2>

                < div className = "grid grid-cols-1 md:grid-cols-2 gap-6" >
                    <div className="bg-white p-4 rounded-lg shadow" >
                        <h3 className="text-lg font-semibold mb-4" > Function Execution </h3>
                            < div className = "space-y-3" >
                                <button
                  onClick={ handleExecuteFunction }
    disabled = { loading }
    className = "w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
        { loading? 'Executing...': 'Execute Function' }
        </button>
        </div>
    {
        result && (
            <div className="mt-4 p-3 bg-gray-100 rounded" >
                <pre className="text-sm" > { JSON.stringify(result, null, 2) } </pre>
                    </div>
              )
    }
    </div>

        < div className = "bg-white p-4 rounded-lg shadow" >
            <h3 className="text-lg font-semibold mb-4" > Performance Statistics </h3>
    {
        perfStats && (
            <div className="space-y-2" >
                <div className="flex justify-between" >
                    <span>Render Time: </span>
                        < span className = "font-mono" > { perfStats.renderTime?.toFixed(2) }ms </span>
                            </div>
                            < div className = "flex justify-between" >
                                <span>Render Count: </span>
                                    < span className = "font-mono" > { perfStats.renderCount } </span>
                                        </div>
                                        < div className = "flex justify-between" >
                                            <span>Memory Usage: </span>
                                                < span className = "font-mono" > { perfStats.memoryUsage?.toFixed(2) }MB </span>
                                                    </div>
                                                    </div>
              )
    }
    </div>
        </div>
        </div>
      )
}

{/* Bundle Optimization Tab */ }
{
    activeTab === 'bundle' && (
        <div className="space-y-6" >
            <h2 className="text-2xl font-semibold" >📦 Bundle Optimization </h2>

                < div className = "grid grid-cols-1 md:grid-cols-2 gap-6" >
                    <div className="bg-white p-4 rounded-lg shadow" >
                        <h3 className="text-lg font-semibold mb-4" > Dynamic Loading </h3>
                            < div className = "space-y-3" >
                                <button
                  onClick={ loadModule }
    disabled = { moduleLoading }
    className = "w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
        { moduleLoading? 'Loading...': 'Load Module' }
        </button>
        < button
    onClick = { handlePreloadModules }
    className = "w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
        Preload Modules
            </button>
            </div>
    {
        module && (
            <div className="mt-4 p-3 bg-gray-100 rounded" >
                <p className="text-sm" > Module loaded successfully! </p>
                    </div>
              )
    }
    </div>

        < div className = "bg-white p-4 rounded-lg shadow" >
            <h3 className="text-lg font-semibold mb-4" > Bundle Statistics </h3>
    {
        bundleStats && (
            <div className="space-y-2" >
                <div className="flex justify-between" >
                    <span>Total Size: </span>
                        < span className = "font-mono" > {(bundleStats.totalSize / 1024 / 1024).toFixed(2)
    } MB </span>
        </div>
        < div className = "flex justify-between" >
            <span>Critical Chunks: </span>
                < span className = "font-mono" > { bundleStats.criticalChunks.length } </span>
                    </div>
                    < div className = "flex justify-between" >
                        <span>Recommendations: </span>
                            < span className = "font-mono" > { bundleStats.recommendations.length } </span>
                                </div>
                                </div>
              )
}
</div>
    </div>
    </div>
      )}

{/* Lazy Component Example */ }
<div className="mt-8 bg-white p-4 rounded-lg shadow" >
    <h3 className="text-lg font-semibold mb-4" >🧩 Lazy Component Example </h3>
        < div className = "border-2 border-dashed border-gray-300 p-8 text-center" >
            <LazyComponent />
            </div>
            </div>

{/* Global Statistics */ }
<div className="mt-8 bg-gray-100 p-4 rounded-lg" >
    <h3 className="text-lg font-semibold mb-4" >📊 Global Statistics </h3>
        < div className = "grid grid-cols-1 md:grid-cols-3 gap-4" >
            <div className="bg-white p-3 rounded" >
                <h4 className="font-semibold" > Memory </h4>
{
    memoryStats && (
        <p className="text-sm text-gray-600" >
            { Math.round(memoryStats.percentage * 100) } % used
            </p>
            )
}
</div>
    < div className = "bg-white p-3 rounded" >
        <h4 className="font-semibold" > Performance </h4>
{
    performanceStats && (
        <p className="text-sm text-gray-600" >
            { performanceStats.slowComponents } slow components
                </p>
            )
}
</div>
    < div className = "bg-white p-3 rounded" >
        <h4 className="font-semibold" > Bundle </h4>
{
    bundleStats && (
        <p className="text-sm text-gray-600" >
            { bundleStats.largestChunks.length } large chunks
                </p>
            )
}
</div>
    </div>
    </div>
    </div>
  );
};

export default PerformanceOptimizationExample;
