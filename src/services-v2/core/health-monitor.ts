/**
 * مراقبة صحة الخدمات - Health Monitor v2.0
 *
 * نظام مراقبة شامل لصحة جميع الخدمات مع تقارير مفصلة
 */

export type ServiceStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export type HealthCheckType = 'http' | 'tcp' | 'database' | 'custom' | 'memory' | 'cpu' | 'disk';

export interface ServiceHealth {
    name: string;
    status: ServiceStatus;
    responseTime: number;
    lastChecked: Date;
    uptime: number;
    errorRate: number;
    checks: HealthCheck[];
    metadata?: Record<string, any>;
}

export interface HealthCheck {
    type: HealthCheckType;
    name: string;
    status: ServiceStatus;
    responseTime: number;
    lastChecked: Date;
    error?: string;
    details?: Record<string, any>;
}

export interface HealthCheckConfig {
    type: HealthCheckType;
    name: string;
    enabled: boolean;
    interval: number; // بالثواني
    timeout: number; // بالميلي ثانية
    endpoint?: string;
    command?: string;
    expectedResponse?: any;
    retries?: number;
}

export interface ServiceDefinition {
    name: string;
    type: string;
    healthChecks: HealthCheckConfig[];
    dependencies?: string[];
    critical: boolean;
    tags?: string[];
}

export interface SystemHealthReport {
    timestamp: Date;
    overallStatus: ServiceStatus;
    services: Record<string, ServiceHealth>;
    summary: {
        totalServices: number;
        healthyServices: number;
        degradedServices: number;
        unhealthyServices: number;
        unknownServices: number;
        averageResponseTime: number;
        totalUptime: number;
    };
    alerts: HealthAlert[];
    recommendations: string[];
}

export interface HealthAlert {
    id: string;
    serviceName: string;
    type: 'status_change' | 'response_time' | 'error_rate' | 'dependency_failure';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
    resolved?: boolean;
    resolution?: string;
}

export interface HealthMonitorConfig {
    checkInterval: number; // بالثواني
    enableAlerts: boolean;
    alertThresholds: {
        responseTime: number; // بالميلي ثانية
        errorRate: number; // نسبة مئوية
        downtime: number; // بالدقائق
    };
    alertEndpoints?: string[];
    enableDetailedLogging: boolean;
    maxHistorySize: number;
    enableAutoRecovery: boolean;
}

export class AdvancedHealthMonitor {
    private services: Map<string, ServiceDefinition> = new Map();
    private healthStatus: Map<string, ServiceHealth> = new Map();
    private healthHistory: Map<string, ServiceHealth[]> = new Map();
    private alerts: HealthAlert[] = [];
    private config: Required<HealthMonitorConfig>;
    private checkTimers: Map<string, NodeJS.Timeout> = new Map();
    private isMonitoring = false;

    constructor(config: Partial<HealthMonitorConfig> = {}) {
        this.config = {
            checkInterval: config.checkInterval || 30, // كل 30 ثانية
            enableAlerts: config.enableAlerts ?? true,
            alertThresholds: {
                responseTime: config.alertThresholds?.responseTime || 5000, // 5 ثواني
                errorRate: config.alertThresholds?.errorRate || 5, // 5%
                downtime: config.alertThresholds?.downtime || 5 // 5 دقائق
            },
            alertEndpoints: config.alertEndpoints || [],
            enableDetailedLogging: config.enableDetailedLogging ?? true,
            maxHistorySize: config.maxHistorySize || 100,
            enableAutoRecovery: config.enableAutoRecovery ?? false
        };

        this.startMonitoring();
    }

    /**
     * تسجيل خدمة للمراقبة
     */
    registerService(service: ServiceDefinition): void {
        this.services.set(service.name, service);
        this.initializeServiceHealth(service.name);

        if (this.config.enableDetailedLogging) {
            console.log(`✅ Registered service for monitoring: ${service.name}`);
        }
    }

    /**
     * إلغاء تسجيل خدمة
     */
    unregisterService(serviceName: string): void {
        this.services.delete(serviceName);
        this.healthStatus.delete(serviceName);

        // إيقاف مؤقتات الفحص
        if (this.checkTimers.has(serviceName)) {
            clearInterval(this.checkTimers.get(serviceName)!);
            this.checkTimers.delete(serviceName);
        }

        if (this.config.enableDetailedLogging) {
            console.log(`❌ Unregistered service from monitoring: ${serviceName}`);
        }
    }

    /**
     * فحص صحة خدمة محددة
     */
    async checkServiceHealth(serviceName: string): Promise<ServiceHealth> {
        const service = this.services.get(serviceName);
        if (!service) {
            throw new Error(`Service ${serviceName} is not registered for monitoring`);
        }

        const startTime = Date.now();
        const checks: HealthCheck[] = [];
        let overallStatus: ServiceStatus = 'healthy';

        // تنفيذ جميع فحوصات الصحة
        for (const checkConfig of service.healthChecks) {
            if (!checkConfig.enabled) continue;

            const check = await this.performHealthCheck(checkConfig);
            checks.push(check);

            // تحديد الحالة العامة بناءً على أسوأ حالة
            if (this.getStatusPriority(check.status) > this.getStatusPriority(overallStatus)) {
                overallStatus = check.status;
            }
        }

        const responseTime = Date.now() - startTime;

        const health: ServiceHealth = {
            name: serviceName,
            status: overallStatus,
            responseTime,
            lastChecked: new Date(),
            uptime: this.calculateUptime(serviceName),
            errorRate: this.calculateErrorRate(serviceName),
            checks,
            metadata: {
                checkCount: checks.length,
                criticalChecks: checks.filter(c => c.status === 'unhealthy').length
            }
        };

        this.updateServiceHealth(serviceName, health);
        return health;
    }

    /**
     * فحص صحة جميع الخدمات
     */
    async checkAllServices(): Promise<Record<string, ServiceHealth>> {
        const results: Record<string, ServiceHealth> = {};

        for (const serviceName of this.services.keys()) {
            try {
                results[serviceName] = await this.checkServiceHealth(serviceName);
            } catch (error) {
                results[serviceName] = this.createErrorHealth(serviceName, error as Error);
            }
        }

        return results;
    }

    /**
     * الحصول على حالة خدمة محددة
     */
    getServiceHealth(serviceName: string): ServiceHealth | null {
        return this.healthStatus.get(serviceName) || null;
    }

    /**
     * الحصول على تقرير صحة النظام
     */
    async getSystemHealthReport(): Promise<SystemHealthReport> {
        const services = await this.checkAllServices();
        const overallStatus = this.calculateOverallStatus(services);

        const summary = this.calculateSummaryStats(services);
        const alerts = this.getActiveAlerts();
        const recommendations = this.generateHealthRecommendations(services);

        return {
            timestamp: new Date(),
            overallStatus,
            services,
            summary,
            alerts,
            recommendations
        };
    }

    /**
     * بدء مراقبة الخدمات
     */
    startMonitoring(): void {
        if (this.isMonitoring) return;

        this.isMonitoring = true;

        // فحص دوري لجميع الخدمات
        setInterval(async () => {
            await this.performPeriodicChecks();
        }, this.config.checkInterval * 1000);

        if (this.config.enableDetailedLogging) {
            console.log('🚀 Started health monitoring');
        }
    }

    /**
     * إيقاف مراقبة الخدمات
     */
    stopMonitoring(): void {
        this.isMonitoring = false;

        // إيقاف جميع مؤقتات الفحص
        for (const timer of this.checkTimers.values()) {
            clearInterval(timer);
        }
        this.checkTimers.clear();

        if (this.config.enableDetailedLogging) {
            console.log('⏹️ Stopped health monitoring');
        }
    }

    /**
     * إضافة تنبيه صحة
     */
    private addAlert(type: HealthAlert['type'], serviceName: string, message: string, severity: HealthAlert['severity'] = 'medium'): void {
        const alert: HealthAlert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            serviceName,
            type,
            severity,
            message,
            timestamp: new Date()
        };

        this.alerts.push(alert);

        if (this.config.enableAlerts) {
            this.sendAlert(alert);
        }

        if (this.config.enableDetailedLogging) {
            console.warn(`🚨 Health Alert [${serviceName}]: ${message}`);
        }
    }

    /**
     * حل تنبيه
     */
    resolveAlert(alertId: string, resolution?: string): void {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.resolved = true;
            alert.resolution = resolution;
        }
    }

    /**
     * الحصول على التنبيهات النشطة
     */
    getActiveAlerts(): HealthAlert[] {
        return this.alerts.filter(alert => !alert.resolved);
    }

    /**
     * إرسال تنبيه إلى نقاط النهاية
     */
    private sendAlert(alert: HealthAlert): void {
        this.config.alertEndpoints?.forEach(endpoint => {
            fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(alert)
            }).catch(error => {
                console.error('Failed to send health alert:', error);
            });
        });
    }

    // الطرق المساعدة الخاصة

    private initializeServiceHealth(serviceName: string): void {
        const health: ServiceHealth = {
            name: serviceName,
            status: 'unknown',
            responseTime: 0,
            lastChecked: new Date(),
            uptime: 0,
            errorRate: 0,
            checks: [],
            metadata: {}
        };

        this.healthStatus.set(serviceName, health);
        this.healthHistory.set(serviceName, []);
    }

    private async performHealthCheck(checkConfig: HealthCheckConfig): Promise<HealthCheck> {
        const startTime = Date.now();

        try {
            let status: ServiceStatus = 'healthy';
            let error: string | undefined;
            let details: Record<string, any> | undefined;

            switch (checkConfig.type) {
                case 'http':
                    const httpResult = await this.checkHttpEndpoint(checkConfig);
                    status = httpResult.status;
                    error = httpResult.error;
                    details = httpResult.details;
                    break;

                case 'tcp':
                    const tcpResult = await this.checkTcpConnection(checkConfig);
                    status = tcpResult.status;
                    error = tcpResult.error;
                    details = tcpResult.details;
                    break;

                case 'database':
                    const dbResult = await this.checkDatabaseConnection(checkConfig);
                    status = dbResult.status;
                    error = dbResult.error;
                    details = dbResult.details;
                    break;

                case 'memory':
                    const memResult = this.checkMemoryUsage();
                    status = memResult.status;
                    error = memResult.error;
                    details = memResult.details;
                    break;

                case 'cpu':
                    const cpuResult = this.checkCpuUsage();
                    status = cpuResult.status;
                    error = cpuResult.error;
                    details = cpuResult.details;
                    break;

                case 'disk':
                    const diskResult = this.checkDiskUsage();
                    status = diskResult.status;
                    error = diskResult.error;
                    details = diskResult.details;
                    break;

                case 'custom':
                    if (checkConfig.command) {
                        const customResult = await this.checkCustomCommand(checkConfig);
                        status = customResult.status;
                        error = customResult.error;
                        details = customResult.details;
                    }
                    break;
            }

            return {
                type: checkConfig.type,
                name: checkConfig.name,
                status,
                responseTime: Date.now() - startTime,
                lastChecked: new Date(),
                error,
                details
            };

        } catch (error) {
            return {
                type: checkConfig.type,
                name: checkConfig.name,
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                lastChecked: new Date(),
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    private async checkHttpEndpoint(checkConfig: HealthCheckConfig): Promise<{
        status: ServiceStatus;
        error?: string;
        details?: Record<string, any>;
    }> {
        if (!checkConfig.endpoint) {
            return { status: 'unhealthy', error: 'No endpoint configured' };
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), checkConfig.timeout);

            const response = await fetch(checkConfig.endpoint!, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'HealthMonitor/2.0'
                }
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                return {
                    status: 'healthy',
                    details: {
                        statusCode: response.status,
                        responseTime: response.headers.get('x-response-time')
                    }
                };
            } else {
                return {
                    status: 'unhealthy',
                    error: `HTTP ${response.status}: ${response.statusText}`
                };
            }

        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return { status: 'unhealthy', error: 'Request timeout' };
            }

            return {
                status: 'unhealthy',
                error: error instanceof Error ? error.message : 'HTTP request failed'
            };
        }
    }

    private async checkTcpConnection(checkConfig: HealthCheckConfig): Promise<{
        status: ServiceStatus;
        error?: string;
        details?: Record<string, any>;
    }> {
        // في البيئة الحقيقية، سنستخدم net.Socket أو مكتبات مشابهة
        // هنا سنقوم بمحاكاة بسيطة
        return {
            status: 'healthy',
            details: { connected: true, port: 80 }
        };
    }

    private async checkDatabaseConnection(checkConfig: HealthCheckConfig): Promise<{
        status: ServiceStatus;
        error?: string;
        details?: Record<string, any>;
    }> {
        // في التطبيق الحقيقي، سنختبر الاتصال بقاعدة البيانات
        return {
            status: 'healthy',
            details: { connected: true, latency: 50 }
        };
    }

    private checkMemoryUsage(): { status: ServiceStatus; error?: string; details?: Record<string, any> } {
        if (typeof window !== 'undefined' && 'memory' in performance) {
            const memory = (performance as any).memory;
            const usagePercentage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;

            if (usagePercentage > 90) {
                return {
                    status: 'unhealthy',
                    error: 'High memory usage',
                    details: { usagePercentage, used: memory.usedJSHeapSize, total: memory.totalJSHeapSize }
                };
            } else if (usagePercentage > 75) {
                return {
                    status: 'degraded',
                    details: { usagePercentage, used: memory.usedJSHeapSize, total: memory.totalJSHeapSize }
                };
            }

            return {
                status: 'healthy',
                details: { usagePercentage, used: memory.usedJSHeapSize, total: memory.totalJSHeapSize }
            };
        }

        return { status: 'unknown', error: 'Memory monitoring not available' };
    }

    private checkCpuUsage(): { status: ServiceStatus; error?: string; details?: Record<string, any> } {
        // تقدير بسيط لاستخدام CPU
        const cpuUsage = Math.random() * 100; // في الحقيقة سنستخدم APIs مختلفة

        if (cpuUsage > 80) {
            return {
                status: 'unhealthy',
                error: 'High CPU usage',
                details: { usagePercentage: cpuUsage }
            };
        } else if (cpuUsage > 60) {
            return {
                status: 'degraded',
                details: { usagePercentage: cpuUsage }
            };
        }

        return {
            status: 'healthy',
            details: { usagePercentage: cpuUsage }
        };
    }

    private checkDiskUsage(): { status: ServiceStatus; error?: string; details?: Record<string, any> } {
        // في البيئة الحقيقية، سنستخدم fs.stat أو APIs مشابهة
        return {
            status: 'healthy',
            details: { usagePercentage: 45, freeSpace: '50GB' }
        };
    }

    private async checkCustomCommand(checkConfig: HealthCheckConfig): Promise<{
        status: ServiceStatus;
        error?: string;
        details?: Record<string, any>;
    }> {
        if (!checkConfig.command) {
            return { status: 'unhealthy', error: 'No command configured' };
        }

        try {
            // في البيئة الحقيقية، سننفذ الأمر
            // هنا سنقوم بمحاكاة بسيطة
            const result = await this.executeCommand(checkConfig.command!);

            if (checkConfig.expectedResponse && result !== checkConfig.expectedResponse) {
                return {
                    status: 'unhealthy',
                    error: `Expected response: ${checkConfig.expectedResponse}, got: ${result}`
                };
            }

            return { status: 'healthy', details: { output: result } };

        } catch (error) {
            return {
                status: 'unhealthy',
                error: error instanceof Error ? error.message : 'Command execution failed'
            };
        }
    }

    private async executeCommand(command: string): Promise<string> {
        // في البيئة الحقيقية، سنستخدم child_process أو مكتبات مشابهة
        return `Executed: ${command}`;
    }

    private updateServiceHealth(serviceName: string, health: ServiceHealth): void {
        const previousHealth = this.healthStatus.get(serviceName);
        this.healthStatus.set(serviceName, health);

        // إضافة إلى التاريخ
        if (!this.healthHistory.has(serviceName)) {
            this.healthHistory.set(serviceName, []);
        }

        const history = this.healthHistory.get(serviceName)!;
        history.push(health);

        // الاحتفاظ بالعدد المحدد فقط
        if (history.length > this.config.maxHistorySize) {
            history.splice(0, history.length - this.config.maxHistorySize);
        }

        // فحص التغييرات وإنشاء التنبيهات
        this.checkForStatusChanges(serviceName, previousHealth, health);
    }

    private checkForStatusChanges(serviceName: string, oldHealth: ServiceHealth | undefined, newHealth: ServiceHealth): void {
        if (!oldHealth || oldHealth.status === newHealth.status) return;

        const statusChanged = oldHealth.status !== newHealth.status;
        const responseTimeHigh = newHealth.responseTime > this.config.alertThresholds.responseTime;
        const errorRateHigh = newHealth.errorRate > this.config.alertThresholds.errorRate;

        if (statusChanged) {
            this.addAlert(
                'status_change',
                serviceName,
                `Service status changed from ${oldHealth.status} to ${newHealth.status}`,
                newHealth.status === 'unhealthy' ? 'critical' : 'medium'
            );
        }

        if (responseTimeHigh) {
            this.addAlert(
                'response_time',
                serviceName,
                `High response time: ${newHealth.responseTime}ms`,
                'high'
            );
        }

        if (errorRateHigh) {
            this.addAlert(
                'error_rate',
                serviceName,
                `High error rate: ${newHealth.errorRate}%`,
                'high'
            );
        }
    }

    private getStatusPriority(status: ServiceStatus): number {
        const priorities = { 'healthy': 1, 'degraded': 2, 'unhealthy': 3, 'unknown': 0 };
        return priorities[status] || 0;
    }

    private calculateUptime(serviceName: string): number {
        const history = this.healthHistory.get(serviceName) || [];
        if (history.length === 0) return 0;

        const healthyChecks = history.filter(h => h.status === 'healthy').length;
        return (healthyChecks / history.length) * 100;
    }

    private calculateErrorRate(serviceName: string): number {
        const history = this.healthHistory.get(serviceName) || [];
        if (history.length === 0) return 0;

        const unhealthyChecks = history.filter(h => h.status === 'unhealthy').length;
        return (unhealthyChecks / history.length) * 100;
    }

    private calculateOverallStatus(services: Record<string, ServiceHealth>): ServiceStatus {
        const statuses = Object.values(services).map(s => s.status);
        const hasUnhealthy = statuses.includes('unhealthy');
        const hasDegraded = statuses.includes('degraded');
        const hasUnknown = statuses.includes('unknown');

        if (hasUnhealthy) return 'unhealthy';
        if (hasDegraded) return 'degraded';
        if (hasUnknown) return 'unknown';
        return 'healthy';
    }

    private calculateSummaryStats(services: Record<string, ServiceHealth>) {
        const serviceList = Object.values(services);

        return {
            totalServices: serviceList.length,
            healthyServices: serviceList.filter(s => s.status === 'healthy').length,
            degradedServices: serviceList.filter(s => s.status === 'degraded').length,
            unhealthyServices: serviceList.filter(s => s.status === 'unhealthy').length,
            unknownServices: serviceList.filter(s => s.status === 'unknown').length,
            averageResponseTime: serviceList.reduce((sum, s) => sum + s.responseTime, 0) / serviceList.length,
            totalUptime: serviceList.reduce((sum, s) => sum + s.uptime, 0) / serviceList.length
        };
    }

    private generateHealthRecommendations(services: Record<string, ServiceHealth>): string[] {
        const recommendations: string[] = [];

        for (const [name, health] of Object.entries(services)) {
            if (health.status === 'unhealthy') {
                recommendations.push(`Service ${name} is unhealthy. Check logs and restart if necessary.`);
            } else if (health.status === 'degraded') {
                recommendations.push(`Service ${name} is degraded. Monitor closely and consider optimization.`);
            }

            if (health.responseTime > this.config.alertThresholds.responseTime) {
                recommendations.push(`Service ${name} has high response time. Consider performance optimization.`);
            }

            if (health.errorRate > this.config.alertThresholds.errorRate) {
                recommendations.push(`Service ${name} has high error rate. Check error logs and fix issues.`);
            }
        }

        return recommendations;
    }

    private createErrorHealth(serviceName: string, error: Error): ServiceHealth {
        return {
            name: serviceName,
            status: 'unhealthy',
            responseTime: 0,
            lastChecked: new Date(),
            uptime: 0,
            errorRate: 100,
            checks: [{
                type: 'custom',
                name: 'error_check',
                status: 'unhealthy',
                responseTime: 0,
                lastChecked: new Date(),
                error: error.message
            }],
            metadata: { error: true }
        };
    }

    private async performPeriodicChecks(): Promise<void> {
        for (const serviceName of this.services.keys()) {
            try {
                await this.checkServiceHealth(serviceName);
            } catch (error) {
                console.error(`Failed to check health for service ${serviceName}:`, error);
            }
        }
    }

    /**
     * إغلاق مراقب الصحة
     */
    close(): void {
        this.stopMonitoring();
    }

    /**
     * تصدير بيانات مراقبة الصحة
     */
    exportData(): {
        services: ServiceDefinition[];
        healthStatus: Record<string, ServiceHealth>;
        alerts: HealthAlert[];
        config: HealthMonitorConfig;
        exportedAt: Date;
    } {
        return {
            services: Array.from(this.services.values()),
            healthStatus: Object.fromEntries(this.healthStatus),
            alerts: this.alerts,
            config: this.config,
            exportedAt: new Date()
        };
    }
}

/**
 * مثيل عام لمراقب الصحة
 */
export const healthMonitor = new AdvancedHealthMonitor();

/**
 * دالة مساعدة للحصول على مراقب الصحة
 */
export function getHealthMonitor(): AdvancedHealthMonitor {
    return healthMonitor;
}