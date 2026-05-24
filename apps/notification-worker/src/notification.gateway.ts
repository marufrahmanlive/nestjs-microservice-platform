import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(NotificationGateway.name);

  handleConnection(client: Socket) {
    const userId = client.handshake.auth.userId as string | undefined;
    if (userId) {
      client.join(`user:${userId}`);
      this.logger.log(`Client connected: ${client.id} for user ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  sendToUser(userId: string, data: any): void {
    this.server.to(`user:${userId}`).emit('notification', data);
    this.logger.debug(`Notification sent to user ${userId}`);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket, data: any) {
    return { event: 'pong', data };
  }
}
