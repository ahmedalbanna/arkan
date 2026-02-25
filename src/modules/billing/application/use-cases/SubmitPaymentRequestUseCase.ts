
import { inject, injectable } from "tsyringe";
import type { ITransactionRepository } from "../../domain/repositories/ITransactionRepository";
import { ITransactionRepositoryToken } from "../../domain/repositories/ITransactionRepository";
import type { IFileStorageService } from "../../domain/services/IFileStorageService";
import { IFileStorageServiceToken } from "../../domain/services/IFileStorageService";
import type { IUserRepository } from "@/modules/users/domain/repositories/IUserRepository";
import { IUserRepositoryToken } from "@/modules/users/domain/repositories/IUserRepository";
import type { INotificationService } from "@/modules/users/domain/services/INotificationService";
import { INotificationServiceToken } from "@/modules/users/domain/services/INotificationService";
import { TransactionProperties } from "../../domain/entities/Transaction";

@injectable()
export class SubmitPaymentRequestUseCase {
    constructor(
        @inject(ITransactionRepositoryToken)
        private transactionRepository: ITransactionRepository,
        @inject(IFileStorageServiceToken)
        private fileStorageService: IFileStorageService,
        @inject(IUserRepositoryToken)
        private userRepository: IUserRepository,
        @inject(INotificationServiceToken)
        private notificationService: INotificationService
    ) {}

    async execute(params: { 
        file: Buffer, 
        fileName: string, 
        contentType: string, 
        userId: string, 
        planId: string, 
        planName: string, 
        credits: number, 
        price: number, 
        userName: string, 
        userEmail: string 
    }): Promise<TransactionProperties> {
        const { file, fileName, contentType, userId, ...rest } = params;

        // 1. Upload proof file
        const storagePath = `payment_proofs/${userId}/${Date.now()}-${fileName}`;
        const fileUrl = await this.fileStorageService.upload(storagePath, file, contentType);

        // 2. Create transaction record
        const transaction = await this.transactionRepository.save({
            userId,
            ...rest,
            status: 'pending',
            proofUrl: fileUrl,
            createdAt: new Date().toISOString()
        } as any);

        // 3. Notify all admins
        const admins = await this.userRepository.getAdmins();
        const notificationPayload = {
            title: "New Payment Request",
            description: `User ${params.userName || params.userEmail} submitted a payment request for $${params.price}.`,
            icon: "credit-card",
            link: '/admin/manage-payments'
        };

        await Promise.all(admins.map(admin => this.notificationService.send(admin.id, notificationPayload)));

        return transaction;
    }
}
