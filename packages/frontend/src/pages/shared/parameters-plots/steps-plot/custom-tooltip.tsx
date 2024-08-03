import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  customTooltip: {
    backgroundColor: `${theme.palette.info.main}d8`,
    borderRadius: theme.shape.borderRadius,
    padding: 8,
    alignItems: 'flex-start',
  },
  title: {
    color: theme.palette.info.contrastText,
    fontWeight: 500,
  },
  label: {
    color: theme.palette.info.contrastText,
    fontWeight: 400,
  },
}));

type payload = {
  step: number;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: { payload: payload }[];
  label?: string;
  valueName?: string;
};

export const CustomTooltip = ({ active, payload, label, valueName = '' }: CustomTooltipProps) => {
  const { classes } = useStyles();

  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={classes.customTooltip}>
        <p className={classes.title}>{`${label}`}</p>
        <p className={classes.label}>{`Значение: ${data.step}${valueName}`}</p>
      </div>
    );
  }

  return null;
};
