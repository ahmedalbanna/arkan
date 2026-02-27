
import { delay, inject, injectable } from "tsyringe";
import { GetTransactionsUseCase } from "../../application/use-cases/GetTransactionsUseCase";
import { CreateTransactionUseCase } from "../../application/use-cases/CreateTransactionUseCase";
import { VerifyPaymentUseCase } from "../../application/use-cases/VerifyPaymentUseCase";
import { SubmitPaymentRequestUseCase } from "../../application/use-cases/SubmitPaymentRequestUseCase";

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
