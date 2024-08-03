import pl from 'nodejs-polars';

import { MedicalParameterDto } from '../../dto';

export const sleepParser = (df: pl.DataFrame): MedicalParameterDto[] => {
  const sleepDf = df.filter(pl.col('type').isIn(['HKCategoryTypeIdentifierSleepAnalysis']));

  const result: MedicalParameterDto[] = [];

  for (const endDate of sleepDf.getColumn('createdAt').unique()) {
    const _df = sleepDf.filter(pl.col('createdAt').isIn([endDate]));
    const startDate = new Date(_df.getColumn('startDate').min());

    result.push({ type: 'sleep', createdAt: endDate, data: { startDate, endDate } });
  }

  return result;
};
