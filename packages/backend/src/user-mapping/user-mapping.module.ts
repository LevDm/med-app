import { Global, Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';

import { UserMappingController } from './user-mapping.controller';
import { UserMappingService } from './user-mapping.service';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [UserMappingService],
  exports: [UserMappingService],
  controllers: [UserMappingController],
})
export class UserMappingModule {}
