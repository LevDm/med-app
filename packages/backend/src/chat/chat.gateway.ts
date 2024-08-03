import { Logger } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Message } from '@prisma/client';
import { Server } from 'socket.io';

import { ChatService } from './chat.service';

type ChatParams = { from: string; to: string };

const getChatId = ({ from, to }: ChatParams) => {
  return [from, to].sort().join(':');
};

@WebSocketGateway({
  cors: true,
  serveClient: false,
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('message:get')
  async handleMessagesGet(@MessageBody() payload: ChatParams) {
    const messages = await this.chatService.getMessages(payload);
    this.server.emit(`${getChatId(payload)}:message:get`, messages);
  }

  @SubscribeMessage('message:clear')
  async handleMessagesClear(): Promise<void> {
    await this.chatService.clearMessages();
  }

  @SubscribeMessage('message:post')
  async handleMessagePost(
    @MessageBody()
    payload: Message,
  ) {
    const createdMessage = await this.chatService.createMessage(payload);
    this.server.emit(`${getChatId(payload)}:message:post`, createdMessage);
    this.handleMessagesGet(payload);
  }

  @SubscribeMessage('message:update')
  async handleMessageUpdate(
    @MessageBody()
    payload: Omit<Message, 'createdAt'>,
  ) {
    const createdMessage = await this.chatService.updateMessage(payload.id, payload);
    this.server.emit(`${getChatId(payload)}:message:update`, createdMessage);
    this.handleMessagesGet(payload);
  }

  afterInit(server: Server) {
    Logger.debug(server);
  }

  handleConnection() {
    // empty
  }

  handleDisconnect() {
    // empty
  }
}
