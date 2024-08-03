import { useCallback } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { makeStyles } from 'tss-react/mui';

import { MedicalParameter, useDeleteParameterRequest } from '../../../api';
import { useWithNotification } from '../../../ui-components';
import { parameterTypeToTitle } from '../../consts';

const useStyles = makeStyles()((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  paper: {
    borderRadius: theme.shape.borderRadius * 2,
  },
}));

type DeleteParameterModalProps = {
  open: boolean;
  parameter: Pick<MedicalParameter, 'id' | 'type'> | null;
  onClose?(): void;
  onDelete?(parameterId: string): void;
};

export const DeleteParameterModal = ({ open, parameter, onClose, onDelete }: DeleteParameterModalProps) => {
  const { classes } = useStyles();

  const { isLoading, deleteParameter } = useDeleteParameterRequest({
    onSuccess: () => onDelete?.(parameter!.id),
  });

  const { withNotification } = useWithNotification();

  const handleDeleteParameter = useCallback(() => {
    if (!parameter) return;

    const { id, type } = parameter;

    withNotification(() => deleteParameter({ parameterId: id }), {
      successMsg: `Параметр "${parameterTypeToTitle[type]}" успешно удален`,
      errorMsg: `Ошибка при удалении параметра "${parameterTypeToTitle[type]}"`,
    })();
  }, [parameter]);

  if (!parameter) return null;

  return (
    <Dialog classes={{ paper: classes.paper }} onClose={onClose} open={open}>
      <DialogTitle>Удаление параметра</DialogTitle>

      <DialogContent>
        <DialogContentText>{`Вы действительно хотите удалить параметр "${
          parameterTypeToTitle[parameter.type]
        }"?`}</DialogContentText>
      </DialogContent>

      <DialogActions>
        <LoadingButton loading={isLoading} onClick={handleDeleteParameter}>
          Удалить
        </LoadingButton>

        <Button autoFocus onClick={onClose}>
          Отмена
        </Button>
      </DialogActions>
    </Dialog>
  );
};
