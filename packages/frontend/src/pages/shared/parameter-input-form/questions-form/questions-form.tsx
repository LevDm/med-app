import { useMemo } from 'react';
import { useController, useForm } from 'react-hook-form';

import { isUndefined } from 'lodash';

import LoadingButton from '@mui/lab/LoadingButton';
import { DialogContentText, TextField } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { FormParameter } from '../../../../api';
import { useAuthContext } from '../../../../auth-context';

import { AnswersGroup } from './AnswersGroup';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

type QuestionsFormProps = {
  edit?: boolean;
  loading?: boolean;
  defaultValues?: Omit<FormParameter, 'type'>;
  onAddParameter(parameter: FormParameter): void;
};

export const QuestionsForm = ({ edit, loading, defaultValues, onAddParameter }: QuestionsFormProps) => {
  const { classes } = useStyles();

  const user = useAuthContext().getUser();

  const { register, handleSubmit, control, reset } = useForm<FormParameter>({
    defaultValues: { type: 'form', createdAt: new Date(), ...defaultValues },
  });

  const {
    field: { onChange: onChangeHeadache },
  } = useController({ name: 'data.headache', control });

  const {
    field: { onChange: onChangeWeakness },
  } = useController({ name: 'data.weakness', control });

  const {
    field: { onChange: onChangeFeces },
  } = useController({ name: 'data.feces', control });

  const {
    field: { value: coughFrequency, onChange: onChangeCoughFrequency },
  } = useController({ name: 'data.cough.frequency', control });

  const {
    field: { onChange: onChangeCoughType },
  } = useController({ name: 'data.cough.type', control });

  const {
    field: { onChange: onChangeWomanPeriods },
  } = useController({ name: 'data.womanPeriods', control });

  const handleAdd = (event: React.SyntheticEvent) => {
    return handleSubmit((formValues) => {
      onAddParameter(formValues);
      reset(undefined, { keepDefaultValues: true });
    })(event);
  };

  const questionsField = useMemo(() => {
    const isFemale = user?.gender == 'female';

    const forms = [
      {
        type: 'headache',
        title: 'Как часто у вас за прошедший период наблюдались головные боли?',
        values: ['Не было', '1-2 дня', 'Более 3 дней'],
        onChange: onChangeHeadache,
      },
      {
        type: 'weakness',
        title: 'Как часто у Вас за прошедший период появлялось чувство слабости?',
        values: ['Не было', '1-2 дня', 'Более 3 дней'],
        onChange: onChangeWeakness,
      },
      {
        type: 'feces',
        title: 'Наблюдали ли вы отклонения в нормальном стуле?',
        values: ['Не было', 'Запоры', 'Камневидный', 'Зерновидный', 'Гуляшевидный', 'Диреи'],
        onChange: onChangeFeces,
      },
      {
        type: 'cough.frequency',
        title: 'Был ли у Вас за прошедший период кашель?',
        values: ['Не было', '1-2 дня', 'Более 3 дней'],
        onChange: onChangeCoughFrequency,
      },
      coughFrequency != 'Не было' && !isUndefined(coughFrequency)
        ? {
            type: 'cough.type',
            title: 'Какой тип кашля преобладал?',
            values: ['Сухой', 'Влажный'],
            onChange: onChangeCoughType,
          }
        : null,
      isFemale
        ? {
            type: 'womanPeriods',
            title: 'Отметьте Вашу текущую фазу менструального цикла',
            values: ['Менструальная', 'Фолликуоярная', 'Овуляторная', 'Лютеиновая'],
            onChange: onChangeWomanPeriods,
          }
        : null,
    ];
    return forms;
  }, [coughFrequency]);

  return (
    <form onSubmit={handleAdd}>
      <div className={classes.root}>
        <DialogContentText>Пожалуйста, выберете подходящий для вас вариант ответа в каждом вопросе</DialogContentText>

        {questionsField.map((form) => {
          if (!form) {
            return null;
          }
          return <AnswersGroup {...form} />;
        })}

        <TextField label="А ещё ..." size="medium" type="text" {...register('data.openField', { setValueAs: String })} />

        <LoadingButton loading={loading} type="submit">
          {edit ? 'Сохранить' : 'Добавить'}
        </LoadingButton>
      </div>
    </form>
  );
};
