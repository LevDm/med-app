import pl from 'nodejs-polars';

import { MedicalParameterDto } from '../../dto';

export const stepsParser = (df: pl.DataFrame): MedicalParameterDto[] => {
  const stepsDf = df.filter(pl.col('type').isIn(['HKQuantityTypeIdentifierStepCount']));
  const result: MedicalParameterDto[] = [];

  for (const date of stepsDf.getColumn('endDate')) {
    const row = stepsDf.filter(pl.col('endDate').isIn([date]));
    if (JSON.parse(row.select(pl.col('device')).toJSON()).columns[0].values[0].split(', ')[3] == 'model:Watch') {
      const value = row.getColumn('value')[0];
      result.push({ type: 'steps', createdAt: date, data: { value } });
    }
  }

  return result;
};
