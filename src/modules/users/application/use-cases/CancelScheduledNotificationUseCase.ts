import { inject, injectable } from "tsyringe";
import type { INotificationService } from "../../domain/services/INotificationService";
import { INotificationServiceToken } from "../../domain/services/INotificationService";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

@injectable()
export class CancelScheduledNotificationUseCase {
    constructor(
        @inject(INotificationServiceToken)
        private notificationService: INotificationService
    ) {}

    async execute(id: string): Promise<Result<void, UserError>> {
        return this.notificationService.cancelScheduled(id);
    }
}
