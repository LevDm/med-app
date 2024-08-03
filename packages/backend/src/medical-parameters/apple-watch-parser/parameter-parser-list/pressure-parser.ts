import pl from 'nodejs-polars';

import { MedicalParameterDto } from '../../dto';

export const pressureParser = (df: pl.DataFrame): MedicalParameterDto[] => {
  const pressureDiaDf = df.filter(pl.col('type').isIn(['HKQuantityTypeIdentifierBloodPressureDiastolic']));
  const pressureSysDf = df.filter(pl.col('type').isIn(['HKQuantityTypeIdentifierBloodPressureSystolic']));

  const result: MedicalParameterDto[] = [];

  for (const date of pressureDiaDf.getColumn('createdAt').unique()) {
    const sys = pressureSysDf.filter(pl.col('createdAt').isIn([date])).getColumn('value')[0];
    const dia = pressureDiaDf.filter(pl.col('createdAt').isIn([date])).getColumn('value')[0];

    result.push({ type: 'pressure', createdAt: date, data: { dia, sys } });
  }

  return result;
};
