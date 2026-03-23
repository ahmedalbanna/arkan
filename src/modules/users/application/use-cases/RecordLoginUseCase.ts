import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { loginHistory } from "@/infrastructure/db/schema";
import { Result } from "@/lib/utils/result";
import { UserError } from "../../domain/errors/UserErrors";

@injectable()
export class RecordLoginUseCase {
    async execute(params: { 
        userId: string, 
        ip?: string, 
        userAgent?: string, 
        fingerprint?: string 
    }): Promise<Result<void, UserError>> {
        try {
            await db.insert(loginHistory).values({
                userId: params.userId,
                timestamp: new Date().toISOString(),
                ip: params.ip || null,
                userAgent: params.userAgent || null,
                fingerprint: params.fingerprint || null,
            });

            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }
}
