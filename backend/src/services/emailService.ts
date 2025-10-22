// Email service for sending various types of emails
// This is a mock implementation - in production, you would integrate with a real email service

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailOptions {
  to: string;
  from?: string;
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  variables?: Record<string, any>;
}

export class EmailService {
  private fromEmail: string;
  private isEnabled: boolean;

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@chatzpt.com';
    this.isEnabled = process.env.EMAIL_SERVICE_ENABLED === 'true';
  }

  // Send email
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isEnabled) {
      console.log('Email service is disabled. Mock email sent:', {
        to: options.to,
        subject: options.subject,
        template: options.template,
        variables: options.variables,
      });
      return true;
    }

    try {
      // In production, integrate with email service like SendGrid, AWS SES, etc.
      console.log('Sending email:', {
        to: options.to,
        from: options.from || this.fromEmail,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      // Mock successful email sending
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Send welcome email
  async sendWelcomeEmail(email: string, name: string, verificationToken: string): Promise<boolean> {
    const template = this.getWelcomeEmailTemplate(name, verificationToken);
    
    return await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Send email verification email
  async sendEmailVerificationEmail(email: string, name: string, verificationToken: string): Promise<boolean> {
    const template = this.getEmailVerificationTemplate(name, verificationToken);
    
    return await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<boolean> {
    const template = this.getPasswordResetTemplate(name, resetToken);
    
    return await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Send password changed notification email
  async sendPasswordChangedEmail(email: string, name: string): Promise<boolean> {
    const template = this.getPasswordChangedTemplate(name);
    
    return await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Send account locked email
  async sendAccountLockedEmail(email: string, name: string): Promise<boolean> {
    const template = this.getAccountLockedTemplate(name);
    
    return await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Get welcome email template
  private getWelcomeEmailTemplate(name: string, verificationToken: string): EmailTemplate {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    return {
      subject: 'Welcome to ChatZPT! Please verify your email',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ChatZPT</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ChatZPT!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Thank you for signing up for ChatZPT. We're excited to have you on board!</p>
              <p>To get started, please verify your email address by clicking the button below:</p>
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p><a href="${verificationUrl}">${verificationUrl}</a></p>
              <p>This link will expire in 7 days.</p>
            </div>
            <div class="footer">
              <p>If you didn't create an account with ChatZPT, you can safely ignore this email.</p>
              <p>© 2024 ChatZPT. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to ChatZPT!
        
        Hello ${name}!
        
        Thank you for signing up for ChatZPT. We're excited to have you on board!
        
        To get started, please verify your email address by visiting this link:
        ${verificationUrl}
        
        This link will expire in 7 days.
        
        If you didn't create an account with ChatZPT, you can safely ignore this email.
        
        © 2024 ChatZPT. All rights reserved.
      `,
    };
  }

  // Get email verification template
  private getEmailVerificationTemplate(name: string, verificationToken: string): EmailTemplate {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    return {
      subject: 'Verify your email address - ChatZPT',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Please verify your email address to complete your ChatZPT account setup.</p>
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p><a href="${verificationUrl}">${verificationUrl}</a></p>
              <p>This link will expire in 7 days.</p>
            </div>
            <div class="footer">
              <p>If you didn't request this verification, you can safely ignore this email.</p>
              <p>© 2024 ChatZPT. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Verify Your Email - ChatZPT
        
        Hello ${name}!
        
        Please verify your email address to complete your ChatZPT account setup.
        
        Visit this link to verify your email:
        ${verificationUrl}
        
        This link will expire in 7 days.
        
        If you didn't request this verification, you can safely ignore this email.
        
        © 2024 ChatZPT. All rights reserved.
      `,
    };
  }

  // Get password reset template
  private getPasswordResetTemplate(name: string, resetToken: string): EmailTemplate {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    return {
      subject: 'Reset your password - ChatZPT',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .warning { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>We received a request to reset your password for your ChatZPT account.</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              <div class="warning">
                <strong>Security Notice:</strong> This link will expire in 24 hours. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
              </div>
            </div>
            <div class="footer">
              <p>If you didn't request this password reset, you can safely ignore this email.</p>
              <p>© 2024 ChatZPT. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Reset Your Password - ChatZPT
        
        Hello ${name}!
        
        We received a request to reset your password for your ChatZPT account.
        
        Visit this link to reset your password:
        ${resetUrl}
        
        This link will expire in 24 hours.
        
        If you didn't request a password reset, please ignore this email and your password will remain unchanged.
        
        © 2024 ChatZPT. All rights reserved.
      `,
    };
  }

  // Get password changed template
  private getPasswordChangedTemplate(name: string): EmailTemplate {
    return {
      subject: 'Password changed successfully - ChatZPT',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Changed</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .success { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Changed</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <div class="success">
                <strong>Success!</strong> Your password has been changed successfully.
              </div>
              <p>If you made this change, no further action is required.</p>
              <p>If you didn't make this change, please contact our support team immediately.</p>
            </div>
            <div class="footer">
              <p>© 2024 ChatZPT. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Changed - ChatZPT
        
        Hello ${name}!
        
        Your password has been changed successfully.
        
        If you made this change, no further action is required.
        
        If you didn't make this change, please contact our support team immediately.
        
        © 2024 ChatZPT. All rights reserved.
      `,
    };
  }

  // Get account locked template
  private getAccountLockedTemplate(name: string): EmailTemplate {
    return {
      subject: 'Account temporarily locked - ChatZPT',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Locked</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .warning { background: #fffbeb; border: 1px solid #fed7aa; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Account Locked</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <div class="warning">
                <strong>Security Alert:</strong> Your account has been temporarily locked due to multiple failed login attempts.
              </div>
              <p>Your account will be automatically unlocked after 12 hours.</p>
              <p>If you believe this is an error or if you need immediate access, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>© 2024 ChatZPT. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Account Locked - ChatZPT
        
        Hello ${name}!
        
        Your account has been temporarily locked due to multiple failed login attempts.
        
        Your account will be automatically unlocked after 12 hours.
        
        If you believe this is an error or if you need immediate access, please contact our support team.
        
        © 2024 ChatZPT. All rights reserved.
      `,
    };
  }
}

// Export singleton instance
export const emailService = new EmailService();
