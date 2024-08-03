import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';

import { IntegrationController } from './integration.controller';
import { YandexDiskService } from './yandex-disk.service';

@Module({
  imports: [DatabaseModule],
  controllers: [IntegrationController],
  exports: [YandexDiskService],
  providers: [YandexDiskService],
})
export class IntegrationModule {}
