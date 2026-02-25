
import { inject, injectable } from "tsyringe";
import type { ITransactionRepository } from "../../domain/repositories/ITransactionRepository";
import { ITransactionRepositoryToken } from "../../domain/repositories/ITransactionRepository";
import { AddCreditsUseCase } from "@/modules/users/application/use-cases/AddCreditsUseCase";
import type { INotificationService } from "@/modules/users/domain/services/INotificationService";
import { INotificationServiceToken } from "@/modules/users/domain/services/INotificationService";

@injectable()
export class VerifyPaymentUseCase {
    constructor(
        @inject(ITransactionRepositoryToken)
        private transactionRepository: ITransactionRepository,
        private addCreditsUseCase: AddCreditsUseCase,
        @inject(INotificationServiceToken)
        private notificationService: INotificationService
    ) {}

    async execute(params: { transactionId: string, userId: string, creditsToGrant: number, status: 'verified' | 'rejected', adminNotes?: string, adminId: string }): Promise<void> {
        const { transactionId, userId, creditsToGrant, status, adminNotes, adminId } = params;

        if (status === 'verified') {
            await this.addCreditsUseCase.execute(userId, creditsToGrant);
            await this.transactionRepository.update(transactionId, {
                status: 'verified',
                adminNotes: adminNotes || 'Payment approved.',
                verifiedAt: new Date().toISOString(),
                verifiedBy: adminId
            });
            await this.notificationService.send(userId, {
                title: "Payment Approved",
                description: `Your purchase of ${creditsToGrant} credits has been approved.`,
                icon: "credit-card",
                link: '/payment-history'
            });
        } else {
            await this.transactionRepository.update(transactionId, {
                status: 'rejected',
                adminNotes: adminNotes || 'Payment could not be verified.',
                verifiedAt: new Date().toISOString(),
                verifiedBy: adminId
            });
            await this.notificationService.send(userId, {
                title: "Payment Rejected",
                description: `Your recent purchase could not be verified. Please contact support.`,
                icon: "credit-card",
                link: '/payment-history'
            });
        }
    }
}
