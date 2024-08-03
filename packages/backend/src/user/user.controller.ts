import { Controller, Get, HttpStatus, Param, Put, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AccessGuard } from '../auth/guards';
import { Roles, RolesGuard } from '../roles';

import { ChangeUserDataDto, SearchUserDto } from './dto';
import { UserService } from './user.service';

@ApiTags('user')
@Controller()
export class UserController {
  constructor(private userService: UserService) {}
  @ApiOperation({ summary: 'Search for a user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @Roles('admin', 'doctor')
  @UseGuards(AccessGuard, RolesGuard)
  @Get('user/search')
  async findUser(
    @Query(
      new ValidationPipe({ transform: true, transformOptions: { enableImplicitConversion: true }, forbidNonWhitelisted: true }),
    )
    { page, offset, search, role, doctorId }: SearchUserDto,
  ) {
    return await this.userService.findUser({ page, offset, search, role, doctorId });
  }

  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @Roles('admin', 'doctor', 'user')
  @UseGuards(AccessGuard, RolesGuard)
  @Get('user/:userId')
  async getUser(@Param('userId') userId: string) {
    return await this.userService.getUser(userId);
  }

  @ApiOperation({ summary: 'Changing user data' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiQuery({ name: 'newFirstName', required: false, type: 'string' })
  @ApiQuery({ name: 'newLastName', required: false, type: 'string' })
  @ApiQuery({ name: 'newEmail', required: false, type: 'string' })
  @ApiBearerAuth('Authorization')
  @Roles('admin')
  @UseGuards(AccessGuard, RolesGuard)
  @Put('user/:userId')
  async changeUserData(
    @Param('userId') userId: string,
    @Query(
      new ValidationPipe({ transform: true, transformOptions: { enableImplicitConversion: true }, forbidNonWhitelisted: true }),
    )
    { newFirstName, newLastName, newEmail }: ChangeUserDataDto,
  ) {
    return await this.userService.changeUserData(userId, newFirstName, newLastName, newEmail);
  }

  @ApiOperation({ summary: 'Deactivating user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @Roles('admin')
  @UseGuards(AccessGuard, RolesGuard)
  @Put('user/:userId/deactivate')
  async deactivateUser(@Param('userId') userId: string) {
    return await this.userService.deactivateUser(userId, true);
  }

  @ApiOperation({ summary: 'Activating user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @Roles('admin')
  @UseGuards(AccessGuard, RolesGuard)
  @Put('user/:userId/activate')
  async activateUser(@Param('userId') userId: string) {
    return await this.userService.deactivateUser(userId, false);
  }
}
