import { ApiProperty } from '@nestjs/swagger';

import { Gender, Role, User } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Validate } from 'class-validator';

import { IsValidRole } from '../../validators';

export class UserDto implements Omit<User, 'password'> {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  role: Role;

  @ApiProperty()
  @IsString()
  gender: Gender;

  @ApiProperty()
  @IsNumber()
  age: number;

  @ApiProperty()
  @IsBoolean()
  deactivated: boolean;
}

export class ChangeUserDataDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  newFirstName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  newLastName: string;

  @ApiProperty()
  @IsEmail()
  @IsOptional()
  newEmail: string;
}

export class CreateUserDto implements Omit<User, 'id' | 'deactivated'> {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  role: Role;

  @IsNotEmpty()
  @IsString()
  gender: Gender;

  @IsNotEmpty()
  @IsNumber()
  age: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  inviteId?: string;
}

export class SearchUserDto {
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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, type: 'string' })
  @IsOptional()
  @Validate(IsValidRole)
  role?: Role | Role[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  doctorId?: string;
}
