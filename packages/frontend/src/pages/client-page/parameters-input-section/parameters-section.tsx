import { Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { MedicalParameterType } from '../../../api';

const useStyles = makeStyles<{ color: string }>()((theme, { color }) => ({
  parameter: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(0.5),
    '&:hover': {
      color,
    },
  },
  parametersList: {
    display: 'grid',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1.5),
  },
  parametersTitle: {
    fontWeight: theme.typography.fontWeightMedium,
  },
}));

type ParameterSectionProps = {
  title: string;
  color: string;
  items: { title: string; type: MedicalParameterType | 'export'; icon: React.ReactNode }[];
  columnCount?: number;
  onClick(type: MedicalParameterType | 'export'): void;
};

export const ParametersSection = ({ title, color, items, columnCount, onClick }: ParameterSectionProps) => {
  const { classes } = useStyles({ color });

  return (
    <div>
      <Typography style={{ color }} className={classes.parametersTitle} variant="subtitle1">
        {title}
      </Typography>

      <div
        className={classes.parametersList}
        {...(columnCount && { style: { gridTemplateColumns: `repeat(${columnCount}, 1fr)` } })}
      >
        {items.map(({ title, type, icon }) => (
          <span key={title} className={classes.parameter} onClick={() => onClick(type)}>
            <span style={{ color }}>{icon}</span>

            <Typography variant="body2">{title}</Typography>
          </span>
        ))}
      </div>
    </div>
  );
};
