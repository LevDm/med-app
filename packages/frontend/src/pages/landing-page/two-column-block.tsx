import { Theme, Typography, useMediaQuery } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles<void, 'textBlock'>()((theme, _, classes) => ({
  root: {
    display: 'flex',
    marginBottom: theme.spacing(10),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  block: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    maxWidth: 500,
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      marginBottom: theme.spacing(4),
    },
  },
  textBlockTitle: {
    marginBottom: theme.spacing(3),
  },
  left: {
    [`${classes.textBlock}`]: {
      paddingRight: theme.spacing(10),
    },
  },
  right: {
    flexGrow: 1,
    [`${classes.textBlock}`]: {
      paddingLeft: theme.spacing(10),
    },
  },
}));

export const TextBlock = ({ title, description }: { title: React.ReactNode; description: React.ReactNode }) => {
  const { classes } = useStyles();

  return (
    <div className={classes.textBlock}>
      <Typography fontWeight="bold" variant="h5" className={classes.textBlockTitle}>
        {title}
      </Typography>

      {description}
    </div>
  );
};

export const TwoColumnBlock = ({ index, left, right }: { index: number; left: React.ReactNode; right: React.ReactNode }) => {
  const { classes, cx } = useStyles();

  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const isEven = index % 2 === 0;

  return (
    <div className={classes.root}>
      <div style={{ ...(isSmallScreen && { order: isEven ? '1' : '0' }) }} className={cx(classes.block, classes.left)}>
        {left}
      </div>

      <div className={cx(classes.block, classes.right)}>{right}</div>
    </div>
  );
};
