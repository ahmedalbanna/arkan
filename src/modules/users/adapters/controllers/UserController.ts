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
import { RecordLoginUseCase } from "../../application/use-cases/RecordLoginUseCase";
import { GetLoginHistoryUseCase } from "../../application/use-cases/GetLoginHistoryUseCase";
import { LogoutAllDevicesUseCase } from "../../application/use-cases/LogoutAllDevicesUseCase";
import { DisableUserUseCase } from "../../application/use-cases/DisableUserUseCase";
import { LogSecurityEventUseCase } from "../../application/use-cases/LogSecurityEventUseCase";
import { GetSecurityAuditLogsUseCase } from "../../application/use-cases/GetSecurityAuditLogsUseCase";
import { Setup2FAUseCase } from "../../application/use-cases/Setup2FAUseCase";
import { VerifyAndEnable2FAUseCase } from "../../application/use-cases/VerifyAndEnable2FAUseCase";
import { Verify2FATokenUseCase } from "../../application/use-cases/Verify2FATokenUseCase";
import { CleanupOldRecordsUseCase } from "../../application/use-cases/CleanupOldRecordsUseCase";
import { SendBatchNotificationUseCase } from "../../application/use-cases/SendBatchNotificationUseCase";
import { ProcessScheduledNotificationsUseCase } from "../../application/use-cases/ProcessScheduledNotificationsUseCase";
import { GetScheduledNotificationsUseCase } from "../../application/use-cases/GetScheduledNotificationsUseCase";
import { CancelScheduledNotificationUseCase } from "../../application/use-cases/CancelScheduledNotificationUseCase";

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
        @inject(delay(() => SendBatchNotificationUseCase))
        private sendBatchNotificationUseCase: SendBatchNotificationUseCase,
        @inject(delay(() => ProcessScheduledNotificationsUseCase))
        private processScheduledNotificationsUseCase: ProcessScheduledNotificationsUseCase,
        @inject(delay(() => GetScheduledNotificationsUseCase))
        private getScheduledNotificationsUseCase: GetScheduledNotificationsUseCase,
        @inject(delay(() => CancelScheduledNotificationUseCase))
        private cancelScheduledNotificationUseCase: CancelScheduledNotificationUseCase,
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
        private revokeFingerprintUseCase: RevokeFingerprintUseCase,
        @inject(delay(() => RecordLoginUseCase))
        private recordLoginUseCase: RecordLoginUseCase,
        @inject(delay(() => GetLoginHistoryUseCase))
        private getLoginHistoryUseCase: GetLoginHistoryUseCase,
        @inject(delay(() => LogoutAllDevicesUseCase))
        private logoutAllDevicesUseCase: LogoutAllDevicesUseCase,
        @inject(delay(() => DisableUserUseCase))
        private disableUserUseCase: DisableUserUseCase,
        @inject(delay(() => LogSecurityEventUseCase))
        private logSecurityEventUseCase: LogSecurityEventUseCase,
        @inject(delay(() => GetSecurityAuditLogsUseCase))
        private getSecurityAuditLogsUseCase: GetSecurityAuditLogsUseCase,
        @inject(delay(() => Setup2FAUseCase))
        private setup2FAUseCase: Setup2FAUseCase,
        @inject(delay(() => VerifyAndEnable2FAUseCase))
        private verifyAndEnable2FAUseCase: VerifyAndEnable2FAUseCase,
        @inject(delay(() => Verify2FATokenUseCase))
        private verify2FATokenUseCase: Verify2FATokenUseCase,
        @inject(delay(() => CleanupOldRecordsUseCase))
        private cleanupOldRecordsUseCase: CleanupOldRecordsUseCase
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

    async sendBatchNotification(notification: any) {
        return this.sendBatchNotificationUseCase.execute(notification);
    }

    async processScheduledNotifications() {
        return this.processScheduledNotificationsUseCase.execute();
    }

    async getScheduledNotifications(options?: { status?: string, limit?: number }) {
        return this.getScheduledNotificationsUseCase.execute(options);
    }

    async cancelScheduledNotification(id: string) {
        return this.cancelScheduledNotificationUseCase.execute(id);
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

    async registerFingerprint(params: { userId: string, fingerprint: string, metadata: any }) {
        return this.registerFingerprintUseCase.execute(params.userId, params.fingerprint, params.metadata);
    }

    async getUserFingerprints(userId: string) {
        return this.getUserFingerprintsUseCase.execute(userId);
    }

    async revokeFingerprint(params: { userId: string, fingerprintId: string }) {
        return this.revokeFingerprintUseCase.execute(params.userId, params.fingerprintId);
    }

    async recordLogin(params: { userId: string, ip?: string, userAgent?: string, fingerprint?: string }) {
        return this.recordLoginUseCase.execute(params);
    }

    async getLoginHistory(userId: string) {
        return this.getLoginHistoryUseCase.execute(userId);
    }

    async logoutAllDevices(userId: string) {
        return this.logoutAllDevicesUseCase.execute(userId);
    }

    async disableUser(params: { userId: string, isDisabled: boolean }) {
        return this.disableUserUseCase.execute(params.userId, params.isDisabled);
    }

    async logSecurityEvent(params: { 
        userId: string, 
        action: 'lockdown' | 'restore' | 'session_revocation' | 'password_change', 
        details?: string, 
        adminId?: string, 
        ip?: string 
    }) {
        return this.logSecurityEventUseCase.execute(params);
    }

    async getSecurityAuditLogs() {
        return this.getSecurityAuditLogsUseCase.execute();
    }

    async setup2FA(userId: string) {
        return this.setup2FAUseCase.execute(userId);
    }

    async verifyAndEnable2FA(userId: string, token: string) {
        return this.verifyAndEnable2FAUseCase.execute(userId, token);
    }

    async verify2FAToken(userId: string, token: string) {
        return this.verify2FATokenUseCase.execute(userId, token);
    }

    async cleanupOldRecords(days: number = 90) {
        return this.cleanupOldRecordsUseCase.execute(days);
    }
}
