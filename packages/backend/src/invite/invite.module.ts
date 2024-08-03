import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';

import { InviteController } from './invite.controller';
import { InviteService } from './invite.service';

@Module({
  imports: [DatabaseModule],
  providers: [InviteService],
  exports: [InviteService],
  controllers: [InviteController],
})
export class InviteModule {}
