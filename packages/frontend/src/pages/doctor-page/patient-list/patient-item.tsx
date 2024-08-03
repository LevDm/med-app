import ErrorIcon from '@mui/icons-material/Error';
import MessageIcon from '@mui/icons-material/Message';
import { Badge, Tooltip, Typography } from '@mui/material';

import { differenceInDays, format } from 'date-fns';
import { makeStyles } from 'tss-react/mui';

import { User, UserWithDoctor } from '../../../api';
import { Island } from '../../../ui-components';
import { getFullName } from '../../../utils';

const useStyles = makeStyles<{ selected: boolean }>()((theme, { selected }) => ({
  userRow: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  paper: {
    cursor: 'pointer',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'transparent',
    ...(selected && { borderColor: theme.palette.primary.main }),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  lastCheck: {
    color: theme.palette.action.active,
  },
  leftSide: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  messages: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.main,
    fontSize: 9,
    height: 12,
    minHeight: 12,
    maxHeight: 12,
    width: 12,
    maxWidth: 12,
    minWidth: 12,
  },
}));

type PatientItemProps = {
  user: UserWithDoctor;
  selected: boolean;
  onClick(user: User): void;
};

export const PatientItem = ({ selected, user, onClick }: PatientItemProps) => {
  const { classes } = useStyles({ selected });

  const checkupDate = user.lastCheckDate ? new Date(user.lastCheckDate) : null;
  const needCheckUp = !checkupDate || differenceInDays(checkupDate, new Date()) >= 14;

  return (
    <Island className={classes.paper} onClick={() => onClick(user)}>
      <div className={classes.userRow}>
        <div className={classes.leftSide}>
          <Typography className={classes.userName}>{getFullName(user)}</Typography>

          {needCheckUp && (
            <Tooltip title="Пациент нуждается в проверке">
              <ErrorIcon color="primary" />
            </Tooltip>
          )}

          {!!user.unreadMessageCount && (
            <Tooltip title="Непрочитанные сообщения">
              <Badge classes={{ badge: classes.messages }} badgeContent={user.unreadMessageCount}>
                <MessageIcon fontSize="small" color="action" />
              </Badge>
            </Tooltip>
          )}
        </div>

        <Typography className={classes.lastCheck}>{`Дата проверки: ${
          checkupDate ? format(checkupDate, 'dd.MM') : 'Нет'
        }`}</Typography>
      </div>
    </Island>
  );
};
