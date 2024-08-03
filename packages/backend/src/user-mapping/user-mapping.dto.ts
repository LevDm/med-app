import { ApiProperty } from '@nestjs/swagger';

import { IsUUID } from 'class-validator';

export class AssignUserToDoctorDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsUUID()
  doctorId: string;
}
