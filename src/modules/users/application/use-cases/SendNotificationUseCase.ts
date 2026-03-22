
import { inject, injectable } from "tsyringe";
import type { INotificationService, NotificationPayload } from "../../domain/services/INotificationService";
import { INotificationServiceToken } from "../../domain/services/INotificationService";
import { Result } from "@/lib/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

@injectable()
export class SendNotificationUseCase {
    constructor(
        @inject(INotificationServiceToken)
        private notificationService: INotificationService
    ) {}

    async execute(userId: string, payload: NotificationPayload): Promise<Result<void, UserError>> {
        return this.notificationService.send(userId, payload);
    }
}
