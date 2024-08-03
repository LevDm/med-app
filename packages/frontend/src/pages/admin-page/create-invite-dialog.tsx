import { useEffect, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { Button, CircularProgress, IconButton, Paper, TextField, Tooltip } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { addDays, isValid } from 'date-fns';
import ruLocale from 'date-fns/locale/ru';
import { makeStyles } from 'tss-react/mui';

import { useCreateInviteRequest } from '../../api';
import { useWithNotification } from '../../ui-components';

const useStyles = makeStyles()((theme) => ({
  paper: {
    borderRadius: theme.shape.borderRadius * 2,
    minHeight: 220,
    minWidth: 300,
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  title: {
    padding: theme.spacing(0, 0, 2, 0),
  },
  button: {
    marginTop: 'auto',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  addIcon: {
    borderRadius: '50%',
  },
}));

export const CreateInviteDialog = () => {
  const { classes } = useStyles();

  const { withNotification } = useWithNotification();

  const [isOpen, setIsOpen] = useState(false);
  const [expiredAt, setExpireAt] = useState<Date | null>(() => addDays(new Date(), 14));
  const [link, setLink] = useState('');

  const { createInvite, isLoading } = useCreateInviteRequest({
    onSuccess: ({ id }) => {
      withNotification(
        async () => {
          const link = `${window.location.protocol}//${window.location.hostname}/signup?invite=${id}`;
          setLink(link);
          await navigator.clipboard.writeText(link);
        },
        { successMsg: 'Ссылка скопирована в буффер обмена' },
      )();
    },
  });

  const handleCreateInvite = () => {
    if (expiredAt && isValid(expiredAt)) {
      createInvite({ expiredAt });
    }
  };

  const handleExpireAtChange = (date: Date | null) => {
    setExpireAt(date);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) {
      setLink('');
      setExpireAt(addDays(new Date(), 14));
    }
  }, [isOpen]);

  return (
    <>
      <Paper className={classes.addIcon}>
        <Tooltip title="Пригласить врача">
          <IconButton onClick={handleOpen}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Paper>

      <Dialog classes={{ paper: classes.paper }} onClose={handleClose} open={isOpen}>
        <DialogTitle className={classes.title}>Создание приглашения</DialogTitle>

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ruLocale}>
          <DateTimePicker label="Действительно до" value={expiredAt} onChange={handleExpireAtChange} />
        </LocalizationProvider>

        <TextField value={link} disabled fullWidth />

        <Button
          className={classes.button}
          startIcon={isLoading ? <CircularProgress color="info" size={16} /> : undefined}
          type="button"
          onClick={handleCreateInvite}
          disabled={isLoading || !expiredAt || !isValid(expiredAt)}
        >
          Создать приглашение
        </Button>
      </Dialog>
    </>
  );
};
