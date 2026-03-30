import { inject, injectable } from "tsyringe";
import type { INotificationService, NotificationPayload } from "../../domain/services/INotificationService";
import { INotificationServiceToken } from "../../domain/services/INotificationService";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

@injectable()
export class SendBatchNotificationUseCase {
    constructor(
        @inject(INotificationServiceToken)
        private notificationService: INotificationService
    ) {}

    async execute(payload: NotificationPayload): Promise<Result<void, UserError>> {
        return this.notificationService.sendToAll(payload);
    }
}
