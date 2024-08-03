import { useController, useForm } from 'react-hook-form';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, DialogContentText, Slider } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import ruLocale from 'date-fns/locale/ru';
import { makeStyles } from 'tss-react/mui';

import { WorkoutParameter } from '../../../../api';
import { ensureDate } from '../../../../utils';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

type WorkoutFormProps = {
  edit?: boolean;
  loading?: boolean;
  defaultValues?: Omit<WorkoutParameter, 'type'>;
  onAddParameter(parameter: WorkoutParameter): void;
};

const marks = [
  {
    value: 0,
    label: 'Лёгкая',
  },
  {
    value: 0.25,
    label: '',
  },
  {
    value: 0.5,
    label: 'Нормальная',
  },
  {
    value: 0.75,
    label: '',
  },
  {
    value: 1,
    label: 'Тяжелая',
  },
];

function valueLabelFormat(value: number) {
  return marks.findIndex((mark) => mark.value === value) + 1;
}

export const WorkoutForm = ({ edit, loading, defaultValues, onAddParameter }: WorkoutFormProps) => {
  const { classes } = useStyles();

  const { handleSubmit, control, reset } = useForm<WorkoutParameter>({
    defaultValues: { type: 'workout', createdAt: new Date(), ...defaultValues },
  });

  const {
    field: { value: intensity, onChange: onIntensityeChange },
  } = useController({ name: 'data.intensity', control, defaultValue: 0 });

  const {
    field: { onChange: onCreatedAtChange },
  } = useController({ name: 'createdAt', control });

  const {
    field: { value: start, onChange: onStartChange },
  } = useController({ name: 'data.startDate', control });

  const {
    field: { value: end, onChange: onEndChange },
  } = useController({ name: 'data.endDate', control });

  const changeIntensity = (_: unknown, value: number | number[]) => {
    onIntensityeChange(value);
  };

  const changeFrom = (date: Date | null) => {
    onCreatedAtChange(date);
    onStartChange(date);
  };

  const changeTo = (date: Date | null) => {
    onEndChange(date);
  };

  const handleAdd = (event: React.SyntheticEvent) => {
    return handleSubmit((formValues) => {
      onAddParameter(formValues);
      reset(undefined, { keepDefaultValues: true });
    })(event);
  };

  return (
    <form onSubmit={handleAdd}>
      <div className={classes.root}>
        <DialogContentText>Интенсивность тренировки</DialogContentText>
        <Box sx={{ width: 200, alignSelf: 'center' }}>
          <Slider
            aria-label="Restricted values"
            min={0}
            defaultValue={intensity}
            max={1}
            valueLabelFormat={valueLabelFormat}
            onChange={changeIntensity}
            step={null}
            valueLabelDisplay="off"
            marks={marks}
          />
        </Box>

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ruLocale}>
          <DateTimePicker label="Начало" defaultValue={ensureDate(start)} onChange={changeFrom} disableFuture />

          <DateTimePicker label="Конец" defaultValue={ensureDate(end)} onChange={changeTo} disableFuture />
        </LocalizationProvider>

        <LoadingButton loading={loading} type="submit">
          {edit ? 'Сохранить' : 'Добавить'}
        </LoadingButton>
      </div>
    </form>
  );
};
