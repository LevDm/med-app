import { ApiProperty } from '@nestjs/swagger';

import { InputType, MedicalParameter, MedicalParameterType } from '@prisma/client';
import { IsDateString, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class MedicalParameterDto implements Omit<MedicalParameter, 'id' | 'userId' | 'createdAt' | 'inputType'> {
  @ApiProperty()
  @IsDateString()
  @IsOptional()
  createdAt: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  type: MedicalParameterType;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  data: object;

  @ApiProperty()
  @IsString()
  @IsOptional()
  inputType?: InputType;
}

export class MedicalParameterEditDto implements Pick<MedicalParameter, 'data'> {
  @ApiProperty()
  @IsDateString()
  @IsOptional()
  createdAt: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  data: object;
}
