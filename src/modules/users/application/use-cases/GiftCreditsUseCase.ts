
import { inject, injectable } from "tsyringe";
import { IUserRepository, IUserRepositoryToken } from "../../domain/repositories/IUserRepository";
import { INotificationService, INotificationServiceToken } from "../../domain/services/INotificationService";

@injectable()
export class GiftCreditsUseCase {
    constructor(
        @inject(IUserRepositoryToken)
        private userRepository: IUserRepository,
        @inject(INotificationServiceToken)
        private notificationService: INotificationService
    ) {}

    async execute(params: { userId: string, credits: number, message?: string, adminName: string }): Promise<void> {
        const { userId, credits, message, adminName } = params;

        // 1. Ensure user exists
        const user = await this.userRepository.getById(userId);
        if (!user) throw new Error("User not found.");

        // 2. Add credits
        await this.userRepository.addCredits(userId, credits);

        // 3. Send notification
        const title = "🎁 You've received a gift!";
        const description = message 
            ? `Admin ${adminName} sent you ${credits} credits with a message: "${message}"` 
            : `An admin has sent you ${credits} credits!`;

        await this.notificationService.send(userId, {
            title,
            description,
            icon: "gem",
            link: '/profile'
        });
    }
}
