import pl from 'nodejs-polars';

import { MedicalParameterDto } from '../../dto';

export const pulseParser = (df: pl.DataFrame): MedicalParameterDto[] => {
  let pulseDf = df.filter(pl.col('type').isIn(['HKQuantityTypeIdentifierHeartRate']));
  pulseDf = pulseDf.withColumns(pl.col('type').str.replace('HKQuantityTypeIdentifierHeartRate', 'pulse'));

  return pulseDf
    .select(pl.cols(['type', 'value', 'createdAt']))
    .toRecords()
    .map(({ value, ...record }) => ({ ...record, data: { value } })) as MedicalParameterDto[];
};
