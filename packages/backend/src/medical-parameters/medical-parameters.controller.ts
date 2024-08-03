import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AccessGuard } from '../auth/guards';
import { Roles, RolesGuard } from '../roles';

import { GetParameterDto, MedicalParameterDto, MedicalParameterEditDto } from './dto';
import { MedicalParametersService } from './medical-parameters.service';

@ApiTags('medical-parameters')
@Controller()
export class MedicalParametersController {
  constructor(private medicalParametersService: MedicalParametersService) {}

  @ApiOperation({ summary: 'Add single medical parameters by user id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @Roles('user')
  @UseGuards(AccessGuard, RolesGuard)
  @Post(':userId/medical-parameters')
  async addParameter(@Body() parameter: MedicalParameterDto, @Param('userId') userId: string) {
    return await this.medicalParametersService.addParameter(parameter, userId);
  }

  @ApiOperation({ summary: 'Get list of medical parameters by user id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiQuery({ name: 'type', required: false, type: 'string' })
  @ApiQuery({ name: 'start_date', required: false, type: 'string' })
  @ApiQuery({ name: 'end_date', required: false, type: 'string' })
  @ApiQuery({ name: 'page', required: false, type: 'number' })
  @ApiQuery({ name: 'offset', required: false, type: 'number' })
  @ApiBearerAuth('Authorization')
  @Roles('user', 'doctor')
  @UseGuards(AccessGuard, RolesGuard)
  @Get(':userId/medical-parameters')
  async getParameters(
    @Param('userId') userId: string,
    @Query(
      new ValidationPipe({ transform: true, transformOptions: { enableImplicitConversion: true }, forbidNonWhitelisted: true }),
    )
    { page, offset, type, start_date, end_date }: GetParameterDto,
  ) {
    return await this.medicalParametersService.getParameters({ userId, type, start_date, end_date, page, offset });
  }

  @ApiOperation({ summary: 'Get single medical parameters by user id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @Roles('user', 'doctor')
  @UseGuards(AccessGuard, RolesGuard)
  @Get(':userId/medical-parameters/:parameterId')
  async getParameter(@Param('userId') userId: string, @Param('parameterId') parameterId: string) {
    return await this.medicalParametersService.getParameter({ userId, parameterId });
  }

  @ApiOperation({ summary: 'Edit single medical parameters by user id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @Roles('user')
  @UseGuards(AccessGuard, RolesGuard)
  @Put(':userId/medical-parameters/:parameterId')
  async editParameter(
    @Body() parameter: MedicalParameterEditDto,
    @Param('userId') userId: string,
    @Param('parameterId') parameterId: string,
  ) {
    return await this.medicalParametersService.editParameter(parameter, userId, parameterId);
  }

  @ApiOperation({ summary: 'Delete single medical parameters by user id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @Roles('user')
  @UseGuards(AccessGuard, RolesGuard)
  @Delete(':userId/medical-parameters/:parameterId')
  async deleteParameter(@Param('userId') userId: string, @Param('parameterId') parameterId: string) {
    await this.medicalParametersService.deleteParameter({ userId, parameterId });
  }

  @ApiOperation({ summary: 'Import medical parameters from file' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('Authorization')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        userId: {
          type: 'string',
        },
      },
    },
  })
  @Roles('user')
  @UseGuards(AccessGuard)
  @Post(':userId/medical-parameters/import')
  @UseInterceptors(FileInterceptor('file'))
  async import(@UploadedFile() file: Express.Multer.File, @Param('userId') userId: string) {
    return this.medicalParametersService.importAppleWatchParameters(file.buffer, userId);
  }

  @ApiOperation({ summary: 'Sync medical parameters by user id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @Roles('user')
  @UseGuards(AccessGuard, RolesGuard)
  @Post(':userId/medical-parameters/sync')
  async syncParameters(@Param('userId') userId: string) {
    const result = await this.medicalParametersService.syncParametersWithYandexDisk(userId);

    if (result.error === 'Not found') throw new NotFoundException();

    return result;
  }
}

@ApiTags('medical-parameters-collection')
@Controller()
export class MedicalParametersCollectionController {
  constructor(private medicalParametersService: MedicalParametersService) {}

  @ApiOperation({ summary: 'Add multiple medical parameters by user id' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @Roles('user')
  @UseGuards(AccessGuard, RolesGuard)
  @Post(':userId/medical-parameters-collection')
  async add(@Body() parameters: MedicalParameterDto[], @Param('userId') userId: string) {
    return await this.medicalParametersService.addParameters(parameters, userId);
  }
}
