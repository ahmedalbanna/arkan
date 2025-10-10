import { PerformanceMonitor } from '../performance-monitor';

describe('PerformanceMonitor', () => {
    describe('startSession', () => {
        it('should start session successfully', () => {
            const config = {
                taskType: 'generation',
                domain: 'business',
                userInput: 'اكتب تقرير شامل'
            };

            const sessionId = PerformanceMonitor.startSession(config);

            expect(sessionId).toBeDefined();
            expect(sessionId).toContain('perf_');
            expect(sessionId).toContain('_');
        });

        it('should handle different task types', () => {
            const taskTypes = ['generation', 'analysis', 'translation', 'improvement'];

            taskTypes.forEach((taskType, index) => {
                const config = {
                    taskType,
                    domain: 'general',
                    userInput: 'نص للاختبار'
                };

                const sessionId = PerformanceMonitor.startSession(config);

                expect(sessionId).toBeDefined();
                expect(sessionId).toContain('perf_');
            });
        });

        it('should handle different domains', () => {
            const domains = ['business', 'technical', 'academic', 'creative'];

            domains.forEach((domain, index) => {
                const config = {
                    taskType: 'generation',
                    domain,
                    userInput: 'نص للاختبار'
                };

                const sessionId = PerformanceMonitor.startSession(config);

                expect(sessionId).toBeDefined();
                expect(sessionId).toContain('perf_');
            });
        });
    });

    describe('recordPhaseTime', () => {
        it('should record phase time correctly', () => {
            const config = {
                taskType: 'generation',
                domain: 'business',
                userInput: 'اكتب تقرير شامل'
            };

            const sessionId = PerformanceMonitor.startSession(config);

            PerformanceMonitor.recordPhaseTime(sessionId, 'contextAnalysisTime', 100);
            PerformanceMonitor.recordPhaseTime(sessionId, 'modelSelectionTime', 50);
            PerformanceMonitor.recordPhaseTime(sessionId, 'promptBuildingTime', 200);
            PerformanceMonitor.recordPhaseTime(sessionId, 'generationTime', 1000);
            PerformanceMonitor.recordPhaseTime(sessionId, 'qualityValidationTime', 150);

            // End session to get the data
            const session = PerformanceMonitor.endSession(sessionId, true);

            expect(session).toBeDefined();
            expect(session?.metrics.contextAnalysisTime).toBe(100);
            expect(session?.metrics.modelSelectionTime).toBe(50);
            expect(session?.metrics.promptBuildingTime).toBe(200);
            expect(session?.metrics.generationTime).toBe(1000);
            expect(session?.metrics.qualityValidationTime).toBe(150);
        });

        it('should handle iterative improvement time', () => {
            const config = {
                taskType: 'generation',
                domain: 'business',
                userInput: 'اكتب تقرير شامل'
            };

            const sessionId = PerformanceMonitor.startSession(config);

            PerformanceMonitor.recordPhaseTime(sessionId, 'iterativeImprovementTime', 500);

            const session = PerformanceMonitor.endSession(sessionId, true);

            expect(session).toBeDefined();
            expect(session?.metrics.iterativeImprovementTime).toBe(500);
        });
    });

    describe('recordQualityMetrics', () => {
        it('should record quality metrics correctly', () => {
            const config = {
                taskType: 'generation',
                domain: 'business',
                userInput: 'اكتب تقرير شامل'
            };

            const sessionId = PerformanceMonitor.startSession(config);

            PerformanceMonitor.recordQualityMetrics(sessionId, {
                qualityScore: 85,
                improvementIterations: 3,
                finalAccuracy: 92
            });

            const session = PerformanceMonitor.endSession(sessionId, true);

            expect(session).toBeDefined();
            expect(session?.metrics.qualityScore).toBe(85);
            expect(session?.metrics.improvementIterations).toBe(3);
            expect(session?.metrics.finalAccuracy).toBe(92);
        });

        it('should handle partial quality metrics', () => {
            const config = {
                taskType: 'generation',
                domain: 'business',
                userInput: 'اكتب تقرير شامل'
            };

            const sessionId = PerformanceMonitor.startSession(config);

            PerformanceMonitor.recordQualityMetrics(sessionId, {
                qualityScore: 75
            });

            const session = PerformanceMonitor.endSession(sessionId, true);

            expect(session).toBeDefined();
            expect(session?.metrics.qualityScore).toBe(75);
            expect(session?.metrics.improvementIterations).toBe(0);
            expect(session?.metrics.finalAccuracy).toBe(0);
        });
    });

    describe('recordResourceUsage', () => {
        it('should record resource usage correctly', () => {
            const config = {
                taskType: 'generation',
                domain: 'business',
                userInput: 'اكتب تقرير شامل'
            };

            const sessionId = PerformanceMonitor.startSession(config);

            PerformanceMonitor.recordResourceUsage(sessionId, {
                tokensUsed: 1000,
                modelSwitches: 2,
                memoryUsage: 50
            });

            const session = PerformanceMonitor.endSession(sessionId, true);

            expect(session).toBeDefined();
            expect(session?.metrics.tokensUsed).toBe(1000);
            expect(session?.metrics.modelSwitches).toBe(2);
            expect(session?.metrics.memoryUsage).toBe(50);
        });

        it('should accumulate resource usage', () => {
            const config = {
                taskType: 'generation',
                domain: 'business',
                userInput: 'اكتب تقرير شامل'
            };

            const sessionId = PerformanceMonitor.startSession(config);

            PerformanceMonitor.recordResourceUsage(sessionId, {
                tokensUsed: 500,
                modelSwitches: 1
            });

            PerformanceMonitor.recordResourceUsage(sessionId, {
                tokensUsed: 300,
                modelSwitches: 1
            });

            const session = PerformanceMonitor.endSession(sessionId, true);

            expect(session).toBeDefined();
            expect(session?.metrics.tokensUsed).toBe(800);
            expect(session?.metrics.modelSwitches).toBe(2);
        });
    });

    describe('recordError', () => {
        it('should record errors correctly', () => {
            const config = {
                taskType: 'generation',
                domain: 'business',
                userInput: 'اكتب تقرير شامل'
            };

            const sessionId = PerformanceMonitor.startSession(config);

            PerformanceMonitor.recordError(sessionId, 'API timeout');
            PerformanceMonitor.recordError(sessionId, 'Invalid response format');

            const session = PerformanceMonitor.endSession(sessionId, false);

            expect(session).toBeDefined();
            expect(session?.errors).toContain('API timeout');
            expect(session?.errors).toContain('Invalid response format');
            expect(session?.metrics.errorCount).toBe(2);
        });
    });

    describe('recordFallbackUsage', () => {
        it('should record fallback usage correctly', () => {
            const config = {
                taskType: 'generation',
                domain: 'business',
                userInput: 'اكتب تقرير شامل'
            };

            const sessionId = PerformanceMonitor.startSession(config);

            PerformanceMonitor.recordFallbackUsage(sessionId);

            const session = PerformanceMonitor.endSession(sessionId, true);

            expect(session).toBeDefined();
            expect(session?.metrics.fallbackUsed).toBe(true);
        });
    });

    describe('endSession', () => {
        it('should end session successfully', () => {
            const config = {
                taskType: 'generation',
                domain: 'business',
                userInput: 'اكتب تقرير شامل'
            };

            const sessionId = PerformanceMonitor.startSession(config);

            // Wait a bit to simulate processing time
            const startTime = Date.now();
            while (Date.now() - startTime < 10) {
                // Wait 10ms
            }

            const session = PerformanceMonitor.endSession(sessionId, true);

            expect(session).toBeDefined();
            expect(session?.sessionId).toBe(sessionId);
            expect(session?.status).toBe('completed');
            expect(session?.endTime).toBeDefined();
            expect(session?.metrics.executionTime).toBeGreaterThan(0);
            expect(session?.metrics.successRate).toBe(100);
        });

        it('should handle failed sessions', () => {
            const config = {
                taskType: 'generation',
                domain: 'business',
                userInput: 'اكتب تقرير شامل'
            };

            const sessionId = PerformanceMonitor.startSession(config);

            const session = PerformanceMonitor.endSession(sessionId, false);

            expect(session).toBeDefined();
            expect(session?.sessionId).toBe(sessionId);
            expect(session?.status).toBe('failed');
            expect(session?.metrics.successRate).toBe(0);
        });

        it('should handle non-existent session', () => {
            const session = PerformanceMonitor.endSession('non-existent-session', true);

            expect(session).toBeNull();
        });
    });

    describe('generatePerformanceReport', () => {
        it('should generate performance report correctly', () => {
            const config = {
                taskType: 'generation',
                domain: 'business',
                userInput: 'اكتب تقرير شامل'
            };

            const sessionId = PerformanceMonitor.startSession(config);

            PerformanceMonitor.recordQualityMetrics(sessionId, {
                qualityScore: 85,
                improvementIterations: 2
            });

            PerformanceMonitor.recordResourceUsage(sessionId, {
                tokensUsed: 1000,
                modelSwitches: 1
            });

            PerformanceMonitor.endSession(sessionId, true);

            const report = PerformanceMonitor.generatePerformanceReport();

            expect(report).toBeDefined();
            expect(report.totalSessions).toBeGreaterThan(0);
            expect(report.averageExecutionTime).toBeGreaterThan(0);
            expect(report.averageQualityScore).toBeGreaterThan(0);
            expect(report.successRate).toBeGreaterThan(0);
            expect(report.mostCommonErrors).toBeDefined();
            expect(report.performanceTrends).toBeDefined();
            expect(report.modelUsageStats).toBeDefined();
            expect(report.recommendations).toBeDefined();
        });

        it('should generate report with time range filter', () => {
            const config = {
                taskType: 'generation',
                domain: 'business',
                userInput: 'اكتب تقرير شامل'
            };

            const sessionId = PerformanceMonitor.startSession(config);
            PerformanceMonitor.endSession(sessionId, true);

            const timeRange = {
                start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
                end: new Date()
            };

            const report = PerformanceMonitor.generatePerformanceReport(timeRange);

            expect(report).toBeDefined();
            expect(report.totalSessions).toBeGreaterThanOrEqual(0);
            expect(report.averageExecutionTime).toBeGreaterThanOrEqual(0);
            expect(report.averageQualityScore).toBeGreaterThanOrEqual(0);
            expect(report.successRate).toBeGreaterThanOrEqual(0);
        });

        it('should handle empty report when no sessions', () => {
            // Clear all data first
            PerformanceMonitor.clearOldData(0);

            const report = PerformanceMonitor.generatePerformanceReport();

            expect(report).toBeDefined();
            expect(report.totalSessions).toBe(0);
            expect(report.averageExecutionTime).toBe(0);
            expect(report.averageQualityScore).toBe(0);
            expect(report.successRate).toBe(0);
            expect(report.mostCommonErrors).toEqual([]);
            expect(report.performanceTrends).toEqual([]);
            expect(report.modelUsageStats).toEqual([]);
            expect(report.recommendations).toContain('لا توجد بيانات كافية لتوليد التقرير');
        });
    });

    describe('exportData', () => {
        it('should export data as JSON', () => {
            const config = {
                taskType: 'generation',
                domain: 'business',
                userInput: 'اكتب تقرير شامل'
            };

            const sessionId = PerformanceMonitor.startSession(config);
            PerformanceMonitor.endSession(sessionId, true);

            const jsonData = PerformanceMonitor.exportData('json');

            expect(jsonData).toBeDefined();
            expect(() => JSON.parse(jsonData)).not.toThrow();
            expect(jsonData).toContain('sessionId');
            expect(jsonData).toContain('taskType');
            expect(jsonData).toContain('domain');
        });

        it('should export data as CSV', () => {
            const config = {
                taskType: 'generation',
                domain: 'business',
                userInput: 'اكتب تقرير شامل'
            };

            const sessionId = PerformanceMonitor.startSession(config);
            PerformanceMonitor.endSession(sessionId, true);

            const csvData = PerformanceMonitor.exportData('csv');

            expect(csvData).toBeDefined();
            expect(csvData).toContain('sessionId');
            expect(csvData).toContain('taskType');
            expect(csvData).toContain('domain');
            expect(csvData).toContain(',');
        });
    });

    describe('clearOldData', () => {
        it('should clear old data correctly', () => {
            const config = {
                taskType: 'generation',
                domain: 'business',
                userInput: 'اكتب تقرير شامل'
            };

            const sessionId = PerformanceMonitor.startSession(config);
            PerformanceMonitor.endSession(sessionId, true);

            const removedCount = PerformanceMonitor.clearOldData(0); // Clear all data

            expect(removedCount).toBeGreaterThan(0);
        });

        it('should handle clearing data older than specified days', () => {
            const config = {
                taskType: 'generation',
                domain: 'business',
                userInput: 'اكتب تقرير شامل'
            };

            const sessionId = PerformanceMonitor.startSession(config);
            PerformanceMonitor.endSession(sessionId, true);

            const removedCount = PerformanceMonitor.clearOldData(30); // Clear data older than 30 days

            expect(removedCount).toBeGreaterThanOrEqual(0);
        });
    });

    describe('getQuickStats', () => {
        it('should return quick stats correctly', () => {
            const config = {
                taskType: 'generation',
                domain: 'business',
                userInput: 'اكتب تقرير شامل'
            };

            const sessionId = PerformanceMonitor.startSession(config);
            PerformanceMonitor.recordQualityMetrics(sessionId, {
                qualityScore: 85
            });
            PerformanceMonitor.endSession(sessionId, true);

            const stats = PerformanceMonitor.getQuickStats();

            expect(stats).toBeDefined();
            expect(stats.activeSessions).toBeGreaterThanOrEqual(0);
            expect(stats.completedSessions).toBeGreaterThan(0);
            expect(stats.avgQualityToday).toBeGreaterThanOrEqual(0);
            expect(stats.avgExecutionTimeToday).toBeGreaterThanOrEqual(0);
        });

        it('should handle empty stats', () => {
            // Clear all data first
            PerformanceMonitor.clearOldData(0);

            const stats = PerformanceMonitor.getQuickStats();

            expect(stats).toBeDefined();
            expect(stats.activeSessions).toBe(0);
            expect(stats.completedSessions).toBe(0);
            expect(stats.avgQualityToday).toBe(0);
            expect(stats.avgExecutionTimeToday).toBe(0);
        });
    });

    describe('edge cases', () => {
        it('should handle multiple sessions simultaneously', () => {
            const configs = [
                { taskType: 'generation', domain: 'business', userInput: 'تقرير 1' },
                { taskType: 'analysis', domain: 'technical', userInput: 'تحليل 1' },
                { taskType: 'translation', domain: 'general', userInput: 'ترجمة 1' }
            ];

            const sessionIds = configs.map(config => PerformanceMonitor.startSession(config));

            expect(sessionIds).toHaveLength(3);
            expect(sessionIds[0]).not.toBe(sessionIds[1]);
            expect(sessionIds[1]).not.toBe(sessionIds[2]);

            // End all sessions
            sessionIds.forEach(sessionId => {
                PerformanceMonitor.endSession(sessionId, true);
            });
        });

        it('should handle very long execution times', () => {
            const config = {
                taskType: 'generation',
                domain: 'business',
                userInput: 'اكتب تقرير شامل'
            };

            const sessionId = PerformanceMonitor.startSession(config);

            // Wait for a longer time
            const startTime = Date.now();
            while (Date.now() - startTime < 100) {
                // Wait 100ms
            }

            const session = PerformanceMonitor.endSession(sessionId, true);

            expect(session).toBeDefined();
            expect(session?.metrics.executionTime).toBeGreaterThan(100);
        });

        it('should handle high quality scores', () => {
            const config = {
                taskType: 'generation',
                domain: 'business',
                userInput: 'اكتب تقرير شامل'
            };

            const sessionId = PerformanceMonitor.startSession(config);

            PerformanceMonitor.recordQualityMetrics(sessionId, {
                qualityScore: 99,
                improvementIterations: 5,
                finalAccuracy: 98
            });

            const session = PerformanceMonitor.endSession(sessionId, true);

            expect(session).toBeDefined();
            expect(session?.metrics.qualityScore).toBe(99);
            expect(session?.metrics.improvementIterations).toBe(5);
            expect(session?.metrics.finalAccuracy).toBe(98);
        });

        it('should handle high resource usage', () => {
            const config = {
                taskType: 'generation',
                domain: 'business',
                userInput: 'اكتب تقرير شامل'
            };

            const sessionId = PerformanceMonitor.startSession(config);

            PerformanceMonitor.recordResourceUsage(sessionId, {
                tokensUsed: 10000,
                modelSwitches: 5,
                memoryUsage: 200
            });

            const session = PerformanceMonitor.endSession(sessionId, true);

            expect(session).toBeDefined();
            expect(session?.metrics.tokensUsed).toBe(10000);
            expect(session?.metrics.modelSwitches).toBe(5);
            expect(session?.metrics.memoryUsage).toBe(200);
        });

        it('should handle multiple errors in one session', () => {
            const config = {
                taskType: 'generation',
                domain: 'business',
                userInput: 'اكتب تقرير شامل'
            };

            const sessionId = PerformanceMonitor.startSession(config);

            PerformanceMonitor.recordError(sessionId, 'Error 1');
            PerformanceMonitor.recordError(sessionId, 'Error 2');
            PerformanceMonitor.recordError(sessionId, 'Error 3');

            const session = PerformanceMonitor.endSession(sessionId, false);

            expect(session).toBeDefined();
            expect(session?.errors).toHaveLength(3);
            expect(session?.metrics.errorCount).toBe(3);
            expect(session?.status).toBe('failed');
        });
    });
});
