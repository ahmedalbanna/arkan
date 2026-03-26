
import { inject, injectable } from "tsyringe";
import type { ITransactionRepository } from "../../domain/repositories/ITransactionRepository";
import { ITransactionRepositoryToken } from "../../domain/repositories/ITransactionRepository";
import { AddCreditsUseCase } from "@/modules/users/application/use-cases/AddCreditsUseCase";
import type { INotificationService } from "@/modules/users/domain/services/INotificationService";
import { INotificationServiceToken } from "@/modules/users/domain/services/INotificationService";
import { Result } from "@/infrastructure/utils/result";
import { BillingError } from "../../domain/errors/BillingErrors";

@injectable()
export class VerifyPaymentUseCase {
    constructor(
        @inject(ITransactionRepositoryToken)
        private transactionRepository: ITransactionRepository,
        private addCreditsUseCase: AddCreditsUseCase,
        @inject(INotificationServiceToken)
        private notificationService: INotificationService
    ) {}

    async execute(params: { transactionId: string, userId: string, creditsToGrant: number, status: 'verified' | 'rejected', adminNotes?: string, adminId: string }): Promise<Result<void, BillingError>> {
        const { transactionId, userId, creditsToGrant, status, adminNotes, adminId } = params;

        try {
            if (status === 'verified') {
                const addCreditsResult = await this.addCreditsUseCase.execute(userId, creditsToGrant);
                if (addCreditsResult.isFailure) {
                    return Result.fail(BillingError.internal(addCreditsResult.error?.message));
                }

                const updateResult = await this.transactionRepository.update(transactionId, {
                    status: 'verified',
                    adminNotes: adminNotes || 'Payment approved.',
                    verifiedAt: new Date().toISOString(),
                    verifiedBy: adminId
                });
                
                if (updateResult.isFailure) return updateResult as any;

                const notifyResult = await this.notificationService.send(userId, {
                    title: "Payment Approved",
                    description: `Your purchase of ${creditsToGrant} credits has been approved.`,
                    icon: "credit-card",
                    link: '/payment-history'
                });
                
                if (notifyResult.isFailure) {
                    console.warn(`Failed to send notification for verified payment: ${notifyResult.error?.message}`);
                }
            } else {
                const updateResult = await this.transactionRepository.update(transactionId, {
                    status: 'rejected',
                    adminNotes: adminNotes || 'Payment could not be verified.',
                    verifiedAt: new Date().toISOString(),
                    verifiedBy: adminId
                });

                if (updateResult.isFailure) return updateResult as any;

                const notifyResult = await this.notificationService.send(userId, {
                    title: "Payment Rejected",
                    description: `Your recent purchase could not be verified. Please contact support.`,
                    icon: "credit-card",
                    link: '/payment-history'
                });

                if (notifyResult.isFailure) {
                    console.warn(`Failed to send notification for rejected payment: ${notifyResult.error?.message}`);
                }
            }
            return Result.ok();
        } catch (error: any) {
            return Result.fail(BillingError.internal(error.message));
        }
    }
}
