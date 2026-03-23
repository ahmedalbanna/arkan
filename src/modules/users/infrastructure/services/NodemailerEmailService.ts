import { injectable } from "tsyringe";
import nodemailer from "nodemailer";
import { IEmailService } from "../../domain/services/IEmailService";
import { Result } from "@/lib/utils/result";

@injectable()
export class NodemailerEmailService implements IEmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        // Default configuration for development/production
        // You should set these in your .env file
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '465'),
            secure: process.env.SMTP_SECURE === 'true' || true,
            auth: {
                user: process.env.SMTP_USER || 'your-email@gmail.com',
                pass: process.env.SMTP_PASS || 'your-app-password',
            },
        });
    }

    async sendPasswordResetEmail(email: string, resetLink: string): Promise<Result<void, Error>> {
        try {
            const mailOptions = {
                from: `"Arkan Team" <${process.env.SMTP_USER || 'your-email@gmail.com'}>`,
                to: email,
                subject: 'Reset Your Arkan Password',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                        <div style="background-color: #0f172a; color: white; padding: 24px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px;">Arkan</h1>
                        </div>
                        <div style="padding: 24px; line-height: 1.6; color: #334155;">
                            <h2 style="color: #0f172a;">Password Reset Request</h2>
                            <p>You recently requested to reset your password for your Arkan account. Click the button below to proceed:</p>
                            <div style="text-align: center; margin: 32px 0;">
                                <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
                            </div>
                            <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
                            <p>This link will expire in 1 hour.</p>
                            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                            <p style="font-size: 12px; color: #64748b;">If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
                            <p style="font-size: 12px; color: #3b82f6; word-break: break-all;">${resetLink}</p>
                        </div>
                        <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; font-size: 12px; color: #64748b;">© 2026 Arkan. All rights reserved.</p>
                        </div>
                    </div>
                `,
            };

            await this.transporter.sendMail(mailOptions);
            return Result.ok();
        } catch (error: any) {
            console.error("Email sending error:", error);
            return Result.fail(new Error("Failed to send reset email. Please try again later."));
        }
    }

    async sendLoginAlert(params: {
        email: string,
        ip: string,
        location: string,
        device: string,
        timestamp: string
    }): Promise<Result<void, Error>> {
        try {
            const mailOptions = {
                from: `"Arkan Security" <${process.env.SMTP_USER || 'your-email@gmail.com'}>`,
                to: params.email,
                subject: 'Security Alert: New Login to Arkan',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fee2e2; border-radius: 8px; overflow: hidden;">
                        <div style="background-color: #dc2626; color: white; padding: 24px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px;">Security Alert</h1>
                        </div>
                        <div style="padding: 24px; line-height: 1.6; color: #334155;">
                            <p>Hello,</p>
                            <p>We detected a login to your Arkan account from a <strong>new device or location</strong>. Here are the details:</p>
                            <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; border: 1px solid #e2e8f0; margin: 24px 0;">
                                <p style="margin: 4px 0;"><strong>Time:</strong> ${new Date(params.timestamp).toLocaleString()}</p>
                                <p style="margin: 4px 0;"><strong>Location:</strong> ${params.location}</p>
                                <p style="margin: 4px 0;"><strong>IP Address:</strong> ${params.ip}</p>
                                <p style="margin: 4px 0;"><strong>Device:</strong> ${params.device}</p>
                            </div>
                            <p>If this was you, you can safely ignore this email. No further action is required.</p>
                            <p style="color: #dc2626; font-weight: bold;">If this was NOT you, we recommend that you change your password immediately to secure your account.</p>
                            <div style="text-align: center; margin: 32px 0;">
                                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/forgot-password" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Secure My Account</a>
                            </div>
                        </div>
                        <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; font-size: 12px; color: #64748b;">© 2026 Arkan Security. All rights reserved.</p>
                        </div>
                    </div>
                `,
            };

            await this.transporter.sendMail(mailOptions);
            return Result.ok();
        } catch (error: any) {
            console.error("Login alert email error:", error);
            return Result.fail(new Error("Failed to send login alert."));
        }
    }
}
