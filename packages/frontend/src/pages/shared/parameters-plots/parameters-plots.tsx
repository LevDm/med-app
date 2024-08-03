import { useMemo, useState } from 'react';

import { Chip, Typography, capitalize } from '@mui/material';

import { format, isToday, subDays, subMonths } from 'date-fns';
import ruLocale from 'date-fns/locale/ru';
import { makeStyles } from 'tss-react/mui';

import { MedicalParameter, MedicalParameterType } from '../../../api';
import { Island } from '../../../ui-components';
import { ensureDate } from '../../../utils';
import { parameterTypeToTitle } from '../../consts';

import { BodyMassPlot } from './body-mass-plot';
import { PressurePlot } from './pressure-plot';
import { PulsePlot } from './pulse-plot';
import { RespirationPlot } from './respiration-plot';
import { SaturationPlot } from './saturation-plot';
import { SleepTimePlot } from './sleep-time-plot';
import { StepsPlot } from './steps-plot';
import { TemperaturePlot } from './temperature-plot';
import { WorkoutPlot } from './workout-plot';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridAutoRows: '1fr',
    gap: theme.spacing(2),
    [theme.breakpoints.down(1000)]: {
      gridTemplateColumns: '1fr',
    },
  },
  chartContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'space-between',
  },
  chips: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  chartWrap: {
    marginTop: 'auto',
  },
  date: {
    display: 'flex',
    flex: 1,
  },
}));

type DateRangeFilter = 'today' | 'week' | 'month';

type PlotComponent = React.ComponentType<{
  parameters: MedicalParameter[];
  dateRange: DateRangeFilter;
  dateRangeSegment: Date[];
}>;

type PlotConfig = {
  type: MedicalParameterType;
  Component: PlotComponent;
  columnSpan?: number;
  dateRangeOptions: DateRangeFilter[];
};

const plotConfig = [
  {
    type: 'pulse',
    Component: PulsePlot as PlotComponent,
    dateRangeOptions: ['today', 'week', 'month'],
  },
  {
    type: 'sleep',
    Component: SleepTimePlot as PlotComponent,
    dateRangeOptions: ['week', 'month'],
  },
  {
    type: 'steps',
    Component: StepsPlot as PlotComponent,
    dateRangeOptions: ['week', 'month'],
  },
  {
    type: 'saturation',
    Component: SaturationPlot as PlotComponent,
    dateRangeOptions: ['today', 'week', 'month'],
  },
  {
    type: 'respiration',
    Component: RespirationPlot as PlotComponent,
    dateRangeOptions: ['today', 'week', 'month'],
  },
  {
    type: 'pressure',
    Component: PressurePlot as PlotComponent,
    dateRangeOptions: ['today', 'week', 'month'],
  },
  {
    type: 'mass',
    Component: BodyMassPlot as PlotComponent,
    dateRangeOptions: ['week', 'month'],
  },
  {
    type: 'temperature',
    Component: TemperaturePlot as PlotComponent,
    dateRangeOptions: ['today', 'week', 'month'],
  },
  {
    type: 'workout',
    Component: WorkoutPlot as PlotComponent,
    dateRangeOptions: ['week', 'month'],
  },
] satisfies PlotConfig[];

const dateRangeOptionToTitle = {
  today: 'Сегодня',
  week: 'Неделя',
  month: 'Месяц',
} satisfies Record<DateRangeFilter, string>;

type ParametersPlotsProps = { parameters: MedicalParameter[] };

export const ParametersPlots = ({ parameters }: ParametersPlotsProps) => {
  const { classes } = useStyles();

  return (
    <section className={classes.root}>
      {plotConfig.map(({ type, Component, dateRangeOptions }) => (
        <ChartContainer
          key={type}
          type={type}
          parameters={parameters}
          dateRangeOptions={dateRangeOptions}
          renderChart={(filteredParameters, dateRange, dateRangeSegment) => {
            if (!filteredParameters.length)
              return (
                <Typography key={type} variant="body1" fontWeight="bold">
                  Нет данных
                </Typography>
              );
            return (
              <Component key={type} dateRange={dateRange} parameters={filteredParameters} dateRangeSegment={dateRangeSegment} />
            );
          }}
        />
      ))}
    </section>
  );
};

type ChartContainerProps = {
  type: MedicalParameterType;
  parameters: MedicalParameter[];
  dateRangeOptions: DateRangeFilter[];
  renderChart(parameters: MedicalParameter[], dateRange: DateRangeFilter, dateRangeSegment: Date[]): React.ReactNode;
};

const ChartContainer = ({ parameters, type, dateRangeOptions, renderChart }: ChartContainerProps) => {
  const { classes } = useStyles();

  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>(dateRangeOptions[dateRangeOptions.length - 1]);

  const { today, week, month } = useMemo(() => {
    const today = new Date(new Date().setHours(0, 0, 0));
    const week = subDays(today, 6);
    const month = subMonths(today, 1);
    return { today, week, month };
  }, []);

  const filteredParameters = useMemo(() => {
    const filteredByType = parameters.filter((parameter) => parameter.type === type);

    if (dateRangeFilter === 'month') return filteredByType;

    if (dateRangeFilter === 'today') {
      return filteredByType.filter(({ createdAt }) => createdAt && isToday(ensureDate(createdAt)));
    }

    if (dateRangeFilter === 'week') {
      const startDate = subDays(today, 6).toISOString();

      return filteredByType.filter(({ createdAt }) => createdAt && createdAt > startDate);
    }

    return filteredByType;
  }, [dateRangeFilter, parameters]);

  const { dateRangeTitle, dateRangeSegment } = useMemo(() => {
    const dateFormat = 'd	MMMM';

    if (dateRangeFilter === 'today') {
      return {
        dateRangeTitle: format(today, dateFormat, { locale: ruLocale }),
        dateRangeSegment: [today, new Date(new Date(today).setHours(23, 59, 59))],
      };
    }

    if (dateRangeFilter === 'week') {
      return {
        dateRangeTitle: `${format(week, dateFormat, { locale: ruLocale })} - ${format(today, dateFormat, {
          locale: ruLocale,
        })}`,
        dateRangeSegment: [week, today],
      };
    }

    return {
      dateRangeTitle: `${format(month, dateFormat, { locale: ruLocale })} - ${format(today, dateFormat, {
        locale: ruLocale,
      })}`,
      dateRangeSegment: [month, today],
    };
  }, [dateRangeFilter]);

  return (
    <Island className={classes.chartContainer}>
      <header className={classes.header}>
        <Typography variant="h6">{parameterTypeToTitle[type]}</Typography>

        <div className={classes.chips}>
          <Typography className={classes.date} variant="caption">
            {dateRangeTitle}
          </Typography>
          {dateRangeOptions.map((option) => (
            <Chip
              key={option}
              clickable
              onClick={() => setDateRangeFilter(option)}
              size="small"
              color={option === dateRangeFilter ? 'primary' : 'default'}
              variant="outlined"
              label={capitalize(dateRangeOptionToTitle[option])}
            />
          ))}
        </div>
      </header>
      {renderChart(filteredParameters, dateRangeFilter, dateRangeSegment)}
    </Island>
  );
};
