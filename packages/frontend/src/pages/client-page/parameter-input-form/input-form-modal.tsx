import { useMemo, useRef } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';

import { makeStyles } from 'tss-react/mui';

import { MedicalParameterByType, MedicalParameterType } from '../../../api';
import { parameterTypeToTitle } from '../../consts';

import { AppleWatchExportForm } from './apple-watch-export-form';
import { MassForm } from './mass-form';
import { PressureForm } from './pressure-form';
import { PulseForm } from './pulse-form';
import { QuestionsForm } from './questions-form';
import { RespirationForm } from './respiration-form';
import { SaturationForm } from './saturation-form';
import { SleepForm } from './sleep-form';
import { StepsForm } from './steps-form';
import { TemperatureForm } from './temperature-form';
import { WorkoutForm } from './workout-form';

const useStyles = makeStyles()((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  paper: {
    borderRadius: theme.shape.borderRadius * 2,
  },
  title: {
    padding: theme.spacing(2, 2, 0, 2),
  },
}));

const typeToComponent = {
  steps: StepsForm,
  pulse: PulseForm,
  sleep: SleepForm,
  saturation: SaturationForm,
  respiration: RespirationForm,
  pressure: PressureForm,
  mass: MassForm,
  temperature: TemperatureForm,
  workout: WorkoutForm,
  form: QuestionsForm,
  export: AppleWatchExportForm,
} satisfies Record<MedicalParameterType | 'export', unknown>;

type FormComponent<T extends MedicalParameterType> = React.ComponentType<{
  edit?: boolean;
  loading?: boolean;
  defaultValues?: Omit<MedicalParameterByType<T>, 'type'>;
  onAddParameter(parameter: MedicalParameterByType<T>): void;
  refetchParameters?(): void;
}>;

type InputFormModalProps<T extends MedicalParameterType> = {
  edit?: boolean;
  loading?: boolean;
  open: boolean;
  type: T | null;
  onClose?(): void;
  onAddParameter(parameter: MedicalParameterByType<T>): void;
  defaultValues?: MedicalParameterByType<T>;
  refetchParameters?(): void;
};

export const InputFormModal = <T extends MedicalParameterType>({
  edit,
  loading,
  open,
  type,
  onClose,
  defaultValues,
  onAddParameter,
  refetchParameters,
}: InputFormModalProps<T>) => {
  const { classes } = useStyles();

  const prevContent = useRef<{
    title: string;
    Component: FormComponent<T>;
  } | null>(null);

  const {
    Component,
    title,
  }: {
    Component: FormComponent<T> | null;
    title: string | null;
  } = useMemo(() => {
    if (!open && prevContent.current) {
      return prevContent.current;
    }

    const Component = type ? (typeToComponent[type] as FormComponent<T>) : null;
    const title = type ? parameterTypeToTitle[type] : null;

    return { Component, title };
  }, [type]);

  if (Component && title) {
    prevContent.current = { Component, title };
  }

  return (
    <Dialog classes={{ paper: classes.paper }} onClose={onClose} open={open}>
      <DialogTitle className={classes.title}>{title}</DialogTitle>

      {Component && (
        <div className={classes.root}>
          <Component
            edit={edit}
            loading={loading}
            defaultValues={defaultValues}
            refetchParameters={refetchParameters}
            onAddParameter={onAddParameter}
          />
        </div>
      )}
    </Dialog>
  );
};
