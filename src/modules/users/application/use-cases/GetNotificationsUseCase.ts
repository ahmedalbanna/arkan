
import { inject, injectable } from "tsyringe";
import type { INotificationService } from "../../domain/services/INotificationService";
import { INotificationServiceToken } from "../../domain/services/INotificationService";

@injectable()
export class GetNotificationsUseCase {
    constructor(
        @inject(INotificationServiceToken)
        private notificationService: INotificationService
    ) {}

    async execute(userId: string, limit?: number): Promise<any[]> {
        return this.notificationService.getNotifications(userId, limit);
    }
}
