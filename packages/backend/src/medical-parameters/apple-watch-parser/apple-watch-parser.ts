import { parse } from 'date-fns';
import pl, { DataType } from 'nodejs-polars';

import { MedicalParameterDto } from '../dto';

import { parsers } from './parameter-parser-list';

const convertColumToDate = (series: pl.Series) => {
  const convertDate = (date: string) => parse(date, 'yyyy-MM-dd HH:mm:ss xx', new Date()).getTime();

  return pl.Series(series.toArray().map(convertDate)).cast(DataType.Datetime('ms'));
};

export const appleWatchParser = (dataJSON: string, minDate: Date | undefined) => {
  let df = pl.readJSON(dataJSON);

  df = df.withColumn(convertColumToDate(df.getColumn('creationDate')).as('createdAt'));
  df = df.withColumn(convertColumToDate(df.getColumn('startDate')).as('startDate'));
  df = df.withColumn(convertColumToDate(df.getColumn('endDate')).as('endDate'));
  df == df.withColumn(convertColumToDate(df.getColumn('endDate')).as('endDate'));

  if (minDate) {
    df = df.filter(pl.col('createdAt').greaterThan(minDate)).sort('startDate', false);
  }

  if (!df.height) return { result: [], maxDate: null };

  const maxDate = new Date(df.getColumn('createdAt').max());

  const result: MedicalParameterDto[] = [];

  for (const parser of parsers) {
    result.push(...parser(df));
  }

  return { result, maxDate };
};
