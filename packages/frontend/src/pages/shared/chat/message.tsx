import { Ref } from 'react';

import { format, parseISO } from 'date-fns';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles<{ variant: 'right' | 'left' }>()((theme, { variant }) => ({
  wrap: {
    paddingBottom: theme.spacing(3),
    ...(variant === 'right' && { marginLeft: theme.spacing(8) }),
    ...(variant === 'left' && { marginRight: theme.spacing(8) }),
  },
  root: {
    padding: theme.spacing(1.5),
    paddingBottom: theme.spacing(2),
    position: 'relative',
    borderRadius: theme.shape.borderRadius * 4,
    ...(variant === 'right' && { borderBottomRightRadius: 0 }),
    ...(variant === 'left' && { borderBottomLeftRadius: 0 }),
    backgroundColor: variant === 'left' ? '#f4f4f4' : '#CECEF9',
  },
  time: {
    position: 'absolute',
    fontSize: 12,
    right: theme.spacing(1.5),
    bottom: theme.spacing(0.25),
    color: theme.palette.grey[600],
  },
}));

export const Message = ({
  id,
  messageRef,
  children,
  variant,
  time,
}: {
  id: string;
  variant: 'left' | 'right';
  time: string;
  children: React.ReactNode;
  messageRef?: Ref<HTMLDivElement>;
}) => {
  const { classes } = useStyles({ variant });

  return (
    <div data-id={id} ref={messageRef} className={classes.wrap}>
      <div className={classes.root}>
        <p style={{ margin: 0, wordWrap: 'break-word' }}>
          <span>{children}</span>

          <span className={classes.time}>{format(parseISO(time), 'HH:mm')}</span>
        </p>
      </div>
    </div>
  );
};
