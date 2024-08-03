import { useMemo } from 'react';

import { floor, isUndefined, maxBy, meanBy, minBy, orderBy, round } from 'lodash';

import { Typography } from '@mui/material';

import { format } from 'date-fns';
import ruLocale from 'date-fns/locale/ru';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { makeStyles } from 'tss-react/mui';

import { PressureParameter } from '../../../../api';
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
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    paddingLeft: theme.spacing(2.5),
  },
  chartWrap: {
    marginTop: 'auto',
  },
}));

type PressurePlotProps = {
  parameters: PressureParameter[];
  dateRange: 'today' | 'week' | 'month';
  dateRangeSegment: Date[];
  syncId?: string;
  height?: number;
};

const PRESSURE_COLORS = {
  sysArea: '#FF0000',
  sysLine: '#800',
  diaArea: '#ff8800',
  diaLine: '#840',
};

type ParameterItem = Record<string, { day: string; value?: { sys: number; dia: number }[]; date: Date }>;

export const PressurePlot = ({ parameters, dateRange, dateRangeSegment, syncId, height = 300 }: PressurePlotProps) => {
  const { classes } = useStyles();

  const data = useMemo(() => {
    const dayToValueMap = parameters.reduce<ParameterItem>((result, { data: { sys, dia }, createdAt }) => {
      if (!createdAt) return result;

      const date = ensureDate(createdAt);
      const key = getKey(date, dateRange);

      if (!isUndefined(result[key])) {
        result[key].value?.push({ sys: sys, dia: dia });
      } else {
        const day = format(date, dateFormat(dateRange), { locale: ruLocale });
        result[key] = { value: [{ sys: sys, dia: dia }], day, date };
      }

      return result;
    }, {});

    const fillig = dateFilling(dateRange, dateRangeSegment, dayToValueMap);

    return orderBy(Object.values(fillig), ({ date }) => date).map(({ day, value }) => ({
      day,
      ...(isUndefined(value)
        ? {}
        : {
            sys: round(meanBy(value, (item) => item.sys)),
            dia: round(meanBy(value, (item) => item.dia)),
          }),
    }));
  }, [dateRange, parameters]);

  const { minPressure, maxPressure, meanPressure } = useMemo(() => {
    return {
      minPressure: {
        sys: round(minBy(data, ({ sys }) => sys)?.sys ?? 0),
        dia: round(minBy(data, ({ dia }) => dia)?.dia ?? 0),
      },
      maxPressure: {
        sys: round(maxBy(data, ({ sys }) => sys)?.sys ?? 0),
        dia: round(maxBy(data, ({ dia }) => dia)?.dia ?? 0),
      },
      meanPressure: {
        sys: round(
          meanBy(
            data.filter(({ sys }) => !isUndefined(sys)),
            ({ sys }) => sys,
          ),
        ),
        dia: round(
          meanBy(
            data.filter(({ dia }) => !isUndefined(dia)),
            ({ dia }) => dia,
          ),
        ),
      },
    };
  }, [data]);

  return (
    <div className={classes.root} style={{ ...(isUndefined(syncId) ? {} : { alignItems: 'flex-end' }) }}>
      <header className={classes.header} style={{ ...(isUndefined(syncId) ? {} : { width: '80%' }) }}>
        <Typography fontWeight={500} variant="body2">
          {`Систолическое макс./мин.: ${maxPressure.sys}/${minPressure.sys} мм рт. ст.`}
        </Typography>
        <Typography fontWeight={500} variant="body2">
          {`Диастолическое макс./мин.: ${maxPressure.dia}/${minPressure.dia} мм рт. ст.`}
        </Typography>
      </header>
      <ResponsiveContainer className={classes.chartWrap} width="99%" height={height}>
        <AreaChart syncId={syncId} data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSYS" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={PRESSURE_COLORS.sysArea} stopOpacity={1} />
              <stop offset="95%" stopColor={PRESSURE_COLORS.sysArea} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorDIA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={PRESSURE_COLORS.diaArea} stopOpacity={1} />
              <stop offset="95%" stopColor={PRESSURE_COLORS.diaArea} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" />
          <YAxis
            domain={[(dataMin: number) => floor((dataMin - 1) / 10) * 10, (dataMax: number) => round((dataMax + 5) / 10) * 10]}
            orientation="right"
            axisLine={false}
            width={50}
          />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip content={<CustomTooltip valueName=" мм рт. ст." />} />
          <Area
            connectNulls
            type="monotone"
            dataKey="sys"
            stroke={PRESSURE_COLORS.sysArea}
            fillOpacity={0.3}
            fill="url(#colorSYS)"
          />
          <ReferenceLine
            y={meanPressure.sys}
            label={{ value: meanPressure.sys, position: 'insideRight' }}
            stroke={PRESSURE_COLORS.sysLine}
            strokeDasharray="4 4"
          />
          <Area
            connectNulls
            type="monotone"
            dataKey="dia"
            stroke={PRESSURE_COLORS.diaArea}
            fillOpacity={0.3}
            fill="url(#colorDIA)"
          />
          <ReferenceLine
            y={meanPressure.dia}
            label={{ value: meanPressure.dia, position: 'insideRight' }}
            stroke={PRESSURE_COLORS.diaLine}
            strokeDasharray="4 4"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
