import { Resend } from "resend";
import config from "../school.config";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM ?? `${config.school.appName} <security@${config.school.domain}>`;

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpEmail(email: string, code: string) {
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: [email],
    subject: `Your ${config.school.appName} verification code`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="margin: 0 0 8px; font-size: 20px; color: #111;">Verification Code</h2>
        <p style="margin: 0 0 24px; color: #666; font-size: 14px;">Enter this code to complete your sign-in to ${config.school.appName} admin.</p>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 32px; letter-spacing: 6px; font-weight: 700; color: #111;">${code}</span>
        </div>
        <p style="margin: 0; color: #999; font-size: 12px;">This code expires in 5 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    console.error("Failed to send OTP email:", error.message);
    throw new Error("Failed to send verification email");
  }
}
