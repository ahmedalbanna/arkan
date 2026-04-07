
import { delay, inject, injectable } from "tsyringe";
import { GetTransactionsUseCase } from "../../application/use-cases/GetTransactionsUseCase";
import { CreateTransactionUseCase } from "../../application/use-cases/CreateTransactionUseCase";
import { VerifyPaymentUseCase } from "../../application/use-cases/VerifyPaymentUseCase";
import { SubmitPaymentRequestUseCase } from "../../application/use-cases/SubmitPaymentRequestUseCase";
import { type TransactionProperties } from "../../domain/entities/Transaction";
import { Result } from "@/infrastructure/utils/result";
import { BillingError } from "../../domain/errors/BillingErrors";

@injectable()
export class BillingController {
    constructor(
        @inject(delay(() => GetTransactionsUseCase))
        private getTransactionsUseCase: GetTransactionsUseCase,
        @inject(delay(() => CreateTransactionUseCase))
        private createTransactionUseCase: CreateTransactionUseCase,
        @inject(delay(() => VerifyPaymentUseCase))
        private verifyPaymentUseCase: VerifyPaymentUseCase,
        @inject(delay(() => SubmitPaymentRequestUseCase))
        private submitPaymentRequestUseCase: SubmitPaymentRequestUseCase
    ) {}

    async getTransactions(options: { userId?: string, status?: string, limit?: number, lastVisibleId?: string, startDate?: string, endDate?: string }): Promise<Result<any, BillingError>> {
        return this.getTransactionsUseCase.execute(options);
    }

    async createTransaction(data: Omit<TransactionProperties, "id" | "createdAt">): Promise<Result<TransactionProperties, BillingError>> {
        return this.createTransactionUseCase.execute(data);
    }

    async verifyPayment(params: { transactionId: string, userId: string, creditsToGrant: number, status: 'verified' | 'rejected', adminNotes?: string, adminId: string }): Promise<Result<void, BillingError>> {
        return this.verifyPaymentUseCase.execute(params);
    }

    async submitPaymentRequest(params: { 
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
    }): Promise<Result<TransactionProperties, BillingError>> {
        return this.submitPaymentRequestUseCase.execute(params);
    }
}
