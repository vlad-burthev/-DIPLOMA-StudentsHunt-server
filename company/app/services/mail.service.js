import nodemailer from "nodemailer";
import { configDotenv } from "dotenv";

configDotenv();

export class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendActivationMail(email, activationUrl) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "Activate your company account",
        html: `
          <h1>Welcome to StudentsHunt!</h1>
          <p>Thank you for registering your company. Please click the link below to activate your account:</p>
          <a href="${activationUrl}">${activationUrl}</a>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        `,
      });
    } catch (error) {
      throw new Error(`Failed to send activation email: ${error.message}`);
    }
  }

  async sendPasswordResetMail(email, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "Reset your password",
        html: `
          <h1>Password Reset Request</h1>
          <p>You have requested to reset your password. Click the link below to proceed:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
        `,
      });
    } catch (error) {
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }

  async sendWelcomeMail(email, companyName) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "Welcome to StudentsHunt!",
        html: `
          <h1>Welcome to StudentsHunt, ${companyName}!</h1>
          <p>Your company account has been successfully activated.</p>
          <p>You can now:</p>
          <ul>
            <li>Post job vacancies</li>
            <li>Manage your company profile</li>
            <li>View and manage applications</li>
            <li>Connect with potential candidates</li>
          </ul>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Best regards,<br>The StudentsHunt Team</p>
        `,
      });
    } catch (error) {
      throw new Error(`Failed to send welcome email: ${error.message}`);
    }
  }

  async sendStatusUpdateMail(email, companyName, status) {
    try {
      const statusMessage = {
        active: "Your company account has been activated.",
        inactive: "Your company account has been deactivated.",
        blocked: "Your company account has been blocked.",
      }[status];

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: `Account Status Update - ${companyName}`,
        html: `
          <h1>Account Status Update</h1>
          <p>${statusMessage}</p>
          <p>If you have any questions about this change, please contact our support team.</p>
          <p>Best regards,<br>The StudentsHunt Team</p>
        `,
      });
    } catch (error) {
      throw new Error(`Failed to send status update email: ${error.message}`);
    }
  }

  async sendRecruiterInvitationMail(email, companyName, invitationToken) {
    try {
      const invitationUrl = `${process.env.FRONTEND_URL}/accept-invitation?token=${invitationToken}`;
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: `Invitation to join ${companyName} on StudentsHunt`,
        html: `
          <h1>You've been invited to join ${companyName}</h1>
          <p>You have been invited to join ${companyName} as a recruiter on StudentsHunt.</p>
          <p>Click the link below to accept the invitation:</p>
          <a href="${invitationUrl}">${invitationUrl}</a>
          <p>This invitation will expire in 7 days.</p>
          <p>If you didn't expect this invitation, please ignore this email.</p>
        `,
      });
    } catch (error) {
      throw new Error(
        `Failed to send recruiter invitation email: ${error.message}`
      );
    }
  }
}
