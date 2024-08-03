import { useMemo } from 'react';

import { floor, isUndefined, maxBy, mean, meanBy, minBy, orderBy } from 'lodash';

import { Typography } from '@mui/material';

import { format } from 'date-fns';
import ruLocale from 'date-fns/locale/ru';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { makeStyles } from 'tss-react/mui';

import { MassParameter } from '../../../../api';
import { dateFilling, dateFormat, ensureDate, getKey } from '../../../../utils';

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

const MASS_COLORS = {
  line: '#000',
  area: '#ff8800',
};

type MassPlotProps = {
  parameters: MassParameter[];
  dateRange: 'today' | 'week' | 'month';
  dateRangeSegment: Date[];
  syncId?: string;
  height?: number;
};

type ParameterItem = Record<string, { day: string; value?: number[]; date: Date }>;

export const BodyMassPlot = ({ parameters, dateRange, dateRangeSegment, syncId, height = 300 }: MassPlotProps) => {
  const data = useMemo(() => {
    const dayToValueMap = parameters.reduce<ParameterItem>((result, { data: { value }, createdAt }) => {
      if (!createdAt) return result;

      const date = ensureDate(createdAt);
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
      ...(isUndefined(value) ? {} : { mass: mean(value) }),
    }));
  }, [dateRange, parameters]);

  const { classes } = useStyles();

  const { maxValue, minValue, meanValue } = useMemo(() => {
    return {
      maxValue: (maxBy(data, (item) => item.mass)?.mass ?? 0).toFixed(1),
      minValue: (minBy(data, (item) => item.mass)?.mass ?? 0).toFixed(1),
      meanValue: meanBy(
        data.filter(({ mass }) => !isUndefined(mass)),
        (item) => item.mass,
      ).toFixed(1),
    };
  }, [data]);

  return (
    <div className={classes.root} style={{ ...(isUndefined(syncId) ? {} : { alignItems: 'flex-end' }) }}>
      <header className={classes.header} style={{ ...(isUndefined(syncId) ? {} : { width: '80%' }) }}>
        <Typography fontWeight={500} variant="body2">
          {`Максимум: ${maxValue} Кг.`}
        </Typography>
        <Typography fontWeight={500} variant="body2">
          {`Минимум: ${minValue} Кг.`}
        </Typography>
      </header>
      <ResponsiveContainer width="99%" height={height}>
        <AreaChart syncId={syncId} data={data}>
          <defs>
            <linearGradient id="gradientFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={MASS_COLORS.area} stopOpacity={1} />
              <stop offset="95%" stopColor={MASS_COLORS.area} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis
            domain={[(dataMin: number) => floor(dataMin - 0.1), (dataMax: number) => floor(dataMax) + 1]}
            tickFormatter={(value: number) => value.toFixed(1)}
            orientation="right"
            axisLine={false}
            width={50}
          />
          <Area
            connectNulls
            type="monotone"
            dataKey="mass"
            stroke={MASS_COLORS.area}
            fillOpacity={0.5}
            fill="url(#gradientFill)"
          />
          <Tooltip content={<CustomTooltip valueName=" Кг." />} />
          <ReferenceLine
            y={meanValue}
            stroke={MASS_COLORS.line}
            strokeDasharray="4 4"
            label={{ value: meanValue, position: 'insideRight' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
