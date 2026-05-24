import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailService } from './email.service';

@Controller()
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  @EventPattern('email.send')
  async handleSendEmail(
    @Payload()
    data: {
      to: string;
      subject: string;
      template: string;
      context?: Record<string, any>;
    },
  ) {
    this.logger.debug(`Processing email: ${JSON.stringify(data)}`);
    await this.emailService.sendEmail(data);
  }

  @EventPattern('email.send_batch')
  async handleSendBatchEmail(@Payload() data: { recipients: string[]; subject: string; template: string }) {
    this.logger.debug(`Processing batch email to ${data.recipients.length} recipients`);
    await this.emailService.sendBatchEmail(data);
  }
}
