
export interface NotificationPayload {
    title: string;
    description: string;
    icon?: string;
    link?: string;
}

export interface INotificationService {
    send(userId: string, payload: NotificationPayload): Promise<void>;
}

export const INotificationServiceToken = Symbol("INotificationService");
