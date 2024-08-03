import { isString } from 'lodash';

import { addDays, addHours, format, getDate, getHours } from 'date-fns';
import ruLocale from 'date-fns/locale/ru';

export function ensureDate<D extends Date | string | null | undefined>(date: D): D extends Date | string ? Date : null;
export function ensureDate(date: Date | string | null | undefined) {
  if (!date) return null;
  return isString(date) ? new Date(date) : date;
}

export const getFullName = ({ firstName, lastName }: { firstName?: string; lastName?: string } = {}) => {
  if (!firstName || !lastName) return '';

  return `${lastName} ${firstName}`;
};

export const dateFormat = (dateRange: string) => {
  if (dateRange === 'today') return 'HH:00';
  return dateRange === 'week' ? 'eeeeee' : 'd.M';
};

export const getKey = (date: Date, dateRange: string) => {
  if (dateRange === 'today') return getHours(date);
  return getDate(date); //key = date days count => not repeads for keys
};

type fillItem = {
  day: string;
  date: Date;
};

export const dateFilling = <T>(dateRange: string, dateRangeSegment: (Date | string)[], dayToValueMap: T) => {
  const fill: Record<string, fillItem | T> = {};

  let startDate = new Date(ensureDate(dateRangeSegment[0]));

  while (startDate <= ensureDate(dateRangeSegment[1])) {
    const fixedDate = startDate;

    const key = getKey(fixedDate, dateRange);

    const day = format(fixedDate, dateFormat(dateRange), { locale: ruLocale });

    fill[key] = {
      day: day,
      date: fixedDate,
    };

    startDate = dateRange == 'today' ? addHours(new Date(startDate), 1) : addDays(new Date(startDate), 1);
  }

  const result: T = { ...fill, ...dayToValueMap };
  return result;
};
