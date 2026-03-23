import { inject, injectable } from "tsyringe";
import { db } from "@/infrastructure/db";
import { loginHistory, users, userFingerprints } from "@/infrastructure/db/schema";
import { Result } from "@/lib/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { getLocationFromIp } from "@/lib/utils/security/location";
import { type IEmailService, IEmailServiceToken } from "../../domain/services/IEmailService";
import { eq, desc, and, ne } from "drizzle-orm";

@injectable()
export class RecordLoginUseCase {
    constructor(
        @inject(IEmailServiceToken)
        private emailService: IEmailService
    ) {}

    async execute(params: { 
        userId: string, 
        ip?: string, 
        userAgent?: string, 
        fingerprint?: string 
    }): Promise<Result<void, UserError>> {
        try {
            const timestamp = new Date().toISOString();
            
            // 1. Geographic Lookup
            const location = params.ip ? await getLocationFromIp(params.ip) : 'Unknown';

            // 2. Check if this is a "New" login (different IP or different Fingerprint)
            const lastLogin = await db.query.loginHistory.findFirst({
                where: eq(loginHistory.userId, params.userId),
                orderBy: [desc(loginHistory.timestamp)],
            });

            const isNewDevice = params.fingerprint && lastLogin && lastLogin.fingerprint !== params.fingerprint;
            const isNewIp = params.ip && lastLogin && lastLogin.ip !== params.ip;

            // 3. Record History
            await db.insert(loginHistory).values({
                userId: params.userId,
                timestamp,
                ip: params.ip || null,
                location,
                userAgent: params.userAgent || null,
                fingerprint: params.fingerprint || null,
            });

            // 4. Send Alert if suspicious/new
            if (lastLogin && (isNewDevice || isNewIp)) {
                const user = await db.query.users.findFirst({
                    where: eq(users.id, params.userId),
                });

                if (user?.email) {
                    await this.emailService.sendLoginAlert({
                        email: user.email,
                        ip: params.ip || 'Unknown',
                        location: location || 'Unknown',
                        device: params.userAgent || 'Unknown Device',
                        timestamp
                    });
                }
            }

            return Result.ok();
        } catch (error: any) {
            console.error('RecordLogin error:', error);
            return Result.fail(UserError.internal(error.message));
        }
    }
}
