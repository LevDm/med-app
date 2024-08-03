import pl from 'nodejs-polars';

import { MedicalParameterDto } from '../../dto';

export const temperatureParser = (df: pl.DataFrame): MedicalParameterDto[] => {
  let temperatureDf = df.filter(pl.col('type').isIn(['HKQuantityTypeIdentifierBodyTemperature']));
  temperatureDf = temperatureDf.withColumns(pl.col('type').str.replace('HKQuantityTypeIdentifierBodyTemperature', 'temperature'));

  return temperatureDf
    .select(pl.cols(['type', 'value', 'createdAt']))
    .toRecords()
    .map(({ value, ...record }) => ({ ...record, data: { value } })) as MedicalParameterDto[];
};
