import { injectable } from "tsyringe";
const { authenticator } = require('otplib');
import QRCode from "qrcode";
import { Result } from "@/lib/utils/result";

@injectable()
export class TwoFactorAuthService {
    /**
     * Generates a new TOTP secret.
     */
    generateSecret(): string {
        return authenticator.generateSecret();
    }

    /**
     * Generates a setup QR code URL for the user.
     */
    async generateQrCode(email: string, secret: string): Promise<string> {
        const otpauth = authenticator.keyuri(email, 'Arkan', secret);
        return QRCode.toDataURL(otpauth);
    }

    /**
     * Verifies a TOTP token against a secret.
     */
    verifyToken(token: string, secret: string): boolean {
        return authenticator.verify({ token, secret });
    }
}
