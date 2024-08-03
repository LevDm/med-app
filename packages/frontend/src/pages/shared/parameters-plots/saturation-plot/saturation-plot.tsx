import { useMemo } from 'react';

import { floor, isString, isUndefined, maxBy, mean, meanBy, minBy, orderBy, round } from 'lodash';

import { Typography } from '@mui/material';

import { format } from 'date-fns';
import ruLocale from 'date-fns/locale/ru';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { makeStyles } from 'tss-react/mui';

import { SaturationParameter } from '../../../../api';
import { dateFilling, dateFormat, getKey } from '../../../../utils';

import { CustomTooltip } from './custom-tooltip';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 'auto',
    flexGrow: 1,
  },
  header: {
    marginBottom: theme.spacing(1.5),
    flexDirection: 'column',
  },
  stepCount: {
    marginBottom: theme.spacing(0.5),
  },
}));

const SATURATION_COLORS = {
  referenceLine: '#088',
  area: '#00cccc',
};

type SaturationPlotProps = {
  parameters: SaturationParameter[];
  dateRange: 'today' | 'week' | 'month';
  dateRangeSegment: Date[];
  syncId?: string;
  height?: number;
};

type ParameterItem = Record<string, { day: string; value?: number[]; date: Date }>;

export const SaturationPlot = ({ parameters, dateRange, dateRangeSegment, syncId, height = 300 }: SaturationPlotProps) => {
  const data = useMemo(() => {
    const dayToValueMap = parameters.reduce<ParameterItem>((result, { data: { value }, createdAt }) => {
      if (!createdAt) return result;

      const date = isString(createdAt) ? new Date(createdAt) : createdAt;
      const key = getKey(date, dateRange);

      if (!isUndefined(result[key])) {
        result[key].value?.push(value);
      } else {
        const day = format(date, dateFormat(dateRange), { locale: ruLocale });
        result[key] = { value: [value], day, date };
      }

      return result;
    }, {});

    const fillig = dateFilling(dateRange, dateRangeSegment, dayToValueMap);

    return orderBy(Object.values(fillig), ({ date }) => date).map(({ day, value }) => ({
      day,
      ...(isUndefined(value) ? {} : { saturation: round(mean(value), 1) }),
    }));
  }, [dateRange, parameters]);

  const { classes } = useStyles();

  const { maxValue, minValue, meanValue } = useMemo(() => {
    return {
      maxValue: (maxBy(data, (item) => item.saturation)?.saturation ?? 0).toFixed(1),
      minValue: (minBy(data, (item) => item.saturation)?.saturation ?? 0).toFixed(1),
      meanValue: meanBy(
        data.filter(({ saturation }) => !isUndefined(saturation)),
        (item) => item.saturation,
      ).toFixed(1),
    };
  }, [data]);

  return (
    <div className={classes.root} style={{ ...(isUndefined(syncId) ? {} : { alignItems: 'flex-end' }) }}>
      <header className={classes.header} style={{ ...(isUndefined(syncId) ? {} : { width: '80%' }) }}>
        <Typography fontWeight={500} variant="body2">
          {`Максимум: ${maxValue} %`}
        </Typography>
        <Typography fontWeight={500} variant="body2">
          {`Минимум: ${minValue} %`}
        </Typography>
      </header>
      <ResponsiveContainer width="99%" height={height}>
        <AreaChart syncId={syncId} data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fillGraph" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={SATURATION_COLORS.area} stopOpacity={1} />
              <stop offset="95%" stopColor={SATURATION_COLORS.area} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" />
          <YAxis
            domain={[(dataMin: number) => floor((dataMin - 1) / 10) * 10, 100]}
            tickFormatter={(value: number) => value.toFixed(1)}
            orientation="right"
            axisLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip valueName=" %" />} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Area
            connectNulls
            type="monotone"
            dataKey="saturation"
            stroke={SATURATION_COLORS.area}
            fillOpacity={0.5}
            fill="url(#fillGraph)"
          />
          <ReferenceLine
            y={meanValue}
            stroke={SATURATION_COLORS.referenceLine}
            strokeDasharray="4 4"
            label={{ value: meanValue, position: 'insideRight' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
