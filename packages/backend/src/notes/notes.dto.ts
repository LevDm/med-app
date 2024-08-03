import { ApiProperty } from '@nestjs/swagger';

import { IsDateString, IsOptional, IsString } from 'class-validator';

export class NoteTextDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  text: string;

  /*
  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  content: object
  */

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  createdAt: string;
}
