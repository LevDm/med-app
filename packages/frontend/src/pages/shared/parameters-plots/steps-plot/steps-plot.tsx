import { useEffect, useMemo, useState } from 'react';

import { floor, isUndefined, meanBy, orderBy, round, sumBy } from 'lodash';

import { Typography, useTheme } from '@mui/material';

import { format } from 'date-fns';
import ruLocale from 'date-fns/locale/ru';
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { makeStyles } from 'tss-react/mui';

import { StepsParameter } from '../../../../api';
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
  },
  headerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  stepCount: {
    marginBottom: theme.spacing(0.5),
  },
}));

const STEPS_COLORS = {
  colums: '#82ca9da7',
  referenceLine: '#008000',
};

const stepToKm = (step: number) => (step / 1408).toFixed(2);

type StepsPlotProps = {
  dateRange: 'today' | 'week' | 'month';
  parameters: StepsParameter[];
  dateRangeSegment: Date[];
  syncId?: string;
  height?: number;
};

type ParameterItem = Record<string, { day: string; value?: number; date: Date }>;

export const StepsPlot = ({ parameters, dateRange, dateRangeSegment, syncId, height = 300 }: StepsPlotProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const data = useMemo(() => {
    const dayToValueMap = parameters.reduce<ParameterItem>((result, { data: { value }, createdAt }) => {
      if (!createdAt) return result;

      const date = ensureDate(createdAt);
      const key = getKey(date, dateRange);

      if (!isUndefined(result[key])) {
        result[key].value = (result[key].value ?? 0) + value;
      } else {
        const day = format(date, dateFormat(dateRange), { locale: ruLocale });
        result[key] = { value: value, day, date };
      }

      return result;
    }, {});

    const fillig = dateFilling(dateRange, dateRangeSegment, dayToValueMap);

    return orderBy(Object.values(fillig), ({ date }) => date, 'asc').map(({ value, day }) => ({
      day,
      ...(isUndefined(value) ? {} : { step: value }),
    }));
  }, [dateRange, parameters]);

  useEffect(() => {
    setActiveIndex(0);
  }, [dateRange]);

  const { step } = data[activeIndex] ?? {};

  const handleClick = (_: unknown, index: number) => setActiveIndex(index);

  const theme = useTheme();

  const { stepsSum, stepsMean } = useMemo(() => {
    const stepsSum = sumBy(data, ({ step }) => step ?? 0);
    const stepsMean = Math.floor(
      meanBy(
        data.filter(({ step }) => !isUndefined(step)),
        ({ step }) => step,
      ),
    );

    return {
      stepsSum,
      stepsMean,
    };
  }, [data, activeIndex]);

  const { classes } = useStyles();

  return (
    <div className={classes.root} style={{ ...(isUndefined(syncId) ? {} : { alignItems: 'flex-end' }) }}>
      <header className={classes.header} style={{ ...(isUndefined(syncId) ? {} : { width: '80%' }) }}>
        <Typography className={classes.stepCount} fontWeight={500} variant="body1">
          {`${step ?? '-'} шаг. в день (${stepToKm(step ?? 0)} км)`}
        </Typography>

        <div className={classes.headerGrid}>
          <span>
            <Typography component="span" variant="body2">
              В среднем
            </Typography>

            <Typography component="span" fontWeight={500} variant="body2">{`  ${stepToKm(stepsMean)} км`}</Typography>
          </span>

          <span>
            <Typography component="span" variant="body2">
              Всего шагов
            </Typography>

            <Typography component="span" fontWeight={500} variant="body2">
              {`  ${stepsSum}`}
            </Typography>
          </span>
        </div>
      </header>

      <ResponsiveContainer width="99%" height={height}>
        <BarChart syncId={syncId} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis
            orientation="right"
            axisLine={false}
            width={50}
            domain={[(dataMin: number) => floor(dataMin / 1000) * 1000, (dataMax: number) => (round(dataMax / 1000) + 1) * 1000]}
          />
          <Tooltip content={<CustomTooltip valueName=" Шагов" />} />
          <Bar dataKey="step" fill={STEPS_COLORS.colums} onClick={handleClick} radius={[8, 8, 0, 0]}>
            {data.map((_, index) => (
              <Cell
                cursor="pointer"
                fill={index === activeIndex ? STEPS_COLORS.colums : theme.palette.action.disabled}
                key={`cell-${index}`}
              />
            ))}
          </Bar>
          <ReferenceLine
            y={stepsMean}
            label={{ value: stepsMean, position: 'insideRight' }}
            stroke={STEPS_COLORS.referenceLine}
            strokeDasharray="4 4"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
