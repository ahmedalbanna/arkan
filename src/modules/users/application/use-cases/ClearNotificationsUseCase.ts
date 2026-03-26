
import { inject, injectable } from "tsyringe";
import type { INotificationService } from "../../domain/services/INotificationService";
import { INotificationServiceToken } from "../../domain/services/INotificationService";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

@injectable()
export class ClearNotificationsUseCase {
    constructor(
        @inject(INotificationServiceToken)
        private notificationService: INotificationService
    ) {}

    async execute(userId: string, notificationIds: string[]): Promise<Result<void, UserError>> {
        return this.notificationService.clear(userId, notificationIds);
    }
}
