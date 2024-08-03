import { Injectable } from '@nestjs/common';

import { Message } from '@prisma/client';

import { DatabaseService } from '../database/database.service';

@Injectable()
export class ChatService {
  constructor(private databaseService: DatabaseService) {}

  async getMessages({ from, to }: Pick<Message, 'from' | 'to'>) {
    return this.databaseService.message.findMany({
      where: {
        AND: [{ from: { in: [from, to] } }, { to: { in: [from, to] } }],
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async clearMessages() {
    return this.databaseService.message.deleteMany();
  }

  async createMessage(data: Message) {
    return this.databaseService.message.create({ data });
  }

  async updateMessage(id: string, { read }: Pick<Message, 'read'>) {
    return this.databaseService.message.update({ where: { id }, data: { read } });
  }

  async removeMessage(id: string) {
    return this.databaseService.message.delete({ where: { id } });
  }
}
