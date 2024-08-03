import { capitalize } from 'lodash';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import { Avatar, IconButton, MenuItem, Typography } from '@mui/material';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { makeStyles } from 'tss-react/mui';

import { useUser } from '../auth-context';

import { Menu } from './menu';

const useStyles = makeStyles()((theme) => ({
  root: {
    position: 'sticky',
    top: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    padding: theme.spacing(1.5, 4),
    backgroundColor: 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid #b6b7ba',
    zIndex: theme.zIndex.appBar,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1.5),
    },
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      gap: theme.spacing(1),
    },
  },
  appNameStart: {
    color: theme.palette.accent.main,
  },
  appNameEnd: {
    color: theme.palette.primary.main,
  },
  logo: {
    color: theme.palette.accent.main,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(3),
  },
  userAvatar: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  title: {
    marginRight: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      fontSize: 24,
    },
  },
}));

export const PageHeader = ({
  options,
  left,
  right,
}: {
  right?: React.ReactNode;
  left?: React.ReactNode;
  options?: { action: () => void; title: string }[];
}) => {
  const { classes } = useStyles();

  const user = useUser();

  const firstName = capitalize(user?.firstName ?? '');
  const lastName = capitalize(user?.lastName ?? '');
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  return (
    <header className={classes.root}>
      <span className={classes.headerLeft}>
        <MonitorHeartIcon style={{ fontSize: 42 }} className={classes.logo} />

        <Typography className={classes.title} variant="h4">
          <span className={classes.appNameStart}>Med</span>
          <span className={classes.appNameEnd}>App</span>
        </Typography>

        {left}
      </span>

      <span className={classes.headerRight}>
        {right}

        {!!user && (
          <span className={classes.userAvatar}>
            <Avatar sx={{ width: 32, height: 32, fontSize: '0.9rem' }}>{`${lastName[0] ?? ''}${firstName[0] ?? ''}`}</Avatar>

            {!isSmallScreen && <Typography>{`${firstName} ${lastName}`}</Typography>}

            {options && (
              <Menu
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                options={options}
                renderOption={({ title, action }) => (
                  <MenuItem key={title} onClick={action}>
                    {title}
                  </MenuItem>
                )}
                renderButton={({ open, onClick }) => (
                  <IconButton onClick={onClick} disableRipple>
                    <ExpandMoreIcon {...(open && { style: { transform: 'rotate(180deg)' } })} color="action" />
                  </IconButton>
                )}
              />
            )}
          </span>
        )}
      </span>
    </header>
  );
};
