import { Body, Controller, HttpStatus, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AccessGuard } from '../auth/guards';
import { Roles, RolesGuard } from '../roles';

import { AssignUserToDoctorDto } from './user-mapping.dto';
import { UserMappingService } from './user-mapping.service';

@ApiTags('mapping')
@Controller()
export class UserMappingController {
  constructor(private userMappingService: UserMappingService) {}
  @ApiOperation({ summary: 'Assignment of the patient to the doctor' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @Roles('admin')
  @UseGuards(AccessGuard, RolesGuard)
  @Post('mapping')
  async assign(@Body() { userId, doctorId }: AssignUserToDoctorDto) {
    return await this.userMappingService.assignUserToDoctor({ userId, doctorId });
  }

  @ApiOperation({ summary: 'Reassignment of the patient to the doctor' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @Roles('admin')
  @UseGuards(AccessGuard, RolesGuard)
  @Put('mapping')
  async reassign(@Body() { userId, doctorId }: AssignUserToDoctorDto) {
    return await this.userMappingService.reassignUserToDoctor({ userId, doctorId });
  }
}
