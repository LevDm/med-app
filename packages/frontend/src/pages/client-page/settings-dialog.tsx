import { useEffect, useRef, useState } from 'react';

import { Button, CircularProgress, TextField } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';

import { makeStyles } from 'tss-react/mui';

import { useAddShareLinkRequest, useDeleteShareLinkRequest, useGetShareLinkRequest, useUpdateShareLinkRequest } from '../../api';
import { useWithNotification } from '../../ui-components';

const useStyles = makeStyles()((theme) => ({
  paper: {
    borderRadius: theme.shape.borderRadius * 2,
    minWidth: 350,
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  title: {
    padding: theme.spacing(0, 0, 2, 0),
  },
}));

export const SettingsDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { classes } = useStyles();

  const { withNotification } = useWithNotification();

  const [link, setLink] = useState('');
  const isExists = useRef(false);

  const { getShareLink, isLoading: isLoadingGetLink } = useGetShareLinkRequest({
    onSuccess: ({ shareLink }) => {
      if (shareLink) {
        setLink(shareLink);
        isExists.current = true;
      }
    },
  });

  const { addShareLink, isLoading: isLoadingAddLink } = useAddShareLinkRequest({ onSuccess: () => (isExists.current = true) });
  const { deleteShareLink, isLoading: isDeletingLink } = useDeleteShareLinkRequest({
    onSuccess: () => (isExists.current = false),
  });
  const { updateShareLink, isLoading: isUpdatingLink } = useUpdateShareLinkRequest();

  const addLink = withNotification(addShareLink, { successMsg: 'Ссылка для синхронизации успешно добавлена' });
  const deleteLink = withNotification(deleteShareLink, { successMsg: 'Ссылка для синхронизации успешно удалена' });
  const updateLink = withNotification(updateShareLink, { successMsg: 'Ссылка для синхронизации успешно обновлена' });

  const handleLinkChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setLink(target.value);
  };

  const handleSave = () => {
    const exists = isExists.current;

    if (exists && !link) {
      deleteLink();
      return;
    }

    if (!exists && link) {
      addLink({ shareLink: link });
    }

    if (exists && link) {
      updateLink({ shareLink: link });
    }
  };

  useEffect(() => {
    getShareLink();
  }, []);

  const isLoading = isLoadingGetLink || isLoadingAddLink || isDeletingLink || isUpdatingLink;

  return (
    <Dialog classes={{ paper: classes.paper }} onClose={onClose} open={open}>
      <DialogTitle className={classes.title}>Настройки</DialogTitle>

      <TextField label="Ссылка для синхронизации данных" value={link} onChange={handleLinkChange} fullWidth />

      <Button
        startIcon={isLoading ? <CircularProgress color="info" size={16} /> : undefined}
        type="button"
        onClick={handleSave}
        disabled={isLoading}
      >
        Сохранить
      </Button>
    </Dialog>
  );
};
