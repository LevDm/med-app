import { useController, useForm } from 'react-hook-form';

import LoadingButton from '@mui/lab/LoadingButton';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import ruLocale from 'date-fns/locale/ru';
import { makeStyles } from 'tss-react/mui';

import { MedicalParameter, SleepParameter } from '../../../../api';
import { ensureDate } from '../../../../utils';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

type SleepFormProps = {
  edit?: boolean;
  loading?: boolean;
  defaultValues?: Omit<SleepParameter, 'type'>;
  onAddParameter(parameter: MedicalParameter): void;
};

export const SleepForm = ({ edit, loading, defaultValues, onAddParameter }: SleepFormProps) => {
  const { classes } = useStyles();

  const { handleSubmit, control, reset } = useForm<SleepParameter>({
    defaultValues: { type: 'sleep', createdAt: new Date(), ...defaultValues },
  });

  const {
    field: { onChange: onCreatedAtChange },
  } = useController({ name: 'createdAt', control });

  const {
    field: { value: start, onChange: onStartChange },
  } = useController({ name: 'data.startDate', control });

  const {
    field: { value: end, onChange: onEndChange },
  } = useController({ name: 'data.endDate', control });

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
