import pl from 'nodejs-polars';

import { MedicalParameterDto } from '../../dto';

export const massParser = (df: pl.DataFrame): MedicalParameterDto[] => {
  let massDf = df.filter(pl.col('type').isIn(['HKQuantityTypeIdentifierBodyMass']));
  massDf = massDf.withColumns(pl.col('type').str.replace('HKQuantityTypeIdentifierBodyMass', 'mass'));

  return massDf
    .select(pl.cols(['type', 'value', 'createdAt']))
    .toRecords()
    .map(({ value, ...record }) => ({ ...record, data: { value } })) as MedicalParameterDto[];
};
