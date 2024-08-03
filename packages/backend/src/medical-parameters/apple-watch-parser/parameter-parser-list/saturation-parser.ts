import pl from 'nodejs-polars';

import { MedicalParameterDto } from '../../dto';

export const saturationParser = (df: pl.DataFrame): MedicalParameterDto[] => {
  let saturationDf = df.filter(pl.col('type').isIn(['HKQuantityTypeIdentifierOxygenSaturation']));
  saturationDf = saturationDf.withColumns(pl.col('type').str.replace('HKQuantityTypeIdentifierOxygenSaturation', 'saturation'));

  return saturationDf
    .select(pl.cols(['type', 'value', 'createdAt']))
    .toRecords()
    .map(({ value, ...record }) => ({ ...record, data: { value: value * 100 } })) as MedicalParameterDto[];
};
