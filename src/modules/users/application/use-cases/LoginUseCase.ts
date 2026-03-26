import { inject, injectable } from "tsyringe";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository";
import { IAuthRepositoryToken } from "../../domain/repositories/IAuthRepository";
import { Result } from "@/infrastructure/utils/result";
import { UserError } from "../../domain/errors/UserErrors";
import { SQLiteAuthRepository } from "../../infrastructure/repositories/SQLiteAuthRepository";

@injectable()
export class LoginUseCase {
    constructor(
        @inject(IAuthRepositoryToken)
        private authRepository: IAuthRepository
    ) {}

    async execute(email: string, password: string): Promise<Result<{ token: string, user: { uid: string, email: string, name: string } }, UserError>> {
        // We cast to SQLiteAuthRepository because sign-in is local-specific 
        // and not part of the generic IAuthRepository (which usually expects ID tokens from external providers)
        const sqliteAuth = this.authRepository as SQLiteAuthRepository;
        if (sqliteAuth && typeof sqliteAuth.signIn === 'function') {
            return sqliteAuth.signIn(email, password);
        }
        
        // Fallback for other implementations if necessary
        return Result.fail(UserError.internal("Login not supported by current auth provider"));
    }
}
