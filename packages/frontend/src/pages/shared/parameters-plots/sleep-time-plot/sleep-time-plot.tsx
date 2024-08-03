import { useMemo, useState } from 'react';

import { floor, isString, isUndefined, map, meanBy, orderBy, round, split, sum } from 'lodash';

import { Typography, useTheme } from '@mui/material';

import { format } from 'date-fns';
import ruLocale from 'date-fns/locale/ru';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { makeStyles } from 'tss-react/mui';

import { SleepParameter } from '../../../../api';
import { dateFilling, dateFormat, ensureDate, getKey } from '../../../../utils';

import { CustomTooltip } from './custom-tooltip';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 'auto',
  },
  header: {
    marginBottom: theme.spacing(1.5),
    flexDirection: 'column',
    display: 'flex',
  },
  headerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
}));

const SLEEP_COLORS = {
  referenceLine: '#000',
  columns: '#44bb44a7',
  selectColumn: '#66bb66a7',
};

const timeToNumber = (time: string, timeZoneOffset: number = 0, isCurrentDay: boolean = true) => {
  const dateSum = isCurrentDay ? 0 : 1440; // = 1440 if next day || 0 if current day
  const timeSum = sum(map(split(time, ':'), (value: string, index: number) => Number(value) * [60, 1, 0][index]));
  return dateSum + timeSum + -timeZoneOffset;
};

const convertDate = (date: Date | string) => {
  return isString(date) ? date : date.toISOString();
};

const formatData = (dates: string[], timeZoneOffset: number = 0) => {
  const isCurrentDay = split(dates[0], 'T')[0] === split(dates[1], 'T')[0];
  const times = dates.map((dateTime, index) => {
    const divide = split(dateTime, 'T');
    const divideDateTime = [divide[0], split(divide[1], '.')[0]];
    return timeToNumber(divideDateTime[1], timeZoneOffset, isCurrentDay ? isCurrentDay : index === 0);
  });

  const durations = map(times, (time: number) => time - 1440);

  return {
    times: times,
    duration: Math.abs(durations[1] - durations[0]),
  };
};

const numberToTime = (minutes: number) => {
  if (minutes < 0) return '-';
  const dayTime = minutes % 1440;
  const time = `${floor(dayTime / 60)}`.padStart(2, '0') + ':' + `${dayTime % 60}`.padStart(2, '0');
  return time;
};

type SleepPlotProps = {
  parameters: SleepParameter[];
  dateRange: 'today' | 'week' | 'month';
  dateRangeSegment: Date[];
  syncId?: string;
  height?: number;
};

type ParameterItem = Record<string, { day: string; value?: { times: number[]; duration: number }; date: Date }>;

export const SleepTimePlot = ({ parameters, dateRange, dateRangeSegment, syncId, height = 300 }: SleepPlotProps) => {
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleClick = (_: unknown, index: number) => setActiveIndex(index === activeIndex ? -1 : index);

  const theme = useTheme();

  const { classes } = useStyles();

  const data = useMemo(() => {
    const dayToValueMap = parameters.reduce<ParameterItem>((result, { data: { startDate, endDate }, createdAt }) => {
      if (!createdAt) return result;

      const numberFromDate = formatData([convertDate(startDate), convertDate(endDate)], new Date(createdAt).getTimezoneOffset());

      const date = ensureDate(createdAt);
      const key = getKey(date, dateRange);

      if (!isUndefined(result[key])) {
        result[key].value = numberFromDate;
      } else {
        const day = format(date, dateFormat(dateRange), { locale: ruLocale });
        result[key] = { value: numberFromDate, day, date };
      }

      return result;
    }, {});

    const fillig = dateFilling(dateRange, dateRangeSegment, dayToValueMap);

    return orderBy(Object.values(fillig), ({ date }) => date).map(({ day, value }) => ({
      day: day,
      ...(isUndefined(value)
        ? {}
        : {
            times: value.times,
            duration: value.duration,
          }),
    }));
  }, [dateRange, parameters]);

  const { meanStart, meanFinish, meanDuration } = useMemo(() => {
    const notData = [-1, -1];
    if (activeIndex >= 0) {
      //изменить подписи для кликнутого периода вместо текущего периода
      return {
        meanStart: numberToTime((data[activeIndex].times ?? notData)[0]),
        meanFinish: numberToTime((data[activeIndex].times ?? notData)[1]),
        meanDuration: numberToTime(data[activeIndex].duration ?? -1),
      };
    }

    return {
      meanStart: numberToTime(
        round(
          meanBy(
            data.filter(({ times }) => !isUndefined(times)),
            (item) => (item.times ?? notData)[0],
          ),
        ),
      ),
      meanFinish: numberToTime(
        round(
          meanBy(
            data.filter(({ times }) => !isUndefined(times)),
            (item) => (item.times ?? notData)[1],
          ),
        ),
      ),
      meanDuration: numberToTime(
        round(
          meanBy(
            data.filter(({ duration }) => !isUndefined(duration)),
            (item) => item.duration ?? -1,
          ),
        ),
      ),
    };
  }, [data, activeIndex]);

  return (
    <div className={classes.root} style={{ ...(isUndefined(syncId) ? {} : { alignItems: 'flex-end' }) }}>
      <header className={classes.header} style={{ ...(isUndefined(syncId) ? {} : { width: '80%' }) }}>
        <Typography fontWeight={500} variant="body1">
          {`${activeIndex < 0 ? 'Средняя продолжительность сна' : 'Продолжительность сна'}: ${meanDuration}`}
        </Typography>
        <div className={classes.headerGrid}>
          <span>
            <Typography component="span" variant="body2">
              {activeIndex < 0 ? 'Среднее время пробуждения' : 'Время пробуждения'}:
            </Typography>
            <Typography component="span" fontWeight={500} variant="body2">
              {meanFinish}
            </Typography>
          </span>
          <span>
            <Typography component="span" variant="body2">
              {activeIndex < 0 ? 'Среднее время начала сна' : 'Время начала сна'}:
            </Typography>
            <Typography component="span" fontWeight={500} variant="body2">
              {meanStart}
            </Typography>
          </span>
        </div>
      </header>
      <ResponsiveContainer width="99%" height={height}>
        <BarChart syncId={syncId} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis
            reversed
            domain={[(dataMin: number) => floor(dataMin / 60 - 1) * 60, (dataMax: number) => round(dataMax / 60 + 1) * 60]}
            tickFormatter={(value: number) => numberToTime(value)}
            tickCount={14}
            orientation="right"
            axisLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip numberToTime={numberToTime} />} />
          <Bar dataKey="times" onClick={handleClick} radius={8}>
            {data.map((_, index) => (
              <Cell
                cursor="pointer"
                fill={
                  activeIndex >= 0
                    ? index === activeIndex
                      ? SLEEP_COLORS.selectColumn
                      : theme.palette.action.disabled
                    : SLEEP_COLORS.columns
                }
                key={`cell-${index}`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
