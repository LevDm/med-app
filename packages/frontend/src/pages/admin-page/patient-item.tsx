import { useState } from 'react';

import BlockIcon from '@mui/icons-material/Block';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { IconButton, Tooltip, Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import {
  User,
  useActivateUserRequest,
  useAssignPatientRequest,
  useDeactivateUserRequest,
  useReassignPatientRequest,
} from '../../api';
import { useWithNotification } from '../../ui-components';
import { getFullName } from '../../utils';

import { AssignDoctorDialog } from './select-doctor-dialog';

const useStyles = makeStyles()((theme) => ({
  patientRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 0),
  },
  email: {
    color: theme.palette.action.active,
  },
  disabled: {
    opacity: 0.54,
  },
  icons: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
}));

type PatientItemProps = {
  user: User;
  doctor: User;
  className?: string;
  onUserChange(user: Partial<User>): void;
  onUserReassign(params: { fromDoctorId: string | null; toDoctor: User; user: User }): void;
};

export const PatientItem = ({ user, doctor, onUserChange, onUserReassign }: PatientItemProps) => {
  const { id, deactivated, email } = user;
  const { classes, cx } = useStyles();

  const { withNotification } = useWithNotification();

  const { deactivateUser } = useDeactivateUserRequest({ onSuccess: (user) => onUserChange(user) });
  const { activateUser } = useActivateUserRequest({ onSuccess: (user) => onUserChange(user) });

  const { assignPatient } = useAssignPatientRequest();

  const { reassignPatient } = useReassignPatientRequest();

  const copyToClipboard = withNotification(
    () => {
      navigator.clipboard.writeText(email);
    },
    { successMsg: 'Email успешно скопирован' },
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAssignPatient = async (newDoctor: User) => {
    const fromDoctorId = doctor.id;

    if (fromDoctorId) {
      await reassignPatient({ userId: id, doctorId: newDoctor.id });
      onUserReassign({ fromDoctorId, toDoctor: newDoctor, user });
    } else {
      await assignPatient({ userId: id, doctorId: newDoctor.id });
      onUserReassign({ fromDoctorId: null, toDoctor: newDoctor, user });
    }
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className={cx(classes.patientRow, { [classes.disabled]: deactivated })}>
        <div>
          <Typography key={id}>{getFullName(user)}</Typography>

          <Typography className={classes.email}>{email}</Typography>
        </div>

        <div className={classes.icons}>
          <Tooltip title="Копировать email">
            <IconButton size="small" onClick={copyToClipboard}>
              <ContentCopyIcon fontSize="small" color="action" />
            </IconButton>
          </Tooltip>

          <Tooltip title={deactivated ? 'Активировать' : 'Деактивировать'}>
            <IconButton
              size="small"
              onClick={() => (deactivated ? activateUser({ userId: id }) : deactivateUser({ userId: id }))}
            >
              <BlockIcon fontSize="small" color="action" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Сменить врача" onClick={handleOpenDialog}>
            <IconButton size="small">
              <SwapHorizIcon fontSize="small" color="action" />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      <AssignDoctorDialog open={isDialogOpen} defaultValue={doctor} onClose={handleCloseDialog} onSubmit={handleAssignPatient} />
    </>
  );
};
