import { Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  root: {
    backgroundColor: '#ebebf6',
    padding: theme.spacing(2, 2, 3, 2),
    borderRadius: theme.shape.borderRadius * 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 500,
    margin: theme.spacing(2, 0),
    fontFamily: "'Montserrat', sans-serif",
  },
  description: {
    fontSize: 15,
  },
  icon: {
    width: 50,
    height: 50,
    '& > svg': {
      fill: theme.palette.primary.main,
      width: 50,
      height: 50,
    },
  },
}));

export const PromoCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
}) => {
  const { classes } = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.icon}>{icon}</div>

      <Typography variant="h6" className={classes.title}>
        {title}
      </Typography>

      {description}
    </div>
  );
};
