
import { inject, injectable } from "tsyringe";
import type { INotificationService } from "../../domain/services/INotificationService";
import { INotificationServiceToken } from "../../domain/services/INotificationService";

@injectable()
export class SaveDeviceTokenUseCase {
    constructor(
        @inject(INotificationServiceToken)
        private notificationService: INotificationService
    ) {}

    async execute(userId: string, token: string): Promise<void> {
        return this.notificationService.saveDeviceToken(userId, token);
    }
}
