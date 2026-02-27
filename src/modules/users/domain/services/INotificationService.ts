
export interface NotificationPayload {
    title: string;
    description: string;
    icon?: string;
    link?: string;
}

export interface INotificationService {
    send(userId: string, payload: NotificationPayload): Promise<void>;
    saveDeviceToken(userId: string, token: string): Promise<void>;
    markAsRead(userId: string, notificationIds: string[]): Promise<void>;
    clear(userId: string, notificationIds: string[]): Promise<void>;
    getNotifications(userId: string, limit?: number): Promise<any[]>;
}

export const INotificationServiceToken = Symbol("INotificationService");
