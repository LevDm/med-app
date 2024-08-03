import { Paper } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  root: {
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(2),
  },
}));

type IslandProps = {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode | React.ReactNode[];
  elevation?: number;
  onClick?(): void;
};

export const Island = ({ style, className, children, elevation = 1, onClick }: IslandProps) => {
  const { classes, cx } = useStyles();

  return (
    <Paper onClick={onClick} component="section" style={style} className={cx(classes.root, className)} elevation={elevation}>
      {children}
    </Paper>
  );
};
