import { Injectable } from '@nestjs/common';

import { orderBy } from 'lodash';

import { DatabaseService } from '../database/database.service';

@Injectable()
export class UserMappingService {
  constructor(private databaseService: DatabaseService) {}

  private async minDocID() {
    const doctors = await this.databaseService.user.findMany({
      where: { role: 'doctor' },
      include: {
        _count: {
          select: { UserToDoctorMapDoctor: true },
        },
      },
    });

    const ordered = orderBy(doctors, '_count.UserToDoctorMapDoctor', 'asc');
    const [first] = ordered;
    return first?.id;
  }

  async assignUserToDoctor({ userId, doctorId }: { userId: string; doctorId: string }) {
    const newMap = await this.databaseService.userToDoctorMap.create({
      data: {
        userId,
        doctorId,
      },
    });

    return newMap;
  }

  async reassignUserToDoctor({ userId, doctorId }: { userId: string; doctorId: string }) {
    await this.databaseService.userToDoctorMap.deleteMany({
      where: {
        userId: userId,
      },
    });

    return this.assignUserToDoctor({ userId, doctorId });
  }

  async assignUserToFirstAvailableDoctor(userId: string) {
    const doctorId = await this.minDocID();

    if (doctorId) {
      const newMap = this.assignUserToDoctor({ userId, doctorId });
      return newMap;
    }
  }

  async isUserAssignedToDoctor({ userId, doctorId }: { userId: string; doctorId: string }) {
    const doctorToUserMap = await this.databaseService.userToDoctorMap.findFirst({ where: { doctorId, userId } });

    return !!doctorToUserMap;
  }
}
