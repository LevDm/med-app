import { ApiProperty } from '@nestjs/swagger';

import { IsDateString, IsOptional } from 'class-validator';

export class CreateInviteDto {
  @ApiProperty()
  @IsDateString()
  @IsOptional()
  expiredAt: string;
}
