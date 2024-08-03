import { useEffect, useState } from 'react';

import { isArray } from 'lodash';

import { Autocomplete, Button, TextField } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';

import { makeStyles } from 'tss-react/mui';

import { User, useSearchUsersRequest } from '../../api';
import { getFullName } from '../../utils';

const useStyles = makeStyles()((theme) => ({
  container: {
    padding: theme.spacing(2),
  },
  paper: {
    borderRadius: theme.shape.borderRadius * 2,
    minHeight: 200,
    minWidth: 250,
  },
  title: {
    padding: theme.spacing(2, 2, 0, 2),
  },
  button: {
    marginTop: 'auto',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

type AssignDoctorDialog = {
  open: boolean;
  onClose(): void;
  defaultValue?: User;
  onSubmit(doctor: User): void;
};

export const AssignDoctorDialog = ({ open, onClose, onSubmit, defaultValue }: AssignDoctorDialog) => {
  const { classes } = useStyles();

  const [doctor, setDoctor] = useState<User | null>(defaultValue ?? null);

  const [doctorList, setDoctorList] = useState<User[]>([]);

  const { isLoading, searchUsers } = useSearchUsersRequest({
    onSuccess: (data) => {
      setDoctorList(isArray(data) ? data : data.items);
    },
  });

  useEffect(() => {
    if (!open) {
      setDoctorList([]);
    }
  }, [open]);

  const handleInput = (_: unknown, value: string) => {
    if (value) {
      searchUsers({ search: value, role: 'doctor' });
    } else {
      setDoctorList([]);
    }
  };

  const handleAutocompleteChange = (_: unknown, doctor: User | null) => {
    setDoctor(doctor);
  };

  const handleSubmit = () => {
    if (doctor) {
      onSubmit(doctor);
      onClose();
    }
  };

  return (
    <Dialog classes={{ paper: classes.paper }} onClose={onClose} open={open}>
      <DialogTitle className={classes.title}>Выберите врача</DialogTitle>

      <div className={classes.container}>
        <Autocomplete
          size="small"
          loading={isLoading}
          noOptionsText="Не удалось найти"
          defaultValue={defaultValue ?? null}
          getOptionLabel={(doctor) => (doctor ? getFullName(doctor) : '')}
          onChange={handleAutocompleteChange}
          onInputChange={handleInput}
          options={doctorList}
          renderInput={(params) => (
            <TextField defaultValue={defaultValue ? getFullName(defaultValue) : ''} {...params} label="Врач" />
          )}
        />
      </div>

      <Button className={classes.button} type="button" onClick={handleSubmit} disabled={!doctor || doctor === defaultValue}>
        {defaultValue ? 'Сменить' : 'Прикрепить'}
      </Button>
    </Dialog>
  );
};
