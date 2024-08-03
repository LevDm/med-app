import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { IntegrationModule } from '../integration/integration.module';

import { MedicalParametersCollectionController, MedicalParametersController } from './medical-parameters.controller';
import { MedicalParametersService } from './medical-parameters.service';

@Module({
  imports: [DatabaseModule, IntegrationModule],
  controllers: [MedicalParametersController, MedicalParametersCollectionController],
  providers: [MedicalParametersService],
})
export class MedicalParametersModule {}
