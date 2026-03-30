
import { inject, injectable } from "tsyringe";
import type { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IUserRepositoryToken } from "../../domain/repositories/IUserRepository";
import type { INotificationService } from "../../domain/services/INotificationService";
import { INotificationServiceToken } from "../../domain/services/INotificationService";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { giftCreditsSchema } from "../../domain/schemas/NotificationSchema";

@injectable()
export class GiftCreditsUseCase {
    constructor(
        @inject(IUserRepositoryToken)
        private userRepository: IUserRepository,
        @inject(INotificationServiceToken)
        private notificationService: INotificationService
    ) {}

    async execute(params: { userId: string, credits: number, message?: string, adminName: string }): Promise<Result<void, UserError>> {
        const { userId, credits, message, adminName } = params;

        // 1. Validate
        const validation = giftCreditsSchema.safeParse(params);
        if (!validation.success) {
            return Result.fail(UserError.validation(`Validation failed: ${validation.error.message}`));
        }

        // 2. Ensure user exists
        const userResult = await this.userRepository.getById(userId);
        if (userResult.isFailure) {
            return Result.fail(UserError.notFound(`User ${userId} not found: ${userResult.error?.message || 'Unknown error'}`));
        }

        // 3. Add credits
        const addResult = await this.userRepository.addCredits(userId, credits);
        if (addResult.isFailure) {
            return Result.fail(UserError.saveError(`Failed to gift credits: ${addResult.error?.message || 'Unknown error'}`));
        }

        // 4. Send notification
        const title = "🎁 You've received a gift!";
        const description = message 
            ? `Admin ${adminName} sent you ${credits} credits with a message: "${message}"` 
            : `An admin has sent you ${credits} credits!`;

        try {
            await this.notificationService.send(userId, {
                title,
                description,
                icon: "gem",
                link: '/profile'
            });
        } catch (error) {
            // Log notification error but don't fail the use case if credits were already added
            console.error("Failed to send notification:", error);
        }

        return Result.ok();
    }
}
