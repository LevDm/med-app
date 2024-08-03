import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

import { NoteTextDto } from './notes.dto';

export class EmailConstraintError extends Error {
  constructor() {
    super('Account with this email already exists');
  }
}

@Injectable()
export class NotesService {
  constructor(private databaseService: DatabaseService) {}

  async getNotes(doctorId: string) {
    return await this.databaseService.notes.findMany({ where: { doctorId } });
  }

  async getNotesByUser(doctorId: string, userId: string) {
    return await this.databaseService.notes.findMany({ where: { doctorId, userId } });
  }

  async createNoteByUser(doctorId: string, userId: string, params: NoteTextDto) {
    return await this.databaseService.notes.create({ data: { doctorId, userId, ...params } });
  }

  async editNote(id: string, params: NoteTextDto) {
    return await this.databaseService.notes.update({ where: { id }, data: { ...params } });
  }

  async deleteNote(id: string) {
    return await this.databaseService.notes.delete({ where: { id } });
  }
}
