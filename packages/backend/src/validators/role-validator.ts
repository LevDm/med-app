import { isArray, isString } from 'lodash';

import { Role } from '@prisma/client';
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

const roles = new Set(['admin', 'doctor', 'user']) satisfies Set<Role>;

@ValidatorConstraint({ name: 'valid role', async: false })
export class IsValidRole implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return (isString(value) && roles.has(value as Role)) || (isArray(value) && value.every((value) => roles.has(value)));
  }

  defaultMessage() {
    return `($value) must be in (${[...roles].join(', ')})`;
  }
}
