import { useMemo } from 'react';

import { isNumber, isUndefined, meanBy, orderBy, round } from 'lodash';

import { Typography, useTheme } from '@mui/material';

import { format } from 'date-fns';
import ruLocale from 'date-fns/locale/ru';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { makeStyles } from 'tss-react/mui';

import { WorkoutParameter } from '../../../../api';
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

type WorkoutPlotProps = {
  dateRange: 'today' | 'week' | 'month';
  parameters: WorkoutParameter[];
  dateRangeSegment: Date[];
  syncId?: string;
  height?: number;
};

type ParameterItem = Record<string, { day: string; value?: Record<string, number>; date: Date; totalDuration?: number }>;

type ShapeProps = {
  fill: string;
  workouts: Record<string, string>;
  x: number;
  y: number;
  width: number;
  height: number;
  dataKey: string;
};

const ZONES_NAMES: Record<string, string> = {
  0: 'zone_1',
  0.25: 'zone_2',
  0.5: 'zone_3',
  0.75: 'zone_4',
  1: 'zone_5',
};

const ZONES_PROPS: Record<string, { fill: string; legend: string }> = {
  zone_5: {
    fill: '#D3321Da7',
    legend: 'Тяжелая',
  },
  zone_4: {
    fill: '#DE5930a7',
    legend: 'Средняя',
  },
  zone_3: {
    fill: '#E98142a7',
    legend: 'Нормальная',
  },
  zone_2: {
    fill: '#F4A855a7',
    legend: 'Простая',
  },
  zone_1: {
    fill: '#FFCF67a7',
    legend: 'Лёгкая',
  },
} as const;

const getDuration = (startDate: string | Date, endDate: string | Date) =>
  round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 60000);

const getZones = (startDate: string | Date, endDate: string | Date, intensity: number) => {
  const zones: Record<string, number> = {};
  let totalDuration = 0;
  if (!isUndefined(intensity)) {
    const key = ZONES_NAMES[intensity];
    const currentDuration = getDuration(startDate, endDate);
    zones[key] = currentDuration;
    totalDuration = currentDuration;
  }
  return { totalDuration, zones };
};

export const WorkoutPlot = ({ parameters, dateRange, dateRangeSegment, syncId, height = 300 }: WorkoutPlotProps) => {
  const data = useMemo(() => {
    const dayToValueMap = parameters.reduce<ParameterItem>((result, { data: { startDate, endDate, intensity }, createdAt }) => {
      if (!createdAt || !isNumber(intensity)) return result;

      const date = ensureDate(createdAt);
      const key = getKey(date, dateRange);

      const { totalDuration, zones: zonesData } = getZones(startDate, endDate, intensity);

      const ObjestSum = (obj_1: Record<string, number>, obj_2: Record<string, number> | undefined) => {
        if (isUndefined(obj_2)) return obj_1;
        const newObj = { ...obj_1 };
        for (const key in obj_2) {
          newObj[key] = newObj[key] ?? 0 + obj_2[key];
        }
        return newObj;
      };

      if (!isUndefined(result[key])) {
        result[key].value = ObjestSum(zonesData, result[key].value);
        result[key].totalDuration = result[key].totalDuration ?? 0 + totalDuration;
      } else {
        const day = format(date, dateFormat(dateRange), { locale: ruLocale });
        result[key] = {
          value: zonesData,
          day,
          date,
          totalDuration: totalDuration,
        };
      }

      return result;
    }, {});

    const fillig = dateFilling(dateRange, dateRangeSegment, dayToValueMap);

    return orderBy(Object.values(fillig), ({ date }) => date, 'asc').map(({ value, day, totalDuration }) => ({
      day,
      workouts: value,
      totalDuration,
    }));
  }, [dateRange, parameters]);

  const { meanDuration } = useMemo(() => {
    return {
      meanDuration: round(
        meanBy(
          data.filter(({ totalDuration }) => !isUndefined(totalDuration)),
          (item) => item.totalDuration,
        ),
      ),
    };
  }, [data]);

  const { classes } = useStyles();

  const getPath = (x: number, y: number, w: number, h: number, r: number) =>
    `M ${x} ${y + r}
    C ${x} ${y + r / 2} ${x + r / 2} ${y} ${x + r} ${y}
    H ${x + (w - r)}
    C ${x + (w - r) + r / 2} ${y} ${x + w} ${y + r / 2} ${x + w} ${y + r}
    V ${y + h}
    H ${x}
    V ${y + r}
    Z`;

  const renderShape = ({ fill, workouts, x, y, width, height, dataKey }: ShapeProps) => {
    if (height === 0) {
      return <path />;
    }

    const zones = Object.keys(workouts).sort().reverse();
    const radius = dataKey.split('.')[1] === zones[zones.length - 1] ? Math.min(width ?? 0, height ?? 0) / 2 : 0;
    return <path d={getPath(x, y, width, height, radius)} stroke="none" fill={fill} />;
  };

  const theme = useTheme();

  const renderColorfulLegendText = (value: string) => {
    const title = ZONES_PROPS[value.split('.')[1]].legend;
    const color = theme.palette.text.primary;
    return <span style={{ color: color }}>{title}</span>;
  };

  return (
    <div className={classes.root} style={{ ...(isUndefined(syncId) ? {} : { alignItems: 'flex-end' }) }}>
      <header className={classes.header} style={{ ...(isUndefined(syncId) ? {} : { width: '80%' }) }}>
        <Typography className={classes.stepCount} fontWeight={500} variant="body1">
          Средняя продолжительность тренировки: {meanDuration} мин.
        </Typography>
      </header>

      <ResponsiveContainer width="99%" height={height}>
        <BarChart syncId={syncId} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis
            domain={[0, (dataMax: number) => round((dataMax + 5) / 10) * 10]}
            orientation="right"
            axisLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip valueName=" мин." />} />
          {Object.keys(ZONES_PROPS).map((zone_key) => (
            <Bar
              dataKey={`workouts.${zone_key}`}
              stackId="a"
              fill={ZONES_PROPS[zone_key].fill}
              shape={(props) => renderShape(props as ShapeProps)}
            />
          ))}
          <Legend verticalAlign="bottom" style={{ flexGrow: 1 }} formatter={renderColorfulLegendText} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
