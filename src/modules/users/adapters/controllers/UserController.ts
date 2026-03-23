import { inject, injectable, delay } from "tsyringe";
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
import { GetNotificationsUseCase } from "../../application/use-cases/GetNotificationsUseCase";
import { SendNotificationUseCase } from "../../application/use-cases/SendNotificationUseCase";
import { VerifySessionUseCase } from "../../application/use-cases/VerifySessionUseCase";
import { LoginUseCase } from "../../application/use-cases/LoginUseCase";
import { SendPasswordResetUseCase } from "../../application/use-cases/SendPasswordResetUseCase";
import { ChangePasswordUseCase } from "../../application/use-cases/ChangePasswordUseCase";
import { RegisterFingerprintUseCase } from "../../application/use-cases/RegisterFingerprintUseCase";
import { GetUserFingerprintsUseCase } from "../../application/use-cases/GetUserFingerprintsUseCase";
import { RevokeFingerprintUseCase } from "../../application/use-cases/RevokeFingerprintUseCase";

@injectable()
export class UserController {
    constructor(
        @inject(delay(() => GetUserProfileUseCase))
        private getUserProfileUseCase: GetUserProfileUseCase,
        @inject(delay(() => LoginUseCase))
        private loginUseCase: LoginUseCase,
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
        private createSessionUseCase: CreateSessionUseCase,
        @inject(delay(() => GetNotificationsUseCase))
        private getNotificationsUseCase: GetNotificationsUseCase,
        @inject(delay(() => SendNotificationUseCase))
        private sendNotificationUseCase: SendNotificationUseCase,
        @inject(delay(() => VerifySessionUseCase))
        private verifySessionUseCase: VerifySessionUseCase,
        @inject(delay(() => SendPasswordResetUseCase))
        private sendPasswordResetUseCase: SendPasswordResetUseCase,
        @inject(delay(() => ChangePasswordUseCase))
        private changePasswordUseCase: ChangePasswordUseCase,
        @inject(delay(() => RegisterFingerprintUseCase))
        private registerFingerprintUseCase: RegisterFingerprintUseCase,
        @inject(delay(() => GetUserFingerprintsUseCase))
        private getUserFingerprintsUseCase: GetUserFingerprintsUseCase,
        @inject(delay(() => RevokeFingerprintUseCase))
        private revokeFingerprintUseCase: RevokeFingerprintUseCase
    ) {}

    async getUser(id: string) {
        return this.getUserProfileUseCase.execute(id);
    }

    async login(email: string, password: string) {
        return this.loginUseCase.execute(email, password);
    }

    async createUser(data: any) {
        return this.createUserUseCase.execute(data);
    }

    async updateUser(id: string, data: any, requesterEmail?: string) {
        return this.updateUserProfileUseCase.execute(id, data, requesterEmail);
    }

    async getPaginatedUsers(options: any) {
        return this.getPaginatedUsersUseCase.execute(options);
    }

    async getPaginated(options: any) {
        return this.getPaginatedUsersUseCase.execute(options);
    }

    async giftCredits(params: { userId: string, credits: number, message?: string, adminName: string }) {
        return this.giftCreditsUseCase.execute(params);
    }

    async deleteUser(id: string) {
        return this.deleteUserUseCase.execute(id);
    }

    async getUserStats(userId: string) {
        return this.getUserStatsUseCase.execute(userId);
    }

    async uploadProfilePicture(userId: string, file: any, fileName: string, mimeType: string) {
        return this.uploadProfilePictureUseCase.execute(userId, file, fileName, mimeType);
    }

    async getAdmins() {
        return this.getAdminsUseCase.execute();
    }

    async saveDeviceToken(userId: string, token: string) {
        return this.saveDeviceTokenUseCase.execute(userId, token);
    }

    async getNotifications(userId: string) {
        return this.getNotificationsUseCase.execute(userId);
    }

    async markNotificationsAsRead(userId: string, notificationIds: string[]) {
        return this.markNotificationsAsReadUseCase.execute(userId, notificationIds);
    }

    async clearNotifications(userId: string, notificationIds: string[]) {
        return this.clearNotificationsUseCase.execute(userId, notificationIds);
    }

    async sendNotification(userId: string, notification: any) {
        return this.sendNotificationUseCase.execute(userId, notification);
    }

    async createSession(idToken: string, expiresIn: number) {
        return this.createSessionUseCase.execute(idToken, expiresIn);
    }

    async verifySession(sessionCookie: string, checkRevoked?: boolean) {
        return this.verifySessionUseCase.execute(sessionCookie, checkRevoked);
    }

    async sendPasswordReset(email: string) {
        return this.sendPasswordResetUseCase.execute(email);
    }

    async resetPassword(userIdOrToken: string, newPassword: string, isToken: boolean = false) {
        return this.resetPasswordUseCase.execute(userIdOrToken, newPassword, isToken);
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        return this.changePasswordUseCase.execute(userId, currentPassword, newPassword);
    }

    async registerFingerprint(userId: string, fingerprint: string, metadata: any) {
        return this.registerFingerprintUseCase.execute(userId, fingerprint, metadata);
    }

    async getUserFingerprints(userId: string) {
        return this.getUserFingerprintsUseCase.execute(userId);
    }

    async revokeFingerprint(userId: string, fingerprintId: string) {
        return this.revokeFingerprintUseCase.execute(userId, fingerprintId);
    }
}
