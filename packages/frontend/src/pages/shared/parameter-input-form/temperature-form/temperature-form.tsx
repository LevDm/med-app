import { useController, useForm } from 'react-hook-form';

import { isString } from 'lodash';

import LoadingButton from '@mui/lab/LoadingButton';
import { TextField } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import ruLocale from 'date-fns/locale/ru';
import { makeStyles } from 'tss-react/mui';

import { TemperatureParameter } from '../../../../api';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

type TemperatureFormProps = {
  edit?: boolean;
  loading?: boolean;
  defaultValues?: Omit<TemperatureParameter, 'type'>;
  onAddParameter(parameter: TemperatureParameter): void;
};

export const TemperatureForm = ({ edit, loading, defaultValues, onAddParameter }: TemperatureFormProps) => {
  const { classes } = useStyles();

  const { register, handleSubmit, control, reset } = useForm<TemperatureParameter>({
    defaultValues: { type: 'temperature', createdAt: new Date(), ...defaultValues },
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
        <TextField label="Температура °C" size="medium" type="number" {...register('data.value', { setValueAs: Number })} />

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
