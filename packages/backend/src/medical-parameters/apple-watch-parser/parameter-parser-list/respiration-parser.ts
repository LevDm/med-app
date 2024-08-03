import pl from 'nodejs-polars';

import { MedicalParameterDto } from '../../dto';

export const respirationParser = (df: pl.DataFrame): MedicalParameterDto[] => {
  let respirationDf = df.filter(pl.col('type').isIn(['HKQuantityTypeIdentifierRespiratoryRate']));
  respirationDf = respirationDf.withColumns(pl.col('type').str.replace('HKQuantityTypeIdentifierRespiratoryRate', 'respiration'));

  return respirationDf
    .select(pl.cols(['type', 'value', 'createdAt']))
    .toRecords()
    .map(({ value, ...record }) => ({ ...record, data: { value } })) as MedicalParameterDto[];
};
