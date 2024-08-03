import { useState } from 'react';

import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import BlockIcon from '@mui/icons-material/Block';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { IconButton, ListItemIcon, ListItemText, MenuItem } from '@mui/material';

import { User, UserWithDoctor } from '../../api';
import { useActivateUserRequest } from '../../api/use-activate-user-request';
import { useAssignPatientRequest } from '../../api/use-assign-patient-request';
import { useDeactivateUserRequest } from '../../api/use-deactivate-user-request';
import { useReassignPatientRequest } from '../../api/use-reassign-patient-request';
import { Menu, useWithNotification } from '../../ui-components';

import { AssignDoctorDialog } from './select-doctor-dialog';

type UserActionsMenu = {
  user: UserWithDoctor;
  onUserChange(user: Partial<UserWithDoctor>): void;
  onUserReassign(params: { fromDoctorId: string | null; toDoctor: User; user: User }): void;
};

export const UserActionsMenu = ({ user, onUserChange, onUserReassign }: UserActionsMenu) => {
  const { id: userId, role, email, deactivated } = user;
  const { withNotification } = useWithNotification();

  const { activateUser } = useActivateUserRequest({ onSuccess: onUserChange });

  const { deactivateUser } = useDeactivateUserRequest({ onSuccess: onUserChange });

  const { assignPatient } = useAssignPatientRequest();

  const { reassignPatient } = useReassignPatientRequest();

  const handleToggleActivateUser = async () => {
    return deactivated ? activateUser({ userId }) : deactivateUser({ userId });
  };

  const [assignDoctorDialogOpen, setAssignDoctorDialogOpen] = useState(false);

  const handleOpenAssignDoctorDialog = () => {
    setAssignDoctorDialogOpen(true);
  };

  const handleCloseAssignDoctorDialog = () => {
    setAssignDoctorDialogOpen(false);
  };

  const handleAssignPatient = async (doctor: User) => {
    const fromDoctorId = user.doctor?.id;

    if (fromDoctorId) {
      await reassignPatient({ userId, doctorId: doctor.id });
      onUserReassign({ fromDoctorId, toDoctor: doctor, user });
    } else {
      await assignPatient({ userId, doctorId: doctor.id });
      onUserReassign({ fromDoctorId: null, toDoctor: doctor, user });
    }
  };

  const copyToClipboard = withNotification(
    () => {
      navigator.clipboard.writeText(email);
    },
    { successMsg: 'Email успешно скопирован' },
  );

  const options = (() => {
    const baseOptions: { action: (...args: unknown[]) => unknown; title: string; icon: React.ReactNode }[] = [
      { action: copyToClipboard, icon: <ContentCopyIcon />, title: 'Копировать email' },
      { action: handleToggleActivateUser, icon: <BlockIcon />, title: deactivated ? 'Активировать' : 'Деактивировать' },
    ];

    if (role === 'user') {
      baseOptions.push({
        action: handleOpenAssignDoctorDialog,
        icon: <AssignmentIndIcon />,
        title: user.doctor ? 'Сменить врача' : 'Прикрепить к врачу',
      });
    }

    return baseOptions;
  })();

  return (
    <>
      <Menu
        options={options}
        renderOption={({ title, action, icon }) => (
          <MenuItem key={title} onClick={action}>
            <ListItemIcon>{icon}</ListItemIcon>

            <ListItemText>{title}</ListItemText>
          </MenuItem>
        )}
        renderButton={({ onClick }) => (
          <IconButton onClick={onClick}>
            <MoreHorizIcon />
          </IconButton>
        )}
      />

      <AssignDoctorDialog
        open={assignDoctorDialogOpen}
        defaultValue={user.doctor ?? null}
        onSubmit={handleAssignPatient}
        onClose={handleCloseAssignDoctorDialog}
      />
    </>
  );
};
