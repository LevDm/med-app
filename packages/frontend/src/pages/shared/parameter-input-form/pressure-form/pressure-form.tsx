import { useController, useForm } from 'react-hook-form';

import { isString } from 'lodash';

import LoadingButton from '@mui/lab/LoadingButton';
import { TextField } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import ruLocale from 'date-fns/locale/ru';
import { makeStyles } from 'tss-react/mui';

import { PressureParameter } from '../../../../api';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

type PressureFormProps = {
  edit?: boolean;
  loading?: boolean;
  defaultValues?: Omit<PressureParameter, 'type'>;
  onAddParameter(parameter: PressureParameter): void;
};

export const PressureForm = ({ edit, loading, defaultValues, onAddParameter }: PressureFormProps) => {
  const { classes } = useStyles();

  const { register, handleSubmit, control, reset } = useForm<PressureParameter>({
    defaultValues: { type: 'pressure', createdAt: new Date(), ...defaultValues },
  });

  const {
    field: { value: createdAt, onChange: onCreatedAtChange },
  } = useController({ name: 'createdAt', control });

  const handleCreatedAtChange = (date: Date | null) => {
    onCreatedAtChange(date);
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
        <TextField label="Верхнее(SYS) давление" size="medium" type="number" {...register('data.sys', { setValueAs: Number })} />
        <TextField label="Нижнее(DIA) давление" size="medium" type="number" {...register('data.dia', { setValueAs: Number })} />
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ruLocale}>
          <DateTimePicker value={isString(createdAt) ? new Date(createdAt) : createdAt} onChange={handleCreatedAtChange} />
        </LocalizationProvider>

        <LoadingButton loading={loading} type="submit">
          {edit ? 'Сохранить' : 'Добавить'}
        </LoadingButton>
      </div>
    </form>
  );
};
