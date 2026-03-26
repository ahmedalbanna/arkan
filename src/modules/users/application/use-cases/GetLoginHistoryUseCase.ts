import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { loginHistory } from "@/infrastructure/db/schema";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { eq, desc } from "drizzle-orm";

@injectable()
export class GetLoginHistoryUseCase {
    async execute(userId: string): Promise<Result<any[], UserError>> {
        try {
            const results = await db.query.loginHistory.findMany({
                where: eq(loginHistory.userId, userId),
                orderBy: [desc(loginHistory.timestamp)],
                limit: 20,
            });

            return Result.ok(results);
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }
}
