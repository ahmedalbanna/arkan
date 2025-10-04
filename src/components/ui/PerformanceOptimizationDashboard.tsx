/**
 * Performance Optimization Dashboard
 *
 * لوحة تحكم شاملة لمراقبة وتحسين الأداء
 */

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Activity,
    AlertTriangle,
    BarChart3,
    CheckCircle,
    Clock,
    MemoryStick,
    Network,
    Settings,
    TrendingUp,
    Zap
} from 'lucide-react';
import React, { useState } from 'react';

import { useAIPerformance } from '@/core/hooks/performance/use-ai-performance';
import { useMemoryManager } from '@/core/hooks/performance/use-memory-manager';
import { useRealTimePerformance } from '@/core/hooks/performance/use-real-time-performance';

export interface PerformanceOptimizationDashboardProps {
    /** تمكين التحسينات التلقائية */
    enableAutoOptimizations?: boolean;
    /** مستوى التنبيه */
    alertThreshold?: number;
    /** Class name إضافي */
    className?: string;
}

/**
 * لوحة تحكم تحسين الأداء الشاملة
 */
export const PerformanceOptimizationDashboard: React.FC<PerformanceOptimizationDashboardProps> = ({
    enableAutoOptimizations = false,
    alertThreshold = 70,
    className = ''
}) => {
    const [activeTab, setActiveTab] = useState('overview');

    // Performance hooks
    const realTimePerf = useRealTimePerformance({
        enableAutoOptimizations,
        alertThreshold,
        collectionInterval: 2000
    });

    const memoryManager = useMemoryManager({
        enableMonitoring: true,
        monitoringInterval: 3000,
        memoryThreshold: 100,
        cleanupStrategy: 'hybrid'
    });

    const aiPerformance = useAIPerformance();

    // Format functions
    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatTime = (ms: number): string => {
        return ms < 1000 ? `${ms.toFixed(2)}ms` : `${(ms / 1000).toFixed(2)}s`;
    };

    const getPerformanceColor = (score: number): string => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        if (score >= 50) return 'text-orange-600';
        return 'text-red-600';
    };

    const getPerformanceBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'excellent': return 'default';
            case 'good': return 'secondary';
            case 'warning': return 'outline';
            case 'critical': return 'destructive';
            default: return 'default';
        }
    };

    return (
        <div className={`performance-dashboard ${className}`}>
            <div className="mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Activity className="h-6 w-6" />
                    Performance Optimization Dashboard
                </h2>
                <p className="text-muted-foreground mt-1">
                    مراقبة وتحسين الأداء في الوقت الفعلي
                </p>
            </div>

            {/* Active Alerts */}
            {realTimePerf.alerts.activeAlerts.length > 0 && (
                <div className="mb-6 space-y-2">
                    {realTimePerf.alerts.activeAlerts.map((alert, index) => (
                        <Alert key={index} variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="flex items-center justify-between">
                                    <span>{alert.message}</span>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => realTimePerf.alerts.dismissAlert(index)}
                                    >
                                        ✕
                                    </Button>
                                </div>
                            </AlertDescription>
                        </Alert>
                    ))}
                </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                    <TabsTrigger value="memory">الذاكرة</TabsTrigger>
                    <TabsTrigger value="ai">الذكاء الاصطناعي</TabsTrigger>
                    <TabsTrigger value="optimizations">التحسينات</TabsTrigger>
                    <TabsTrigger value="analytics">التحليلات</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Performance Score */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
                                <Zap className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${getPerformanceColor(realTimePerf.metrics.performanceScore)}`}>
                                    {realTimePerf.metrics.performanceScore.toFixed(0)}
                                </div>
                                <Badge variant={getPerformanceBadgeVariant(realTimePerf.metrics.performanceStatus)} className="mt-2">
                                    {realTimePerf.metrics.performanceStatus}
                                </Badge>
                            </CardContent>
                        </Card>

                        {/* Memory Usage */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                                <MemoryStick className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {memoryManager.memoryInfo.usagePercentage.toFixed(1)}%
                                </div>
                                <Progress
                                    value={memoryManager.memoryInfo.usagePercentage}
                                    className="mt-2"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatBytes(memoryManager.memoryInfo.usedJSHeapSize * 1024 * 1024)} / {formatBytes(memoryManager.memoryInfo.jsHeapSizeLimit * 1024 * 1024)}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Frame Rate */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Frame Rate</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {(1000 / realTimePerf.metrics.frameRate).toFixed(0)} FPS
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Lag: {realTimePerf.metrics.lagTime.toFixed(2)}ms
                                </p>
                            </CardContent>
                        </Card>

                        {/* Network Speed */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Network Speed</CardTitle>
                                <Network className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatTime(realTimePerf.metrics.networkSpeed)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Average response time
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                إجراءات سريعة لتحسين الأداء
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    onClick={() => memoryManager.gc.force()}
                                    variant="outline"
                                    size="sm"
                                >
                                    <MemoryStick className="h-4 w-4 mr-2" />
                                    Force GC
                                </Button>
                                <Button
                                    onClick={() => aiPerformance.cache.clear()}
                                    variant="outline"
                                    size="sm"
                                >
                                    <Settings className="h-4 w-4 mr-2" />
                                    Clear AI Cache
                                </Button>
                                <Button
                                    onClick={() => realTimePerf.optimizations.autoOptimize()}
                                    variant="outline"
                                    size="sm"
                                >
                                    <Zap className="h-4 w-4 mr-2" />
                                    Auto Optimize
                                </Button>
                                <Button
                                    onClick={() => realTimePerf.analytics.performanceReport()}
                                    variant="outline"
                                    size="sm"
                                >
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    Generate Report
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Memory Tab */}
                <TabsContent value="memory" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Memory Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Memory Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Used:</span>
                                    <span className="font-mono">{formatBytes(memoryManager.memoryInfo.usedJSHeapSize * 1024 * 1024)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Total:</span>
                                    <span className="font-mono">{formatBytes(memoryManager.memoryInfo.totalJSHeapSize * 1024 * 1024)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Limit:</span>
                                    <span className="font-mono">{formatBytes(memoryManager.memoryInfo.jsHeapSizeLimit * 1024 * 1024)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Peak Usage:</span>
                                    <span className="font-mono">{formatBytes(memoryManager.analytics.peakUsage * 1024 * 1024)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Average Usage:</span>
                                    <span className="font-mono">{formatBytes(memoryManager.analytics.averageUsage * 1024 * 1024)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cache Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Cache Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Cache Size:</span>
                                    <span className="font-mono">{memoryManager.cache.stats.size}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Memory Used:</span>
                                    <span className="font-mono">{formatBytes(memoryManager.cache.stats.memoryUsed * 1024)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Hit Rate:</span>
                                    <span className="font-mono">{memoryManager.cache.stats.hitRate.toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Avg Access Time:</span>
                                    <span className="font-mono">{memoryManager.cache.stats.avgAccessTime.toFixed(2)}ms</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Memory Health Report */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Memory Health Report</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Badge variant={memoryManager.analytics.healthReport.status === 'healthy' ? 'default' : 'destructive'}>
                                        {memoryManager.analytics.healthReport.status}
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    {memoryManager.analytics.healthReport.recommendations.map((rec, index) => (
                                        <div key={index} className="text-sm text-muted-foreground">
                                            {rec}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* AI Performance Tab */}
                <TabsContent value="ai" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* AI Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>AI Operations Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Total Operations:</span>
                                    <span className="font-mono">{aiPerformance.stats.totalOperations}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Successful:</span>
                                    <span className="font-mono text-green-600">{aiPerformance.stats.successfulOperations}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Failed:</span>
                                    <span className="font-mono text-red-600">{aiPerformance.stats.failedOperations}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Avg Execution Time:</span>
                                    <span className="font-mono">{formatTime(aiPerformance.stats.averageExecutionTime)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Performance Score:</span>
                                    <span className="font-mono">{aiPerformance.stats.performanceScore}%</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* AI Cache Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>AI Cache Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Cache Size:</span>
                                    <span className="font-mono">{aiPerformance.cache.stats.size}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Cache Hits:</span>
                                    <span className="font-mono text-green-600">{aiPerformance.cache.stats.hits}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Cache Misses:</span>
                                    <span className="font-mono text-red-600">{aiPerformance.cache.stats.misses}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Hit Rate:</span>
                                    <span className="font-mono">{aiPerformance.cache.stats.hitRate.toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Memory Usage:</span>
                                    <span className="font-mono">{formatBytes(aiPerformance.cache.stats.memoryUsage)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Optimizations Tab */}
                <TabsContent value="optimizations" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Optimization Actions</CardTitle>
                            <CardDescription>
                                إجراءات التحسين المطبقة والمعلقة
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {realTimePerf.optimizationActions.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-8">
                                        لا توجد إجراءات تحسين حالياً
                                    </div>
                                ) : (
                                    realTimePerf.optimizationActions.map((action, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    {action.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                                                    {action.status === 'processing' && <Clock className="h-4 w-4 text-blue-600" />}
                                                    {action.status === 'failed' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                                                    {action.status === 'pending' && <Clock className="h-4 w-4 text-gray-600" />}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{action.description}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Impact: {action.impact} • Estimated improvement: {action.estimatedImprovement}%
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant={action.status === 'completed' ? 'default' : 'secondary'}>
                                                {action.status}
                                            </Badge>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Trends</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm font-medium mb-2">Memory Trend (Last 10 points)</div>
                                        <div className="flex items-end gap-1 h-20">
                                            {realTimePerf.analytics.history.slice(-10).map((point, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-blue-500 flex-1 rounded-t"
                                                    style={{
                                                        height: `${(point.metrics.memoryUsage / 100) * 100}%`,
                                                        minHeight: '2px'
                                                    }}
                                                    title={`${point.metrics.memoryUsage.toFixed(1)}%`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium mb-2">Performance Score Trend</div>
                                        <div className="flex items-end gap-1 h-20">
                                            {realTimePerf.analytics.history.slice(-10).map((point, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-green-500 flex-1 rounded-t"
                                                    style={{
                                                        height: `${point.metrics.performanceScore}%`,
                                                        minHeight: '2px'
                                                    }}
                                                    title={`${point.metrics.performanceScore.toFixed(0)}%`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Export Analytics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        تصدير البيانات التحليلية للتحليل الخارجي
                                    </p>
                                    <Button
                                        onClick={() => {
                                            const data = realTimePerf.analytics.exportAnalytics();
                                            const blob = new Blob([data], { type: 'application/json' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `performance-analytics-${Date.now()}.json`;
                                            a.click();
                                            URL.revokeObjectURL(url);
                                        }}
                                        className="w-full"
                                    >
                                        <BarChart3 className="h-4 w-4 mr-2" />
                                        Export Analytics Data
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default PerformanceOptimizationDashboard;
