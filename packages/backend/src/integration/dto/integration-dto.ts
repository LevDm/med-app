import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsUrl } from 'class-validator';

export class AddSyncLinkDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUrl()
  shareLink: string;
}
