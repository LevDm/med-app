import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';

import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [DatabaseModule],
  exports: [ChatService],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
