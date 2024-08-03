import { Injectable } from '@nestjs/common';

import { isNumber } from 'lodash';

import { InputType, MedicalParameterType } from '@prisma/client';
import { XMLParser } from 'fast-xml-parser';

import { DatabaseService } from '../database/database.service';
import { YandexDiskService } from '../integration/yandex-disk.service';

import { appleWatchParser } from './apple-watch-parser';
import { MedicalParameterDto, MedicalParameterEditDto } from './dto';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AdmZip = require('adm-zip');

@Injectable()
export class MedicalParametersService {
  constructor(
    private databaseService: DatabaseService,
    private yandexDiskService: YandexDiskService,
  ) {}

  async addParameter(parameter: MedicalParameterDto, userId: string) {
    const createdParameter = await this.databaseService.medicalParameter.create({
      data: {
        ...parameter,
        userId,
      },
    });

    return createdParameter;
  }

  async editParameter(parameter: MedicalParameterEditDto, userId: string, parameterId: string) {
    const editedParameter = await this.databaseService.medicalParameter.update({
      where: { userId, id: parameterId },
      data: { ...parameter },
    });

    return editedParameter;
  }

  async addParameters(parameters: MedicalParameterDto[], userId: string, inputType?: InputType) {
    const createdParameters = await this.databaseService.medicalParameter.createMany({
      data: parameters.map((parameter) => ({ ...parameter, userId, ...(inputType && { inputType }) })),
    });

    return createdParameters;
  }

  async getParameters({
    userId,
    type,
    start_date,
    end_date,
    page,
    offset,
  }: {
    userId: string;
    type?: MedicalParameterType;
    start_date?: string;
    end_date?: string;
    page?: number;
    offset?: number;
  }) {
    const createdAt: { gte?: string; lte?: string } = {};
    if (start_date) createdAt.gte = start_date;
    if (end_date) createdAt.lte = end_date;

    const where = { userId, ...(type && { type }), ...(Object.values(createdAt).length && { createdAt }) };

    const hasPagination = isNumber(offset) && isNumber(page);

    if (!hasPagination) {
      return this.databaseService.medicalParameter.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    const [count, parameters] = await this.databaseService.$transaction([
      this.databaseService.medicalParameter.count({ where }),
      this.databaseService.medicalParameter.findMany({
        where,
        skip: offset * (page - 1),
        take: offset,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return { count, page, offset, parameters };
  }

  async getParameter({ userId, parameterId }: { userId: string; parameterId: string }) {
    const foundParameter = await this.databaseService.medicalParameter.findUnique({ where: { userId, id: parameterId } });

    return foundParameter;
  }

  async deleteParameter({ userId, parameterId }: { userId: string; parameterId: string }) {
    await this.databaseService.medicalParameter.delete({ where: { userId, id: parameterId } });
  }

  async importAppleWatchParameters(buffer: Buffer, userId: string) {
    const admZip = new AdmZip(buffer);
    const [entry] = admZip.getEntries();

    const parser = new XMLParser();
    const parsed = parser.parse(entry.getData());

    const dataJSON = JSON.stringify(parsed.data.row);

    const minDate = await this.databaseService.exportDateToUserMap.findFirst({ where: { userId } });

    const { result: parameters, maxDate } = appleWatchParser(dataJSON, minDate?.date);

    if (maxDate) {
      await this.databaseService.exportDateToUserMap.upsert({
        where: { userId },
        update: { date: maxDate },
        create: { userId, date: maxDate },
      });
    }

    if (!parameters.length) return [];

    return this.addParameters(parameters, userId, 'appleWatch');
  }

  async syncParametersWithYandexDisk(userId: string) {
    const { hasLink, isOutdated, actualDate } = await this.yandexDiskService.getMetadata(userId);

    if (!hasLink) return { error: 'Not found' as const };

    if (!isOutdated) return { status: 'notModified' as const, syncDate: actualDate };

    const buffer = await this.yandexDiskService.downloadFile(userId);

    if (!buffer) return { error: 'Not found' as const };

    const data = await this.importAppleWatchParameters(buffer, userId);

    if (actualDate) await this.yandexDiskService.updateSyncDate(userId, actualDate);

    return { status: 'synced' as const, data, syncDate: actualDate };
  }
}
