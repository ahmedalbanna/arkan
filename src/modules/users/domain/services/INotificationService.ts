
export interface NotificationPayload {
    title: string;
    description: string;
    icon?: string;
    link?: string;
}

import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../errors/UserErrors";

export interface INotificationService {
    send(userId: string, payload: NotificationPayload): Promise<Result<void, UserError>>;
    saveDeviceToken(userId: string, token: string): Promise<Result<void, UserError>>;
    markAsRead(userId: string, notificationIds: string[]): Promise<Result<void, UserError>>;
    clear(userId: string, notificationIds: string[]): Promise<Result<void, UserError>>;
    getNotifications(userId: string, limit?: number): Promise<Result<any[], UserError>>;
    sendToAll(payload: NotificationPayload): Promise<Result<void, UserError>>;
    schedule(payload: NotificationPayload & { scheduledFor: string, targetUserId?: string }): Promise<Result<void, UserError>>;
    processScheduled(): Promise<Result<number, UserError>>;
    getScheduled(options?: { status?: string, limit?: number }): Promise<Result<any[], UserError>>;
    cancelScheduled(id: string): Promise<Result<void, UserError>>;
}

export const INotificationServiceToken = Symbol("INotificationService");
