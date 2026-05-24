import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendEmail(data: { to: string; subject: string; template: string; context?: Record<string, any> }) {
    try {
      this.logger.log(`Sending email to ${data.to}: ${data.subject}`);

      // TODO: Implement actual email sending using nodemailer, SendGrid, SES, etc.
      // Example: await this.mailerService.sendMail({ to: data.to, subject: data.subject, ... })

      await new Promise((resolve) => setTimeout(resolve, 100));

      this.logger.log(`Email sent successfully to ${data.to}`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to send email: ${err.message}`, err.stack);
      throw err;
    }
  }

  async sendBatchEmail(data: { recipients: string[]; subject: string; template: string }) {
    try {
      this.logger.log(`Sending batch email to ${data.recipients.length} recipients: ${data.subject}`);

      // TODO: Implement batch email sending with proper error handling and retries
      const results = await Promise.allSettled(
        data.recipients.map((email) =>
          this.sendEmail({
            to: email,
            subject: data.subject,
            template: data.template,
          }),
        ),
      );

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      this.logger.log(`Batch email sent: ${successful} successful, ${failed} failed`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to send batch email: ${err.message}`, err.stack);
      throw err;
    }
  }
}
