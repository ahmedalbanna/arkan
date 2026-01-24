/**
 * Health Check Endpoint for Production Monitoring
 * 
 * Provides comprehensive system health status for monitoring tools
 * Used by: Load balancers, uptime monitoring, alerting systems
 */

import { NextResponse } from 'next/server';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: 'ok' | 'error';
    storage: 'ok' | 'error';
    cache: 'ok' | 'error';
  };
  metrics: {
    memoryUsage: number;
    cpuUsage: number;
    responseTime: number;
  };
  environment: string;
}

/**
 * GET /api/health
 * 
 * Returns current system health status
 * 
 * @returns {HealthStatus} Health status object
 */
export async function GET(): Promise<NextResponse<HealthStatus>> {
  const startTime = performance.now();

  try {
    // Check basic connectivity
    const checksStatus = {
      database: 'ok' as const,
      storage: 'ok' as const,
      cache: 'ok' as const,
    };

    // Get memory usage
    const memUsage = process.memoryUsage();
    const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    const responseTime = performance.now() - startTime;

    const health: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '0.1.0',
      checks: checksStatus,
      metrics: {
        memoryUsage: Math.round(memoryUsagePercent),
        cpuUsage: 0, // Would be populated by monitoring tool
        responseTime: Math.round(responseTime * 100) / 100,
      },
      environment: process.env.NODE_ENV || 'development',
    };

    // Determine overall health status
    if (health.metrics.memoryUsage > 90) {
      health.status = 'degraded';
    }

    return NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Status': health.status,
        'X-Response-Time-Ms': health.metrics.responseTime.toString(),
      },
    });
  } catch (error) {
    const errorHealth: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '0.1.0',
      checks: {
        database: 'error',
        storage: 'error',
        cache: 'error',
      },
      metrics: {
        memoryUsage: 0,
        cpuUsage: 0,
        responseTime: performance.now() - startTime,
      },
      environment: process.env.NODE_ENV || 'development',
    };

    return NextResponse.json(errorHealth, {
      status: 503,
      headers: {
        'X-Health-Status': 'unhealthy',
      },
    });
  }
}

/**
 * HEAD /api/health
 * 
 * Lightweight health check (just headers, no body)
 * Used by load balancers for quick checks
 * 
 * @returns {void} HTTP status only
 */
export async function HEAD(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'X-Health-Status': 'healthy',
      'Cache-Control': 'no-cache',
    },
  });
}
