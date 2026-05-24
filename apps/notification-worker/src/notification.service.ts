import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as admin from 'firebase-admin';
import Twilio from 'twilio';
import { NotificationGateway } from './notification.gateway';

export enum NotificationChannel {
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
  IN_APP = 'in-app',
}

export interface NotificationPayload {
  userId: string;
  channel: NotificationChannel;
  subject?: string;
  body: string;
  recipientEmail?: string;
  deviceToken?: string;
  phoneNumber?: string;
  metadata?: Record<string, unknown>;
}

interface INotificationStrategy {
  send(payload: NotificationPayload): Promise<void>;
}

@Injectable()
class EmailStrategy implements INotificationStrategy {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger('EmailStrategy');

  constructor(config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: parseInt(config.get<string>('SMTP_PORT', '587'), 10),
      secure: false,
      auth: {
        user: config.get<string>('SMTP_USER'),
        pass: config.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async send(payload: NotificationPayload): Promise<void> {
    if (!payload.recipientEmail) return;
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL || 'noreply@app.com',
        to: payload.recipientEmail,
        subject: payload.subject || 'Notification',
        text: payload.body,
      });
      this.logger.log(`Email sent to ${payload.recipientEmail}`);
    } catch (err) {
      this.logger.error(`Failed to send email: ${err}`);
      throw err;
    }
  }
}

@Injectable()
class PushStrategy implements INotificationStrategy {
  private readonly logger = new Logger('PushStrategy');

  async send(payload: NotificationPayload): Promise<void> {
    if (!payload.deviceToken) return;
    try {
      // Only initialize if not already done
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, '\n'),
          } as any),
        });
      }
      await admin.messaging().send({
        token: payload.deviceToken,
        notification: {
          title: payload.subject || 'Notification',
          body: payload.body,
        },
      });
      this.logger.log(`Push sent to ${payload.deviceToken}`);
    } catch (err) {
      this.logger.error(`Failed to send push: ${err}`);
      throw err;
    }
  }
}

@Injectable()
class SmsStrategy implements INotificationStrategy {
  private client: any;
  private readonly logger = new Logger('SmsStrategy');

  constructor(config: ConfigService) {
    this.client = Twilio(
      config.get<string>('TWILIO_ACCOUNT_SID'),
      config.get<string>('TWILIO_AUTH_TOKEN'),
    );
  }

  async send(payload: NotificationPayload): Promise<void> {
    if (!payload.phoneNumber) return;
    try {
      await this.client.messages.create({
        body: payload.body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: payload.phoneNumber,
      });
      this.logger.log(`SMS sent to ${payload.phoneNumber}`);
    } catch (err) {
      this.logger.error(`Failed to send SMS: ${err}`);
      throw err;
    }
  }
}

@Injectable()
class InAppStrategy implements INotificationStrategy {
  private readonly logger = new Logger('InAppStrategy');

  constructor(private gateway: NotificationGateway) {}

  async send(payload: NotificationPayload): Promise<void> {
    try {
      this.gateway.sendToUser(payload.userId, {
        subject: payload.subject,
        body: payload.body,
        metadata: payload.metadata,
      });
      this.logger.log(`In-app notification sent to user ${payload.userId}`);
    } catch (err) {
      this.logger.error(`Failed to send in-app notification: ${err}`);
      throw err;
    }
  }
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private strategies: Map<NotificationChannel, INotificationStrategy>;

  constructor(
    config: ConfigService,
    gateway: NotificationGateway,
  ) {
    this.strategies = new Map([
      [NotificationChannel.EMAIL, new EmailStrategy(config)],
      [NotificationChannel.PUSH, new PushStrategy()],
      [NotificationChannel.SMS, new SmsStrategy(config)],
      [NotificationChannel.IN_APP, new InAppStrategy(gateway)],
    ]);
  }

  async send(payload: NotificationPayload): Promise<void> {
    const strategy = this.strategies.get(payload.channel);
    if (!strategy) {
      this.logger.warn(`No strategy for channel: ${payload.channel}`);
      return;
    }
    try {
      await strategy.send(payload);
    } catch (err) {
      this.logger.error(`Strategy ${payload.channel} failed: ${err}`);
      throw err;
    }
  }
}
