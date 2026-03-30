import { inject, injectable } from "tsyringe";
import type { INotificationService } from "../../domain/services/INotificationService";
import { INotificationServiceToken } from "../../domain/services/INotificationService";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

@injectable()
export class GetScheduledNotificationsUseCase {
    constructor(
        @inject(INotificationServiceToken)
        private notificationService: INotificationService
    ) {}

    async execute(options?: { status?: string, limit?: number }): Promise<Result<any[], UserError>> {
        return this.notificationService.getScheduled(options);
    }
}
