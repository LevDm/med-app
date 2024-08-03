import { MedicalParameterType } from '@prisma/client';
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

const set = new Set<MedicalParameterType>([
  'pulse',
  'steps',
  'sleep',
  'saturation',
  'respiration',
  'pressure',
  'mass',
  'temperature',
  'workout',
  'form',
]);

@ValidatorConstraint({ name: 'parameterType', async: false })
export class ParameterType implements ValidatorConstraintInterface {
  validate(value: any) {
    return set.has(value);
  }

  defaultMessage() {
    return `Type ($value) should be in (${[...set].join(', ')})`;
  }
}
