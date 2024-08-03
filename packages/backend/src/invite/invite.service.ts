import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

@Injectable()
export class InviteService {
  constructor(private databaseService: DatabaseService) {}

  async createInvite(expiredAt: string) {
    const invite = await this.databaseService.invite.create({ data: { expiredAt } });
    return invite;
  }

  async invalidateInvite(id: string) {
    const invite = await this.databaseService.invite.update({ data: { active: false }, where: { id } });
    return invite;
  }

  async isValidInvite(id: string) {
    const invite = await this.databaseService.invite.findUnique({ where: { id, active: true } });
    return !!invite;
  }
}
