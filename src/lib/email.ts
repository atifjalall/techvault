import nodemailer from "nodemailer";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error);
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Send email function
export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email send error:", error);
    return { success: false, error };
  }
}

// Email verification template
export function getVerificationEmailTemplate(
  name: string,
  verificationUrl: string
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - TechVault</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">TechVault</h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #111827;">Verify Your Email Address</h2>
                    <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #6b7280;">
                      Hi ${name},
                    </p>
                    <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #6b7280;">
                      Welcome to TechVault! Please verify your email address to activate your account and start shopping.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                      <tr>
                        <td align="center">
                          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 32px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 500;">
                            Verify Email Address
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 24px 0 0; font-size: 14px; line-height: 20px; color: #9ca3af;">
                      Or copy and paste this link into your browser:
                    </p>
                    <p style="margin: 8px 0 0; font-size: 13px; line-height: 20px; color: #6b7280; word-break: break-all;">
                      ${verificationUrl}
                    </p>

                    <p style="margin: 32px 0 0; font-size: 14px; line-height: 20px; color: #9ca3af;">
                      This link will expire in 24 hours.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 13px; line-height: 20px; color: #9ca3af; text-align: center;">
                      If you didn't create an account with TechVault, please ignore this email.
                    </p>
                    <p style="margin: 16px 0 0; font-size: 13px; line-height: 20px; color: #9ca3af; text-align: center;">
                      © ${new Date().getFullYear()} TechVault. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

// Password reset template
export function getPasswordResetEmailTemplate(name: string, resetCode: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - TechVault</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #111827;">TechVault</h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #111827;">Reset Your Password</h2>
                    <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #6b7280;">
                      Hi ${name},
                    </p>
                    <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #6b7280;">
                      We received a request to reset your password. Use the code below to reset your password:
                    </p>
                    
                    <!-- Reset Code Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                      <tr>
                        <td align="center" style="padding: 24px; background-color: #f9fafb; border-radius: 8px; border: 2px dashed #e5e7eb;">
                          <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111827; font-family: 'Courier New', monospace;">
                            ${resetCode}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 24px 0 0; font-size: 14px; line-height: 20px; color: #9ca3af;">
                      This code will expire in 15 minutes.
                    </p>

                    <p style="margin: 32px 0 0; font-size: 14px; line-height: 20px; color: #ef4444;">
                      ⚠️ If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; font-size: 13px; line-height: 20px; color: #9ca3af; text-align: center;">
                      For security reasons, never share this code with anyone.
                    </p>
                    <p style="margin: 16px 0 0; font-size: 13px; line-height: 20px; color: #9ca3af; text-align: center;">
                      © ${new Date().getFullYear()} TechVault. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

// Generate 6-digit reset code
export function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate verification token
export function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
