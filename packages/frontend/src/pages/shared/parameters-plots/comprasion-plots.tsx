import { useMemo, useState } from 'react';

import { isNull } from 'lodash';

import { Autocomplete, Chip, TextField, Typography, capitalize } from '@mui/material';

import { format, isToday, subDays, subMonths, subWeeks } from 'date-fns';
import ruLocale from 'date-fns/locale/ru';
import { makeStyles } from 'tss-react/mui';

import { MedicalParameter, MedicalParameterType } from '../../../api';
import { Island } from '../../../ui-components';
import { ensureDate } from '../../../utils';
import { parameterTypeToTitle } from '../../consts';

import { DateRangeFilter, dateRangeOptionToTitle, plotConfig } from './plots-config';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridAutoRows: '1fr',
    gap: theme.spacing(2),
  },
  chartContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chips: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(0.5),
  },
  chartWrap: {
    marginTop: 'auto',
  },
  date: {
    marginBottom: 0,
  },
  chartSelectorContainer: {
    marginTop: theme.spacing(0.5),
    width: '18%',
  },
  chartSection: {
    position: 'relative',
  },
}));

const options = Object.keys(parameterTypeToTitle).filter((type) => type !== 'form' && type !== 'export');

const defaultComparison: Record<string, MedicalParameterType | null> = {
  primary: 'pulse',
  secondary: 'pressure',
  tertiary: null,
};

const dateRangeOptions: DateRangeFilter[] = ['week', 'month']; //'today',

type ComparisonPlotsProps = {
  parameters: MedicalParameter[];
};

export const ComparisonPlots = ({ parameters }: ComparisonPlotsProps) => {
  const { classes } = useStyles();

  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>(dateRangeOptions[1]);

  const { today, week, month } = useMemo(() => {
    const today = new Date();
    const week = subDays(today, 6);
    const month = subMonths(today, 1);
    return { today, week, month };
  }, []);

  const { dateRangeTitle, dateRangeSegment } = useMemo(() => {
    const dateFormat = 'd	MMMM';

    if (dateRangeFilter === 'today') {
      return {
        dateRangeTitle: format(today, dateFormat, { locale: ruLocale }),
        dateRangeSegment: [new Date(new Date(today).setHours(0, 0, 0)), new Date(new Date(today).setHours(23, 59, 59))],
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

  const renderChartSelector = (keyId: string) => (
    <ChartSelector
      key={keyId}
      keyId={keyId}
      parameters={parameters}
      dateRangeFilter={dateRangeFilter}
      dateRangeSegment={dateRangeSegment}
    />
  );

  return (
    <Island className={classes.chartContainer}>
      <header className={classes.header}>
        <Typography variant="h6">Композиция показателей</Typography>

        <div className={classes.chips}>
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

      <Typography className={classes.date} variant="caption">
        {dateRangeTitle}
      </Typography>

      {Object.keys(defaultComparison).map(renderChartSelector)}
    </Island>
  );
};

type ChartSelectorProps = {
  keyId: string;
  parameters: MedicalParameter[];

  dateRangeFilter: DateRangeFilter;
  dateRangeSegment: Date[];
};

const ChartSelector = (props: ChartSelectorProps) => {
  const { keyId } = props;

  const { classes } = useStyles();

  const [comparisons, setComparisons] = useState(defaultComparison[keyId]);

  const handleTypeChange = (_: unknown, value: string | null) => {
    setComparisons(value as MedicalParameterType);
  };

  return (
    <div key={keyId} className={classes.chartSection}>
      <Autocomplete
        className={classes.chartSelectorContainer}
        style={{ ...(isNull(comparisons) ? {} : { position: 'absolute' }) }}
        disablePortal
        defaultValue={defaultComparison[keyId]}
        getOptionLabel={(value: MedicalParameterType) => parameterTypeToTitle[value] ?? ''}
        onChange={handleTypeChange}
        options={options as MedicalParameterType[]}
        size="small"
        renderInput={(params) => <TextField {...params} defaultValue={comparisons} label="Параметр" />}
      />

      <Chart type={comparisons} {...props} />
    </div>
  );
};

type ChartProps = Omit<ChartSelectorProps, 'keyId'> & { type: MedicalParameterType | null };

const Chart = ({ parameters, dateRangeFilter, dateRangeSegment, type }: ChartProps) => {
  const filteredParameters = useMemo(() => {
    const filteredByType = parameters.filter((parameter) => parameter.type === type);
    const today = new Date();

    if (dateRangeFilter === 'month') return filteredByType;

    if (dateRangeFilter === 'today') {
      return filteredByType.filter(({ createdAt }) => createdAt && isToday(ensureDate(createdAt)));
    }

    if (dateRangeFilter === 'week') {
      const startDate = subWeeks(today, 1).toISOString();

      return filteredByType.filter(({ createdAt }) => createdAt && createdAt > startDate);
    }

    return filteredByType;
  }, [dateRangeFilter, parameters, type]);

  if (isNull(type)) return null;
  const { Component } = plotConfig.filter((plot) => plot.type === type)[0];
  return (
    <Component
      dateRange={dateRangeFilter}
      parameters={filteredParameters}
      dateRangeSegment={dateRangeSegment}
      syncId={'comparisons'}
      height={230}
    />
  );
};
