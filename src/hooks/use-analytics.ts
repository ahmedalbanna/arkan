
'use client';

import { useAuth } from '@/context/AuthContext';
import { createUIHook } from '@/core';
import { getAuthenticatedToken } from '@/lib/authUtils';
import { handleErrorUtility } from '@/lib/errorUtils';
import { analyticsKeys } from '@/lib/query-keys';
import { fetchUserStats, type UserDashboardStats } from '@/services';
import { useQuery } from '@tanstack/react-query';

export function useUserStats() {
  const { firebaseUser } = useAuth();
  const userId = firebaseUser?.uid;

  return useQuery<UserDashboardStats>({
    queryKey: analyticsKeys.userStats(userId!),
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);
      return fetchUserStats(token);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: {
      onError: (error: Error) =>
        handleErrorUtility(error, "Failed to load your analytics data"),
    },
  });
}

/**
 * Hook محسن للتحليلات مع ميزات متقدمة
 * يستخدم النظام الجديد لتقليل التكرار وتحسين الأداء
 */
export function useAdvancedAnalytics() {
  const { firebaseUser } = useAuth();
  const userId = firebaseUser?.uid;

  const uiHook = createUIHook({
    hookName: 'advanced-analytics',
    initialState: {
      selectedTimeRange: '7d',
      selectedMetric: 'all',
      isRefreshing: false,
      lastRefreshTime: 0,
      chartData: [],
      exportFormat: 'json',
      filters: {
        dateRange: { start: null, end: null },
        categories: [],
        projects: [],
      },
    },
    customLogic: (state, setState, toast) => {
      const handleTimeRangeChange = (range: '1d' | '7d' | '30d' | '90d' | '1y') => {
        setState(prev => ({ ...prev, selectedTimeRange: range }));
        toast({ title: `Time range changed to ${range}` });
      };

      const handleMetricChange = (metric: 'all' | 'projects' | 'credits' | 'usage') => {
        setState(prev => ({ ...prev, selectedMetric: metric }));
        toast({ title: `Metric changed to ${metric}` });
      };

      const handleRefresh = () => {
        setState(prev => ({ ...prev, isRefreshing: true }));
        // Simulate refresh delay
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            isRefreshing: false,
            lastRefreshTime: Date.now()
          }));
          toast({ title: 'Analytics refreshed successfully!' });
        }, 1000);
      };

      const handleExportData = () => {
        const exportData = {
          userId,
          timeRange: state.selectedTimeRange,
          metric: state.selectedMetric,
          filters: state.filters,
          timestamp: new Date().toISOString(),
        };

        if (state.exportFormat === 'json') {
          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `analytics-${userId}-${state.selectedTimeRange}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else if (state.exportFormat === 'csv') {
          const csvData = `User ID,Time Range,Metric,Timestamp\n${userId},${state.selectedTimeRange},${state.selectedMetric},${new Date().toISOString()}`;
          const blob = new Blob([csvData], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `analytics-${userId}-${state.selectedTimeRange}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }

        toast({ title: 'Analytics data exported successfully!' });
      };

      const handleSetExportFormat = (format: 'json' | 'csv' | 'pdf') => {
        setState(prev => ({ ...prev, exportFormat: format }));
      };

      const handleFilterChange = (filterType: 'dateRange' | 'categories' | 'projects', value: any) => {
        setState(prev => ({
          ...prev,
          filters: {
            ...prev.filters,
            [filterType]: value
          }
        }));
      };

      const handleClearFilters = () => {
        setState(prev => ({
          ...prev,
          filters: {
            dateRange: { start: null, end: null },
            categories: [],
            projects: [],
          }
        }));
        toast({ title: 'Filters cleared successfully!' });
      };

      const handleChartDataUpdate = (data: any[]) => {
        setState(prev => ({ ...prev, chartData: data }));
      };

      const getFilteredData = () => {
        // This would typically filter the actual data based on current filters
        return {
          totalProjects: 0,
          totalCredits: 0,
          totalUsage: 0,
          chartData: state.chartData,
        };
      };

      return {
        handleTimeRangeChange,
        handleMetricChange,
        handleRefresh,
        handleExportData,
        handleSetExportFormat,
        handleFilterChange,
        handleClearFilters,
        handleChartDataUpdate,
        getFilteredData,
        selectedTimeRange: state.selectedTimeRange,
        selectedMetric: state.selectedMetric,
        isRefreshing: state.isRefreshing,
        lastRefreshTime: state.lastRefreshTime,
        chartData: state.chartData,
        exportFormat: state.exportFormat,
        filters: state.filters,
      };
    }
  })();

  const userStatsQuery = useQuery<UserDashboardStats>({
    queryKey: analyticsKeys.userStats(userId!),
    queryFn: async () => {
      const token = await getAuthenticatedToken(firebaseUser);
      return fetchUserStats(token);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: {
      onError: (error: Error) =>
        handleErrorUtility(error, "Failed to load your analytics data"),
    },
  });

  return {
    // الوظائف الأساسية
    ...userStatsQuery,

    // الوظائف الجديدة من UI Hook
    ...uiHook,
  };
}
