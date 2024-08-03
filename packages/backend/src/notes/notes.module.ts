import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';

import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

@Module({
  imports: [DatabaseModule],
  providers: [NotesService],
  exports: [NotesService],
  controllers: [NotesController],
})
export class NotesModule {}
