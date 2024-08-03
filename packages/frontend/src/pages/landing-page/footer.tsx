import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import { Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  root: {
    padding: theme.spacing(5, 0),
    display: 'flex',
    gap: theme.spacing(8),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      textAlign: 'center',
      gap: theme.spacing(4),
    },
  },
  link: {
    all: 'unset',
    cursor: 'pointer',
  },
  linkText: {
    fontWeight: 600,
    fontSize: 18,
    '&:hover': {
      opacity: 0.8,
    },
  },
  linkList: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      textAlign: 'center',
      gap: theme.spacing(1.5),
    },
  },
  contactList: {
    fontSize: 14,
    maxWidth: 350,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      maxWidth: 'auto',
      gap: theme.spacing(1.5),
    },
  },
  contactsHeader: {
    fontWeight: 600,
    fontSize: 18,
  },
  creds: {
    maxWidth: 350,
    color: '#bfbfd5',
    fontSize: 12,
    [theme.breakpoints.down('sm')]: {
      order: 2,
      maxWidth: 'auto',
    },
  },
  logo: {
    color: theme.palette.accent.main,
  },
  logoContainer: {
    display: 'inline-flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(1),
    },
  },
}));

const OuterLink = ({ children, href = '#' }: { children: React.ReactNode; href?: string }) => {
  const { classes } = useStyles();

  return (
    <a href={href} className={classes.link}>
      <Typography className={classes.linkText}>{children}</Typography>
    </a>
  );
};

export const Footer = () => {
  const { classes } = useStyles();
  return (
    <footer className={classes.root}>
      <div className={classes.creds}>
        <span className={classes.logoContainer}>
          <MonitorHeartIcon style={{ fontSize: 42 }} className={classes.logo} />

          <Typography>MedApp</Typography>
        </span>

        <Typography className={classes.creds}>
          ООО «МедАпп медицина» ИНН 1234567890, ОГРН 1234567890 123456, Россия, Екатеринбург, ул. Мира 32 MedApp!™ —
          зарегистрированная торговая марка В терминологии сайта, определение «Пациент» используется для обозначения пользователей
          приложения «MedApp», принявших соответствующую оферту
        </Typography>
      </div>

      <div className={classes.contactList}>
        <Typography className={classes.contactsHeader}>Контакты</Typography>

        <Typography>+7 123 456-78-90</Typography>

        <Typography>По всем вопросам и предложениям обращайтесь в службу поддержки</Typography>
      </div>

      <div className={classes.linkList}>
        <OuterLink>Врачам</OuterLink>

        <OuterLink>Документы</OuterLink>

        <OuterLink>Партнерам</OuterLink>
      </div>
    </footer>
  );
};
