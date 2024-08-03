import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { InviteModule } from '../invite/invite.module';
import { UserMappingModule } from '../user-mapping/user-mapping.module';
import { UserSearchModule } from '../user-search/user-search.module';

import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [DatabaseModule, UserSearchModule, UserMappingModule, InviteModule],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
