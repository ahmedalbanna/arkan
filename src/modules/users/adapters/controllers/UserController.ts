import "reflect-metadata";

import { injectable, inject } from "tsyringe";
import { GetUserProfileUseCase } from "../../application/use-cases/GetUserProfileUseCase";
import { UpdateUserProfileUseCase } from "../../application/use-cases/UpdateUserProfileUseCase";
import { GetPaginatedUsersUseCase } from "../../application/use-cases/GetPaginatedUsersUseCase";
import { CreateUserUseCase } from "../../application/use-cases/CreateUserUseCase";
import { ResetPasswordUseCase } from "../../application/use-cases/ResetPasswordUseCase";
import { GiftCreditsUseCase } from "../../application/use-cases/GiftCreditsUseCase";
import { DeleteUserUseCase } from "../../application/use-cases/DeleteUserUseCase";
import { GetUserStatsUseCase } from "../../application/use-cases/GetUserStatsUseCase";
import { revalidatePath } from "next/cache";

@injectable()
export class UserController {
    constructor(
        @inject(GetUserProfileUseCase) private getUserProfileUseCase: GetUserProfileUseCase,
        @inject(UpdateUserProfileUseCase) private updateUserProfileUseCase: UpdateUserProfileUseCase,
        @inject(GetPaginatedUsersUseCase) private getPaginatedUsersUseCase: GetPaginatedUsersUseCase,
        @inject(CreateUserUseCase) private createUserUseCase: CreateUserUseCase,
        @inject(ResetPasswordUseCase) private resetPasswordUseCase: ResetPasswordUseCase,
        @inject(GiftCreditsUseCase) private giftCreditsUseCase: GiftCreditsUseCase,
        @inject(DeleteUserUseCase) private deleteUserUseCase: DeleteUserUseCase,
        @inject(GetUserStatsUseCase) private getUserStatsUseCase: GetUserStatsUseCase
    ) {}

    async getUser(userId: string) {
        return this.getUserProfileUseCase.execute(userId);
    }

    async updateUser(userId: string, data: any, currentEmail?: string) {
        const result = await this.updateUserProfileUseCase.execute(userId, data, currentEmail);
        
        revalidatePath(`/profile/${userId}`);
        revalidatePath('/admin/manage-users');
        
        return result;
    }

    async getPaginatedUsers(options: { limit: number, lastVisibleId?: string }) {
        return this.getPaginatedUsersUseCase.execute(options);
    }

    async createUser(data: any) {
        return this.createUserUseCase.execute(data);
    }

    async resetPassword(userId: string, newPassword: string) {
        return this.resetPasswordUseCase.execute(userId, newPassword);
    }

    async giftCredits(params: { userId: string, credits: number, message?: string, adminName: string }) {
        return this.giftCreditsUseCase.execute(params);
    }

    async deleteUser(userId: string) {
        return this.deleteUserUseCase.execute(userId);
    }

    async getUserStats(userId: string) {
        return this.getUserStatsUseCase.execute(userId);
    }
}
