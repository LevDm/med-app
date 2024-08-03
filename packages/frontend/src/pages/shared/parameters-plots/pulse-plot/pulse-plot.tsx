import { useMemo } from 'react';

import { floor, isUndefined, maxBy, mean, meanBy, minBy, orderBy, round } from 'lodash';

import { Typography, useTheme } from '@mui/material';

import { format } from 'date-fns';
import ruLocale from 'date-fns/locale/ru';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { makeStyles } from 'tss-react/mui';

import { PulseParameter } from '../../../../api';
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
  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    alignItems: 'center',
  },
  stepCount: {
    marginBottom: theme.spacing(0.5),
  },
  chartWrap: {
    marginTop: 'auto',
  },
  pulseRange: {
    position: 'relative',
    backgroundColor: theme.palette.action.selected,
    borderRadius: theme.shape.borderRadius * 4,
    height: 16,
    width: 150,
  },
  pulseRangeThumb: {
    height: 16,
    position: 'absolute',
    width: '100%',
    backgroundColor: theme.palette.accent.main,
    borderRadius: theme.shape.borderRadius * 4,
  },
  pulseRangeMin: {
    position: 'absolute',
    top: '50%',
    left: -4,
    transform: 'translate(-100%, -50%)',
  },
  pulseRangeMax: {
    position: 'absolute',
    top: '50%',
    right: -4,
    transform: 'translate(100%, -50%)',
  },
}));

const pulseRangeMin = 40;
const pulseRangeMax = 220;
const pulseRange = pulseRangeMax - pulseRangeMin;

type PulsePlotProps = {
  parameters: PulseParameter[];
  dateRange: 'today' | 'week' | 'month';
  dateRangeSegment: Date[];
  syncId?: string;
  height?: number;
};

type ParameterItem = Record<string, { day: string; value?: number[]; date: Date }>;

export const PulsePlot = ({ parameters, dateRange, dateRangeSegment, syncId, height = 300 }: PulsePlotProps) => {
  const theme = useTheme();
  const color = theme.palette.accent.main;

  const { classes } = useStyles();

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

    return orderBy(Object.values(fillig), ({ date }) => date).map(({ day, value: bpm }) => ({
      day,
      ...(isUndefined(bpm) ? {} : { bpm: round(mean(bpm)) }),
    }));
  }, [dateRange, parameters]);

  const { minPulse, maxPulse, meanPulse } = useMemo(() => {
    const { bpm: minPulse = 0 } = minBy(data, ({ bpm }) => bpm) ?? {};
    const { bpm: maxPulse = 0 } = maxBy(data, ({ bpm }) => bpm) ?? {};
    const meanPulse = Math.floor(
      meanBy(
        data.filter(({ bpm }) => !isUndefined(bpm)),
        ({ bpm }) => bpm,
      ),
    );

    return { minPulse, maxPulse, meanPulse };
  }, [data]);

  const normalizedStartValue = 100 * ((minPulse - pulseRangeMin) / pulseRange);
  const normalizedEndValue = 100 * ((maxPulse - pulseRangeMin) / pulseRange);

  return (
    <div className={classes.root} style={{ ...(isUndefined(syncId) ? {} : { alignItems: 'flex-end' }) }}>
      <header className={classes.header} style={{ ...(isUndefined(syncId) ? {} : { width: '80%' }) }}>
        <div className={classes.headerContent}>
          <Typography fontWeight={500} variant="body1">{`${Math.floor(minPulse)}—${Math.floor(maxPulse)} уд/м`}</Typography>

          <div className={classes.pulseRange}>
            <div
              style={{
                background: `linear-gradient(to right, transparent ${normalizedStartValue}%, ${color} ${normalizedStartValue}% ${normalizedEndValue}%,  transparent ${normalizedEndValue}%)`,
              }}
              className={classes.pulseRangeThumb}
            />

            <Typography className={classes.pulseRangeMin} variant="caption">
              {pulseRangeMin}
            </Typography>

            <Typography className={classes.pulseRangeMax} variant="caption">
              {pulseRangeMax}
            </Typography>
          </div>
        </div>
      </header>

      <ResponsiveContainer className={classes.chartWrap} width="99%" height={height}>
        <AreaChart syncId={syncId} data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorbpm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={1} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" />
          <YAxis
            domain={[(dataMin: number) => floor((dataMin - 1) / 10) * 10, (dataMax: number) => round(dataMax / 10 + 0.5) * 10]}
            orientation="right"
            axisLine={false}
            width={50}
          />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip content={<CustomTooltip valueName=" уд./мин." />} />
          <Area connectNulls type="monotone" dataKey="bpm" stroke={color} fillOpacity={0.5} fill="url(#colorbpm)" />
          <ReferenceLine
            y={meanPulse}
            label={{ value: meanPulse, position: 'insideRight' }}
            stroke={color}
            strokeDasharray="4 4"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
