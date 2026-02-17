'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Notification } from '@prisma/client';
import { toast } from '@/hooks/util/use-toast';
import { notificationKeys } from '@/lib/query-keys';

/**
 * Hook to fetch notifications for the current user
 * Uses React Query for efficient caching and refetching
 */
export function useNotifications() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, error } = useQuery<Notification[]>({
    queryKey: notificationKeys.list(),
    queryFn: async () => {
      if (!session?.user?.id) {
        return [];
      }

      const response = await fetch('/api/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      return response.json();
    },
    enabled: !!session?.user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return { notifications, isLoading, error };
}

/**
 * Mark notifications as read
 */
async function markNotificationsAsReadApi(notificationIds: string[]) {
  const response = await fetch('/api/notifications/mark-as-read', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ notificationIds }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to mark notifications as read');
  }

  return response.json();
}

/**
 * Clear/delete notifications
 */
async function clearNotificationsApi(notificationIds: string[]) {
  const response = await fetch('/api/notifications/clear', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ notificationIds }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to clear notifications');
  }

  return response.json();
}

/**
 * Hook to use marking notifications as read
 */
export function useMarkNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationsAsReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast({
        title: 'Success',
        description: 'Notifications marked as read',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    },
  });
}

/**
 * Hook to use clearing notifications
 */
export function useClearNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearNotificationsApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast({
        title: 'Success',
        description: 'Notifications cleared',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    },
  });
}
