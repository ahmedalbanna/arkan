
import "reflect-metadata";
import { injectable } from "tsyringe";
import { GetTransactionsUseCase } from "../../application/use-cases/GetTransactionsUseCase";
import { CreateTransactionUseCase } from "../../application/use-cases/CreateTransactionUseCase";
import { VerifyPaymentUseCase } from "../../application/use-cases/VerifyPaymentUseCase";
import { SubmitPaymentRequestUseCase } from "../../application/use-cases/SubmitPaymentRequestUseCase";

@injectable()
export class BillingController {
    constructor(
        private getTransactionsUseCase: GetTransactionsUseCase,
        private createTransactionUseCase: CreateTransactionUseCase,
        private verifyPaymentUseCase: VerifyPaymentUseCase,
        private submitPaymentRequestUseCase: SubmitPaymentRequestUseCase
    ) {}

    async getTransactions(options: { userId?: string, status?: string, limit?: number, lastVisibleId?: string, startDate?: string, endDate?: string }) {
        return this.getTransactionsUseCase.execute(options);
    }

    async createTransaction(data: any) {
        return this.createTransactionUseCase.execute(data);
    }

    async verifyPayment(params: any) {
        return this.verifyPaymentUseCase.execute(params);
    }

    async submitPaymentRequest(params: any) {
        return this.submitPaymentRequestUseCase.execute(params);
    }
}
