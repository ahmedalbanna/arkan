import { inject, injectable } from "tsyringe";
import type { INotificationService } from "../../domain/services/INotificationService";
import { INotificationServiceToken } from "../../domain/services/INotificationService";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

@injectable()
export class ProcessScheduledNotificationsUseCase {
    constructor(
        @inject(INotificationServiceToken)
        private notificationService: INotificationService
    ) {}

    async execute(): Promise<Result<number, UserError>> {
        return this.notificationService.processScheduled();
    }
}
