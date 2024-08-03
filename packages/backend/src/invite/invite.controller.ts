import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AccessGuard } from '../auth/guards';
import { Roles, RolesGuard } from '../roles';

import { CreateInviteDto } from './invite.dto';
import { InviteService } from './invite.service';

@ApiTags('invite')
@Controller()
export class InviteController {
  constructor(private inviteService: InviteService) {}

  @ApiOperation({ summary: 'Creates invite' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @Roles('admin')
  @UseGuards(AccessGuard, RolesGuard)
  @Post('invite')
  async assign(@Body() { expiredAt }: CreateInviteDto) {
    return this.inviteService.createInvite(expiredAt);
  }
}
