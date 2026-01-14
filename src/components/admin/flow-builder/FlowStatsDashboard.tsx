/**
 * Flow Stats Dashboard
 * Week 3 - Day 2: Analytics Dashboard
 * 
 * Visual dashboard for flow analytics and performance metrics
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Zap,
  Clock,
} from 'lucide-react';
import type { FlowAnalytics } from '@/services/execution-trace-service';

// ============================================================================
// Flow Stats Dashboard Component
// ============================================================================

interface FlowStatsDashboardProps {
  analytics: FlowAnalytics;
  timeSeriesData?: Array<{
    date: string;
    executions: number;
    successRate: number;
    avgDuration: number;
  }>;
}

export function FlowStatsDashboard({ analytics, timeSeriesData }: FlowStatsDashboardProps) {
  // Colors
  const COLORS = {
    success: '#10b981',
    error: '#ef4444',
    primary: '#3b82f6',
  };

  // Pie chart data
  const statusData = [
    { name: 'Successful', value: analytics.successfulExecutions, color: COLORS.success },
    { name: 'Failed', value: analytics.failedExecutions, color: COLORS.error },
  ];

  // Duration percentiles data
  const percentileData = [
    { name: 'P50', value: analytics.p50Duration },
    { name: 'P95', value: analytics.p95Duration },
    { name: 'P99', value: analytics.p99Duration },
  ];

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(4)}`;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Executions"
          value={analytics.totalExecutions.toLocaleString()}
          icon={<Activity className="w-5 h-5" />}
          color="blue"
        />
        <MetricCard
          title="Success Rate"
          value={`${(analytics.successRate * 100).toFixed(1)}%`}
          icon={
            analytics.successRate >= 0.9 ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )
          }
          color={analytics.successRate >= 0.9 ? 'green' : 'red'}
          subtitle={`${analytics.successfulExecutions} successful`}
        />
        <MetricCard
          title="Avg Duration"
          value={formatDuration(analytics.avgDuration)}
          icon={<Clock className="w-5 h-5" />}
          color="purple"
          subtitle={`P95: ${formatDuration(analytics.p95Duration)}`}
        />
        <MetricCard
          title="Total Cost"
          value={formatCurrency(analytics.totalCost)}
          icon={<DollarSign className="w-5 h-5" />}
          color="amber"
          subtitle={`Avg: ${formatCurrency(analytics.avgCost)}`}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success/Failure Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Execution Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">
                Successful: {analytics.successfulExecutions}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm">
                Failed: {analytics.failedExecutions}
              </span>
            </div>
          </div>
        </Card>

        {/* Duration Percentiles */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Duration Percentiles</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={percentileData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatDuration(value as number)} />
              <Bar dataKey="value" fill={COLORS.primary} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="text-muted-foreground">Min</p>
              <p className="font-medium">{formatDuration(analytics.minDuration)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg</p>
              <p className="font-medium">{formatDuration(analytics.avgDuration)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Max</p>
              <p className="font-medium">{formatDuration(analytics.maxDuration)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Time Series Chart */}
      {timeSeriesData && timeSeriesData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Execution Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="executions"
                stroke={COLORS.primary}
                name="Executions"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="successRate"
                stroke={COLORS.success}
                name="Success Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Token & Cost Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            <Zap className="w-5 h-5 inline mr-2" />
            Token Usage
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Total Tokens</span>
              <span className="text-lg font-bold">
                {analytics.totalTokens.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Avg per Execution</span>
              <span className="text-lg font-bold">
                {Math.round(analytics.avgTokens).toLocaleString()}
              </span>
            </div>
            {analytics.totalExecutions > 0 && (
              <div className="text-sm text-muted-foreground text-center">
                {((analytics.totalTokens / analytics.totalExecutions) / 1000).toFixed(1)}k
                tokens per execution on average
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            <DollarSign className="w-5 h-5 inline mr-2" />
            Cost Analysis
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Total Cost</span>
              <span className="text-lg font-bold">
                {formatCurrency(analytics.totalCost)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">Avg per Execution</span>
              <span className="text-lg font-bold">
                {formatCurrency(analytics.avgCost)}
              </span>
            </div>
            {analytics.totalExecutions > 0 && (
              <div className="text-sm text-muted-foreground text-center">
                Estimated monthly: {formatCurrency(analytics.avgCost * 30 * (analytics.totalExecutions / 7))}
                (at current rate)
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// Metric Card Component
// ============================================================================

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple' | 'amber';
  subtitle?: string;
}

function MetricCard({ title, value, icon, color, subtitle }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    red: 'bg-red-500/10 text-red-500',
    purple: 'bg-purple-500/10 text-purple-500',
    amber: 'bg-amber-500/10 text-amber-500',
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
