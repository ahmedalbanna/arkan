
import { inject, injectable } from "tsyringe";
import type { INotificationService } from "../../domain/services/INotificationService";
import { INotificationServiceToken } from "../../domain/services/INotificationService";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { Notification } from "../../domain/entities/Notification";

@injectable()
export class GetNotificationsUseCase {
    constructor(
        @inject(INotificationServiceToken)
        private notificationService: INotificationService
    ) {}

    async execute(userId: string, limit?: number): Promise<Result<Notification[], UserError>> {
        return this.notificationService.getNotifications(userId, limit);
    }
}
