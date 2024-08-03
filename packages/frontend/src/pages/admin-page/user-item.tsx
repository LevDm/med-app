import { Fragment, useEffect, useState } from 'react';

import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Chip, ChipProps, Divider, Tooltip, Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { User, UserWithDoctor } from '../../api';
import { getFullName } from '../../utils';
import { roleToTitleMap } from '../consts';

import { PatientItem } from './patient-item';
import { UserActionsMenu } from './user-actions-menu';

const useStyles = makeStyles()((theme) => ({
  accordion: {
    '&.Mui-focusVisible': {
      backgroundColor: 'transparent',
    },
  },
  root: {
    '&&&': {
      borderRadius: theme.shape.borderRadius * 2,
    },
    '&:before': {
      display: 'none',
    },
  },
  content: {
    paddingLeft: theme.spacing(0.5),
  },
  userRow: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandIcon: {
    position: 'absolute',
    right: 54,
  },
  userName: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  email: {
    marginLeft: theme.spacing(1),
    color: theme.palette.action.active,
  },
  disabled: {
    opacity: 0.54,
  },
}));

const roleToColorMap = {
  user: 'primary',
  doctor: 'success',
  admin: 'error',
} satisfies Record<UserWithDoctor['role'], ChipProps['color']>;

type UserItemProps = {
  user: UserWithDoctor;
  className?: string;
  onUserChange(user: Partial<UserWithDoctor>): void;
  onUserReassign(params: { fromDoctorId: string | null; toDoctor: User; user: User }): void;
};

export const UserItem = ({ className, user, onUserChange, onUserReassign }: UserItemProps) => {
  const { role, deactivated, email, users } = user;
  const { classes, cx } = useStyles();

  const [isOpen, setIsOpen] = useState(false);

  const canExpand = !!users.length;

  useEffect(() => {
    if (!users.length) setIsOpen(false);
  }, [users.length]);

  return (
    <Accordion
      expanded={isOpen}
      onChange={() => {
        if (users.length) {
          setIsOpen((prev) => !prev);
        }
      }}
      className={cx(classes.root, className, { [classes.disabled]: deactivated })}
      disableGutters
      {...(!canExpand && { expanded: false })}
    >
      <AccordionSummary
        classes={{ root: classes.accordion, expandIconWrapper: classes.expandIcon }}
        {...(canExpand && {
          expandIcon: <ExpandMoreIcon />,
        })}
      >
        <div className={classes.userRow}>
          <div className={classes.userName}>
            <Typography>{getFullName(user)}</Typography>

            <Chip size="small" color={roleToColorMap[role]} variant="outlined" label={roleToTitleMap[role]} />

            {user.doctor && (
              <Tooltip title={getFullName(user.doctor)}>
                <Chip
                  icon={<AssignmentIndIcon />}
                  size="small"
                  color={roleToColorMap[role]}
                  variant="outlined"
                  label="Прикреплен"
                />
              </Tooltip>
            )}

            <Typography className={classes.email}>{email}</Typography>
          </div>

          <div onClick={(event) => event.stopPropagation()}>
            <UserActionsMenu user={user} onUserChange={onUserChange} onUserReassign={onUserReassign} />
          </div>
        </div>
      </AccordionSummary>

      <AccordionDetails>
        <div className={classes.content}>
          {users.map((patient, index) => (
            <Fragment key={patient.id}>
              <PatientItem user={patient} doctor={user} onUserChange={onUserChange} onUserReassign={onUserReassign} />

              {index !== users.length - 1 && <Divider />}
            </Fragment>
          ))}
        </div>
      </AccordionDetails>
    </Accordion>
  );
};
