import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Role, User } from '@prisma/client';

import { UserMappingService } from '../user-mapping/user-mapping.service';

import { ROLE_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(UserMappingService) private userMappingService: UserMappingService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [context.getHandler(), context.getClass()]);

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: User; params?: { userId?: string } }>();
    const { role, id: userId } = request.user;
    const { userId: requestedUserId } = request.params ?? {};

    if (role === 'admin') {
      return true;
    }

    if (!roles.includes(role)) {
      return false;
    }

    if (role === 'user' && requestedUserId) {
      return userId === requestedUserId;
    }

    if (role === 'doctor' && requestedUserId) {
      return this.userMappingService.isUserAssignedToDoctor({ userId: requestedUserId, doctorId: userId });
    }

    return true;
  }
}
