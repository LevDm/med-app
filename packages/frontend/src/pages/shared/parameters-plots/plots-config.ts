import { MedicalParameter, MedicalParameterType } from '../../../api';

import { BodyMassPlot } from './body-mass-plot';
import { PressurePlot } from './pressure-plot';
import { PulsePlot } from './pulse-plot';
import { RespirationPlot } from './respiration-plot';
import { SaturationPlot } from './saturation-plot';
import { SleepTimePlot } from './sleep-time-plot';
import { StepsPlot } from './steps-plot';
import { TemperaturePlot } from './temperature-plot';
import { WorkoutPlot } from './workout-plot';

export type DateRangeFilter = 'today' | 'week' | 'month';

export const dateRangeOptionToTitle = {
  today: 'Сегодня',
  week: 'Неделя',
  month: 'Месяц',
} satisfies Record<DateRangeFilter, string>;

type PlotComponent = React.ComponentType<{
  parameters: MedicalParameter[];
  dateRange: DateRangeFilter;
  dateRangeSegment: (Date | string)[];
  syncId?: string;
  height?: number;
}>;

type PlotConfig = {
  type: MedicalParameterType;
  Component: PlotComponent;
  columnSpan?: number;
  dateRangeOptions: DateRangeFilter[];
};

export const plotConfig = [
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
