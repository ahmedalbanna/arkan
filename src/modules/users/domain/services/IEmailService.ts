import { Result } from "@/lib/utils/result";

export interface IEmailService {
    sendPasswordResetEmail(email: string, resetLink: string): Promise<Result<void, Error>>;
}

export const IEmailServiceToken = Symbol('IEmailService');
