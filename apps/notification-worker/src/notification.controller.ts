import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx } from '@nestjs/microservices';
import { RmqContext } from '@nestjs/microservices';
import { NotificationService, NotificationPayload, NotificationChannel } from './notification.service';
import { EVENT_PATTERNS } from '@app/common';

@Controller()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern(EVENT_PATTERNS.NOTIFICATION_SEND)
  async handleNotificationSend(
    @Payload() payload: NotificationPayload,
    @Ctx() context: RmqContext,
  ) {
    try {
      await this.notificationService.send(payload);
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      this.logger.log(`Notification processed and acked: ${payload.userId}`);
    } catch (err) {
      this.logger.error(`Failed to process notification: ${err}`);
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      // NACK to requeue or send to DLQ
      channel.nack(originalMsg, false, true);
    }
  }

  @EventPattern(EVENT_PATTERNS.USER_CREATED)
  async handleUserCreated(
    @Payload() payload: any,
    @Ctx() context: RmqContext,
  ) {
    try {
      this.logger.log(`User created event: ${payload.userId}`);
      // Send welcome email
      await this.notificationService.send({
        userId: payload.userId,
        channel: NotificationChannel.EMAIL,
        subject: 'Welcome to Our App',
        body: 'Thank you for registering!',
        recipientEmail: payload.email,
      });
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
    } catch (err) {
      this.logger.error(`Failed to handle user created: ${err}`);
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.nack(originalMsg, false, true);
    }
  }
}
