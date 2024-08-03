import { useCallback, useState } from 'react';

import AirIcon from '@mui/icons-material/Air';
import WatchIcon from '@mui/icons-material/Watch';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { makeStyles } from 'tss-react/mui';

import { MedicalParameter, MedicalParameterType, useAddParameterRequest } from '../../../api';
import { Island, useWithNotification } from '../../../ui-components';
import { parameterTypeToIcon, parameterTypeToTitle } from '../../consts';
import { InputFormModal } from '../parameter-input-form';

import { ParametersSection } from './parameters-section';

const useStyles = makeStyles()((theme) => ({
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridAutoRows: '1fr',
    gap: theme.spacing(2),
    [theme.breakpoints.down(800)]: {
      gridTemplateColumns: '1fr',
    },
  },
  island: {
    height: '100%',
  },
}));

type ParameterSectionData = {
  title: string;
  color: string;
  columnSpan?: number;
  itemsColumnCount?: number;
  items: { title: string; type: MedicalParameterType | 'export'; icon: React.ReactNode }[];
};

const sectionsConfig = [
  {
    title: 'Сердечно-сосудистая система',
    color: 'rgb(220, 86, 93)',
    items: [
      {
        title: parameterTypeToTitle['pulse'],
        type: 'pulse',
        icon: parameterTypeToIcon['pulse'],
      },
      { title: parameterTypeToTitle['pressure'], type: 'pressure', icon: parameterTypeToIcon['pressure'] },
    ],
  },
  {
    title: 'Активность',
    color: 'rgb(54, 156, 99)',
    columnSpan: 2,
    itemsColumnCount: 2,
    items: [
      { title: parameterTypeToTitle['steps'], type: 'steps', icon: parameterTypeToIcon['steps'] },
      { title: parameterTypeToTitle['sleep'], type: 'sleep', icon: parameterTypeToIcon['sleep'] },
      { title: parameterTypeToTitle['workout'], type: 'workout', icon: parameterTypeToIcon['workout'] },
    ],
  },
  {
    title: 'Дыхательная система',
    color: 'rgb(0, 173, 184)',
    items: [
      { title: parameterTypeToTitle['saturation'], type: 'saturation', icon: parameterTypeToIcon['saturation'] },
      { title: 'Количество вдохов', type: 'respiration', icon: <AirIcon /> },
    ],
  },
  {
    title: 'Общие показатели',
    color: '#ff8f40',
    items: [
      { title: parameterTypeToTitle['mass'], type: 'mass', icon: parameterTypeToIcon['mass'] },
      { title: parameterTypeToTitle['temperature'], type: 'temperature', icon: parameterTypeToIcon['temperature'] },
    ],
  },
  {
    title: 'Другое',
    color: 'rgb(147, 113, 181)',
    items: [
      { title: parameterTypeToTitle['form'], type: 'form', icon: parameterTypeToIcon['form'] },
      { title: parameterTypeToTitle['export'], type: 'export', icon: <WatchIcon /> },
    ],
  },
] satisfies ParameterSectionData[];

type ParametersInputSectionProps = {
  onAddParameter(parameter: MedicalParameter): void;
  refetchParameters(): void;
};

export const ParametersInputSection = ({ onAddParameter, refetchParameters }: ParametersInputSectionProps) => {
  const { classes } = useStyles();
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const [dialogType, setDialogType] = useState<MedicalParameterType | null>(null);

  const { withNotification } = useWithNotification();

  const { addParameter, isLoading } = useAddParameterRequest({ onSuccess: onAddParameter });

  const addParameterWithNotification = useCallback(
    withNotification(addParameter, {
      successMsg: ({ type }) => `Параметр "${parameterTypeToTitle[type]}" успешно добавлен`,
      errorMsg: (_, { type }) => `Ошибка при добавлении параметра "${parameterTypeToTitle[type]}"`,
    }),
    [],
  );

  const handleParameterClick = (type: MedicalParameterType) => setDialogType(type);

  const handleDialogClose = () => setDialogType(null);

  return (
    <section className={classes.gridContainer}>
      {sectionsConfig.map(({ title, items, color, columnSpan, itemsColumnCount }, index) => (
        <Island
          key={title}
          className={classes.island}
          {...(!isSmallScreen && columnSpan && { style: { gridColumn: `${index + 1} / span ${columnSpan}` } })}
        >
          <ParametersSection
            onClick={handleParameterClick}
            columnCount={itemsColumnCount}
            color={color}
            title={title}
            items={items}
          />
        </Island>
      ))}

      <InputFormModal
        loading={isLoading}
        open={!!dialogType}
        type={dialogType}
        onClose={handleDialogClose}
        onAddParameter={addParameterWithNotification}
        refetchParameters={refetchParameters}
      />
    </section>
  );
};
