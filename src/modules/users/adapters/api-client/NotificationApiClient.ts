import { injectable } from 'tsyringe';
import { apiService, ApiError } from '@/infrastructure/api/ApiService';
import { Result } from '@/lib/utils/result';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'alert' | 'error';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface SendNotificationInput {
  userId: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'alert' | 'error';
  link?: string;
}

export interface SendNotificationResponse {
  message: string;
}

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  return new ApiError(error instanceof Error ? error.message : 'Unknown error', 500);
};

@injectable()
export class NotificationApiClient {
  async fetchNotifications(): Promise<Result<Notification[], ApiError>> {
    try {
      const data = await apiService<undefined, Notification[]>({ endpoint: '/api/notifications' });
      return Result.ok(data);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async markAsRead(notificationIds: string[]): Promise<Result<{ message: string }, ApiError>> {
    try {
      const response = await apiService<{ notificationIds: string[] }, { message: string }>({
        endpoint: '/api/notifications/mark-as-read',
        method: 'POST',
        data: { notificationIds },
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async clearNotifications(notificationIds: string[]): Promise<Result<{ message: string }, ApiError>> {
    try {
      const response = await apiService<{ notificationIds: string[] }, { message: string }>({
        endpoint: '/api/notifications/clear',
        method: 'POST',
        data: { notificationIds },
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }

  async sendNotification(data: SendNotificationInput): Promise<Result<SendNotificationResponse, ApiError>> {
    try {
      const response = await apiService<SendNotificationInput, SendNotificationResponse>({
        endpoint: '/api/admin/notifications',
        method: 'POST',
        data,
      });
      return Result.ok(response);
    } catch (error: unknown) {
      return Result.fail(toApiError(error));
    }
  }
}
