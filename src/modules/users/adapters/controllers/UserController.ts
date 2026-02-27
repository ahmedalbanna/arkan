
import { delay, inject, injectable } from "tsyringe";
import { GetUserProfileUseCase } from "../../application/use-cases/GetUserProfileUseCase";
import { UpdateUserProfileUseCase } from "../../application/use-cases/UpdateUserProfileUseCase";
import { GetPaginatedUsersUseCase } from "../../application/use-cases/GetPaginatedUsersUseCase";
import { CreateUserUseCase } from "../../application/use-cases/CreateUserUseCase";
import { ResetPasswordUseCase } from "../../application/use-cases/ResetPasswordUseCase";
import { GiftCreditsUseCase } from "../../application/use-cases/GiftCreditsUseCase";
import { DeleteUserUseCase } from "../../application/use-cases/DeleteUserUseCase";
import { GetUserStatsUseCase } from "../../application/use-cases/GetUserStatsUseCase";
import { UploadProfilePictureUseCase } from "../../application/use-cases/UploadProfilePictureUseCase";
import { GetAdminsUseCase } from "../../application/use-cases/GetAdminsUseCase";
import { SaveDeviceTokenUseCase } from "../../application/use-cases/SaveDeviceTokenUseCase";
import { MarkNotificationsAsReadUseCase } from "../../application/use-cases/MarkNotificationsAsReadUseCase";
import { ClearNotificationsUseCase } from "../../application/use-cases/ClearNotificationsUseCase";
import { CreateSessionUseCase } from "../../application/use-cases/CreateSessionUseCase";
import { revalidatePath } from "next/cache";

@injectable()
export class UserController {
    constructor(
        @inject(delay(() => GetUserProfileUseCase))
        private getUserProfileUseCase: GetUserProfileUseCase,
        @inject(delay(() => UpdateUserProfileUseCase))
        private updateUserProfileUseCase: UpdateUserProfileUseCase,
        @inject(delay(() => GetPaginatedUsersUseCase))
        private getPaginatedUsersUseCase: GetPaginatedUsersUseCase,
        @inject(delay(() => CreateUserUseCase))
        private createUserUseCase: CreateUserUseCase,
        @inject(delay(() => ResetPasswordUseCase))
        private resetPasswordUseCase: ResetPasswordUseCase,
        @inject(delay(() => GiftCreditsUseCase))
        private giftCreditsUseCase: GiftCreditsUseCase,
        @inject(delay(() => DeleteUserUseCase))
        private deleteUserUseCase: DeleteUserUseCase,
        @inject(delay(() => GetUserStatsUseCase))
        private getUserStatsUseCase: GetUserStatsUseCase,
        @inject(delay(() => UploadProfilePictureUseCase))
        private uploadProfilePictureUseCase: UploadProfilePictureUseCase,
        @inject(delay(() => GetAdminsUseCase))
        private getAdminsUseCase: GetAdminsUseCase,
        @inject(delay(() => SaveDeviceTokenUseCase))
        private saveDeviceTokenUseCase: SaveDeviceTokenUseCase,
        @inject(delay(() => MarkNotificationsAsReadUseCase))
        private markNotificationsAsReadUseCase: MarkNotificationsAsReadUseCase,
        @inject(delay(() => ClearNotificationsUseCase))
        private clearNotificationsUseCase: ClearNotificationsUseCase,
        @inject(delay(() => CreateSessionUseCase))
        private createSessionUseCase: CreateSessionUseCase
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

    async uploadProfilePicture(userId: string, file: Buffer, fileName: string, contentType: string) {
        const url = await this.uploadProfilePictureUseCase.execute(userId, file, fileName, contentType);
        revalidatePath(`/profile/${userId}`);
        return url;
    }

    async getAdmins() {
        return this.getAdminsUseCase.execute();
    }

    async saveDeviceToken(userId: string, token: string) {
        return this.saveDeviceTokenUseCase.execute(userId, token);
    }

    async markNotificationsAsRead(userId: string, notificationIds: string[]) {
        return this.markNotificationsAsReadUseCase.execute(userId, notificationIds);
    }

    async clearNotifications(userId: string, notificationIds: string[]) {
        return this.clearNotificationsUseCase.execute(userId, notificationIds);
    }

    async createSession(idToken: string, expiresIn: number) {
        return this.createSessionUseCase.execute(idToken, expiresIn);
    }
}
