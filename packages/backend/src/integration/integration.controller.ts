import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AccessGuard } from '../auth/guards';
import { Roles, RolesGuard } from '../roles';

import { AddSyncLinkDto } from './dto';
import { YandexDiskService } from './yandex-disk.service';

@ApiTags('integration')
@Controller()
export class IntegrationController {
  constructor(private yandexDiskService: YandexDiskService) {}

  @ApiOperation({ summary: 'Get link to the parameter storage' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @Roles('user')
  @UseGuards(AccessGuard, RolesGuard)
  @Get(':userId/integration')
  async getSyncLink(@Param('userId') userId: string) {
    const syncLink = await this.yandexDiskService.getSyncLink(userId);
    return { shareLink: syncLink?.shareLink ?? null };
  }

  @ApiOperation({ summary: 'Add link to the parameter storage' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @Roles('user')
  @UseGuards(AccessGuard, RolesGuard)
  @Post(':userId/integration')
  async addSyncLink(@Body() { shareLink }: AddSyncLinkDto, @Param('userId') userId: string) {
    return this.yandexDiskService.addSyncLink({ userId, shareLink });
  }

  @ApiOperation({ summary: 'Update link to the parameter storage' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @Roles('user')
  @UseGuards(AccessGuard, RolesGuard)
  @Put(':userId/integration')
  async updateSyncLink(@Body() { shareLink }: AddSyncLinkDto, @Param('userId') userId: string) {
    return this.yandexDiskService.updateSyncLink({ userId, shareLink });
  }

  @ApiOperation({ summary: 'Delete link to the parameter storage' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @Roles('user')
  @UseGuards(AccessGuard, RolesGuard)
  @Delete(':userId/integration')
  async deleteSyncLink(@Param('userId') userId: string) {
    return this.yandexDiskService.deleteSyncLink(userId);
  }
}
