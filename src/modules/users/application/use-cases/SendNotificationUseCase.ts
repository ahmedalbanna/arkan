
import { inject, injectable } from "tsyringe";
import type { INotificationService, NotificationPayload } from "../../domain/services/INotificationService";
import { INotificationServiceToken } from "../../domain/services/INotificationService";

@injectable()
export class SendNotificationUseCase {
    constructor(
        @inject(INotificationServiceToken)
        private notificationService: INotificationService
    ) {}

    async execute(userId: string, payload: NotificationPayload): Promise<void> {
        return this.notificationService.send(userId, payload);
    }
}
