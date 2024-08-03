import { ApiProperty } from '@nestjs/swagger';

import { MedicalParameterType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, Validate } from 'class-validator';

import { ParameterType } from '../parameter-type-validator';

export class GetParameterDto {
  @ApiProperty()
  @Validate(ParameterType)
  @IsOptional()
  type: MedicalParameterType;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  start_date: string;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  end_date: string;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page: number;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset: number;
}
