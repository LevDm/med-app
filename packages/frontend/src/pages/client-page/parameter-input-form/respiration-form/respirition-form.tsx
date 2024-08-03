import { useController, useForm } from 'react-hook-form';

import LoadingButton from '@mui/lab/LoadingButton';
import { TextField } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import ruLocale from 'date-fns/locale/ru';
import { makeStyles } from 'tss-react/mui';

import { RespirationParameter } from '../../../../api';
import { ensureDate } from '../../../../utils';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

type RespirationFormProps = {
  edit?: boolean;
  loading?: boolean;
  defaultValues?: Omit<RespirationParameter, 'type'>;
  onAddParameter(parameter: RespirationParameter): void;
};

export const RespirationForm = ({ edit, loading, defaultValues, onAddParameter }: RespirationFormProps) => {
  const { classes } = useStyles();

  const { register, handleSubmit, control, reset } = useForm<RespirationParameter>({
    defaultValues: { type: 'respiration', createdAt: new Date(), ...defaultValues },
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
        <TextField
          label="Дыханий в минуту"
          size="medium"
          type="number"
          inputProps={{
            step: 0.1,
          }}
          {...register('data.value', { setValueAs: (value) => Number(Number.parseFloat(value).toFixed(1)) })}
        />

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ruLocale}>
          <DateTimePicker value={ensureDate(createdAt)} onChange={handleCreatedAtChange} />
        </LocalizationProvider>

        <LoadingButton loading={loading} type="submit">
          {edit ? 'Сохранить' : 'Добавить'}
        </LoadingButton>
      </div>
    </form>
  );
};
