import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AccessGuard } from '../auth/guards';
import { Roles, RolesGuard } from '../roles';

import { NoteTextDto } from './notes.dto';
import { NotesService } from './notes.service';

@ApiTags('notes')
@Controller()
export class NotesController {
  constructor(private notesService: NotesService) {}
  @ApiOperation({ summary: 'Receive all physician notes' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @Roles('doctor')
  @UseGuards(AccessGuard, RolesGuard)
  @Get(':doctorId/notes')
  async getNotes(@Param('doctorID') doctorId: string) {
    return await this.notesService.getNotes(doctorId);
  }

  @ApiOperation({ summary: 'Receive all physician records for a specific patient' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @Roles('doctor')
  @UseGuards(AccessGuard, RolesGuard)
  @Get(':doctorId/notes/:userId')
  async getNotesByUser(@Param('doctorId') doctorId: string, @Param('userId') userId: string) {
    return await this.notesService.getNotesByUser(doctorId, userId);
  }

  @ApiOperation({ summary: 'Creating a new note' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @Roles('doctor')
  @UseGuards(AccessGuard, RolesGuard)
  @Post(':doctorId/notes/:userId')
  async createNoteByUser(@Param('doctorId') doctorId: string, @Param('userId') userId: string, @Body() params: NoteTextDto) {
    return await this.notesService.createNoteByUser(doctorId, userId, params);
  }

  @ApiOperation({ summary: 'Editing a note' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @Roles('doctor')
  @UseGuards(AccessGuard, RolesGuard)
  @Put('notes/:id')
  async editNote(@Param('id') id: string, @Body() params: NoteTextDto) {
    return await this.notesService.editNote(id, params);
  }

  @ApiOperation({ summary: 'Deleting a note' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @Roles('doctor')
  @UseGuards(AccessGuard, RolesGuard)
  @Delete('notes/:id')
  async deleteNote(@Param('id') id: string) {
    return await this.notesService.deleteNote(id);
  }
}
