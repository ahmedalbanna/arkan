import { injectable } from 'tsyringe';
import bcrypt from 'bcryptjs';
import { IPasswordService } from '../../domain/services/IPasswordService';

@injectable()
export class BcryptPasswordService implements IPasswordService {
    async hash(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    async compare(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}
