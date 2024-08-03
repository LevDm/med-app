import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { isNumber, isString, omit } from 'lodash';

import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { DatabaseService } from '../database/database.service';
import { InviteService } from '../invite/invite.service';
import { UserMappingService } from '../user-mapping/user-mapping.service';
import { UserSearchService } from '../user-search/user-search.service';

import { CreateUserDto, SearchUserDto } from './dto';

export class EmailConstraintError extends Error {
  constructor() {
    super('Account with this email already exists');
  }
}

@Injectable()
export class UserService {
  private salt: number;

  constructor(
    private databaseService: DatabaseService,
    private userSearchService: UserSearchService,
    private userMappingService: UserMappingService,
    private inviteService: InviteService,
    configService: ConfigService,
  ) {
    this.salt = Number(configService.get('BCRYPT_SALT'));
  }

  getUsers() {
    return this.databaseService.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
  }

  async createUser({ inviteId, ...userData }: CreateUserDto) {
    if (userData.role === 'doctor' && !inviteId) {
      throw new BadRequestException('inviteId should be provided');
    }

    if (userData.role === 'doctor' && inviteId) {
      if (await this.inviteService.isValidInvite(inviteId)) {
        await this.inviteService.invalidateInvite(inviteId);
      } else {
        throw new BadRequestException('Invalid inviteId');
      }
    }

    try {
      const hash = await bcrypt.hash(userData.password, this.salt);
      const user = await this.databaseService.user.create({
        data: {
          ...userData,
          password: hash,
        },
      });

      await Promise.all([
        this.userSearchService.indexUser(user),
        ...(user.role === 'user' ? [this.userMappingService.assignUserToFirstAvailableDoctor(user.id)] : []),
      ]);

      return user;
    } catch (error) {
      Logger.error(error);
      throw new EmailConstraintError();
    }
  }

  async getUserByEmail(email: string) {
    return await this.databaseService.user.findUniqueOrThrow({
      where: {
        email,
      },
    });
  }

  async findUser({ page, offset, search, role, doctorId }: SearchUserDto) {
    let userIds: null | string[] = null;

    if (search) {
      userIds = await this.userSearchService.search(search);
    }

    const select = {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      deactivated: true,
      gender: true,
      role: true,
      UserToDoctorMapDoctor: {
        select: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              deactivated: true,
              gender: true,
              role: true,
            },
          },
        },
      },
      UserToDoctorMapUser: {
        select: {
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              deactivated: true,
              gender: true,
              role: true,
            },
          },
        },
      },
      MessageToUser: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
      _count: {
        select: {
          MessageFromUser: {
            where: {
              read: {
                equals: false,
              },
            },
          },
        },
      },
    } as const;

    const where = {
      ...(userIds && { id: { in: userIds } }),
      ...(role && { role: { in: isString(role) ? [role] : role } }),
      ...(doctorId && {
        UserToDoctorMapUser: {
          some: {},
          every: {
            doctorId: {
              equals: doctorId,
            },
          },
        },
      }),
    };

    const hasPagination = isNumber(offset) && isNumber(page);

    if (!hasPagination) {
      const items = await this.databaseService.user.findMany({
        ...(where && { where }),
        select,
      });

      return items.map((item) => transformUserSearch(item));
    }

    const [count, items] = await this.databaseService.$transaction([
      this.databaseService.user.count({ ...(where && { where }) }),
      this.databaseService.user.findMany({
        ...(where && { where }),
        skip: offset * (page - 1),
        take: offset,
        select,
      }),
    ]);

    return { count, items: items.map((item) => transformUserSearch(item)) };
  }

  async changeUserData(userId: string, newFirstName?: string, newLastName?: string, newEmail?: string) {
    const editedUserData = await this.databaseService.user.update({
      where: { id: userId },
      data: {
        firstName: newFirstName,
        lastName: newLastName,
        email: newEmail,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        deactivated: true,
        gender: true,
        role: true,
      },
    });

    return editedUserData;
  }

  async deactivateUser(userId: string, deactivated: boolean) {
    const deactivatedUser = await this.databaseService.user.update({
      where: { id: userId },
      data: {
        deactivated: deactivated,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        deactivated: true,
        gender: true,
        role: true,
      },
    });

    return deactivatedUser;
  }

  async getUser(userId: string) {
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        deactivated: true,
        gender: true,
        role: true,
        UserToDoctorMapUser: {
          select: {
            doctor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return { ...omit(user, 'UserToDoctorMapDoctor'), doctor: user?.UserToDoctorMapUser?.[0]?.doctor ?? null };
  }
}

function transformUserSearch<
  T extends {
    UserToDoctorMapDoctor: { user: Partial<User> }[];
    UserToDoctorMapUser: { doctor: Partial<User> }[];
    MessageToUser: { createdAt: Date }[];
    _count: { MessageFromUser: number };
  },
>({ UserToDoctorMapDoctor, UserToDoctorMapUser, _count, MessageToUser, ...rest }: T) {
  const [doctor] = UserToDoctorMapUser;
  const [lastMessage] = MessageToUser;

  return {
    ...rest,
    users: UserToDoctorMapDoctor.map(({ user }) => user),
    doctor: doctor?.doctor ?? null,
    unreadMessageCount: _count.MessageFromUser,
    lastCheckDate: lastMessage?.createdAt ?? null,
  };
}
