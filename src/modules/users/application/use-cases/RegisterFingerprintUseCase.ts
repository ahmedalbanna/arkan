import { injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { userFingerprints, users } from "@/infrastructure/db/schema";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class RegisterFingerprintUseCase {
    async execute(userId: string, fingerprint: string, metadata: any): Promise<Result<void, UserError>> {
        try {
            const now = new Date().toISOString();

            // Get user's current token version to tag this fingerprint
            const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
            const tokenVersion = user?.tokenVersion || 1;

            // 1. Check if this specific fingerprint already exists for this user
            const existing = await db.query.userFingerprints.findFirst({
                where: and(
                    eq(userFingerprints.userId, userId),
                    eq(userFingerprints.fingerprint, fingerprint)
                ),
            });

            if (existing) {
                // Update last used timestamp and token version
                await db.update(userFingerprints)
                    .set({ 
                        lastUsedAt: now, 
                        metadata: JSON.stringify(metadata),
                        tokenVersion
                    })
                    .where(eq(userFingerprints.id, existing.id));
                return Result.ok();
            }

            // 2. New fingerprint for this user - Register it
            await db.insert(userFingerprints).values({
                id: uuidv4(),
                userId,
                fingerprint,
                lastUsedAt: now,
                metadata: JSON.stringify(metadata),
                tokenVersion
            });

            // 3. Optional: Logic to detect account sharing 
            // count unique fingerprints for this user in last 30 days
            // if count > 5, flag user for review

            return Result.ok();
        } catch (error: any) {
            return Result.fail(UserError.internal(error.message));
        }
    }
}
