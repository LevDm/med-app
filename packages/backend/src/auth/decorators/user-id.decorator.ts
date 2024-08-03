import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { JwtPayload } from '../types';

export const GetUserId = createParamDecorator((_: undefined, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  const user = request.user as JwtPayload;

  return user.id;
});
