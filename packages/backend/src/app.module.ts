import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { DatabaseModule } from './database/database.module';
import { IntegrationModule } from './integration/integration.module';
import { MedicalParametersModule } from './medical-parameters/medical-parameters.module';
import { NotesModule } from './notes/notes.module';
import { UserMappingModule } from './user-mapping/user-mapping.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    DatabaseModule,
    UserModule,
    MedicalParametersModule,
    UserMappingModule,
    IntegrationModule,
    NotesModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
