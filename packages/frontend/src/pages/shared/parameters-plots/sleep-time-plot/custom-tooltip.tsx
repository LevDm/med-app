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

type Payload = {
  name: string;
  values: string[];
  times: number[];
  duration: number;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: { name: string; payload: Payload }[];
  label?: string;
  valueName?: string;
  numberToTime: (args: number) => string;
};

export const CustomTooltip = ({ active, payload, label, valueName = '', numberToTime }: CustomTooltipProps) => {
  const { classes } = useStyles();
  if (active && payload && payload.length) {
    const { duration = 0, times = [0, 0] } = payload[0].payload;
    return (
      <div className={classes.customTooltip}>
        <p className={classes.title}>{`${label}`}</p>
        <p className={classes.label}>{`Продолжительность: ${numberToTime(duration)}${valueName}`}</p>
        <p className={classes.label}>{`Начало: ${numberToTime(times[0])}${valueName}`}</p>
        <p className={classes.label}>{`Конец: ${numberToTime(times[1])}${valueName}`}</p>
      </div>
    );
  }

  return null;
};
