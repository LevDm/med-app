import { VirtuosoGrid } from 'react-virtuoso';

import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { IconButton, Typography } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';

import { format } from 'date-fns';
import { makeStyles } from 'tss-react/mui';

import { NoteType } from '../../../api';

const useStyles = makeStyles<void, 'actionsButtons'>()((theme, _, classes) => ({
  paper: {
    '&&&': {
      borderRadius: theme.shape.borderRadius * 2,
    },
  },
  accordion: {
    '&.Mui-focusVisible': {
      backgroundColor: 'transparent',
    },
  },
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  iconButton: {
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: theme.palette.primary.light,
  },
  parameterName: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  recordCount: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.light,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  count: {
    fontSize: '0.6rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    paddingRight: theme.spacing(2),
  },
  actions: {
    //marginRight: theme.spacing(2),
    cursor: 'pointer',
    [`&:hover`]: {
      visibility: 'hidden',
    },
    [`&:hover .${classes.actionsButtons}`]: {
      visibility: 'visible',
    },
  },
  actionsButtons: {
    visibility: 'hidden',
    position: 'absolute',
    right: '1%',
    //top: '50%',
    //transform: 'translate(calc(0), -50%)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  actionButton: {
    width: 24,
    height: 24,
    padding: theme.spacing(0.25),
    '& svg': {
      width: 20,
      height: 20,
    },
  },
  filterButton: {
    marginLeft: 'auto',
  },
  tableHeader: {
    backgroundColor: theme.palette.common.white,
    paddingBottom: theme.spacing(1),
  },
  syncData: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    marginRight: theme.spacing(1),
  },

  noteButton: {
    height: 100,
    width: '100%',
  },

  ListContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  ItemContainer: {
    padding: 6,
    width: '33%',
    minHeight: 240,
    display: 'flex',
    flex: 'none',
    alignContent: 'stretch',
    boxSizing: 'border-box',

    '@media (max-width: 1440px)': {
      width: '50%',
    },
    '@media (max-width: 720px)': {
      width: '100%',
    },
  },
  ItemWrapper: {
    flex: 1,
    textAlign: 'left',
    fontSize: '80%',
    padding: theme.spacing(1),
    border: theme.shape.borderRadius,
    whiteSpace: 'nowrap',
  },

  checkBox: {
    height: 18,
    width: 18,
  },
}));

type ListNotesProps = {
  notes: NoteType[];
  selectedIds: string[];
  setSelectedIds: (value: string[]) => void;
  toDelete: (value: string[]) => void;
  toEdit: (value: { item: NoteType; et: HTMLButtonElement } | undefined) => void;
};

export function ListNotes({ notes, selectedIds, setSelectedIds, toDelete, toEdit }: ListNotesProps) {
  const handleToggle = (value: string) => {
    const currentIndex = selectedIds.indexOf(value);
    const newChecked = [...selectedIds];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setSelectedIds(newChecked);
  };

  const { classes } = useStyles();

  const renderNote = (_: number, item: NoteType) => {
    return <NoteItem item={item} selectedIds={selectedIds} handleToggle={handleToggle} toEdit={toEdit} toDelete={toDelete} />;
  };

  return (
    <VirtuosoGrid
      style={{ height: 400 }}
      data={notes}
      listClassName={classes.ListContainer}
      itemClassName={classes.ItemContainer}
      itemContent={renderNote}
    />
  );
}

type NoteItemProps = Pick<ListNotesProps, 'selectedIds' | 'toEdit' | 'toDelete'> & {
  item: NoteType;
  handleToggle: (value: string) => void;
};

const NoteItem = ({ item, selectedIds, handleToggle, toEdit, toDelete }: NoteItemProps) => {
  const { classes } = useStyles();

  const { id, text, title, createdAt } = item;

  const isSelectMod = selectedIds.length > 0;
  return (
    <Paper key={id} className={classes.ItemWrapper} elevation={1}>
      <div
        style={{
          minHeight: 30,
          flex: 1,
          display: 'flex',
          //flexDirection: 'row',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        <Typography style={{ fontWeight: 'bold' }}>{title}</Typography>
        {(isSelectMod && (
          <IconButton className={classes.checkBox} onClick={() => (isSelectMod ? handleToggle(id) : null)}>
            <Checkbox edge="start" checked={selectedIds.indexOf(id) !== -1} tabIndex={-1} disableRipple />
          </IconButton>
        )) || (
          <span className={classes.actions}>
            <MoreHorizIcon />
            <span className={classes.actionsButtons}>
              <IconButton className={classes.actionButton} onClick={() => handleToggle(id)}>
                <CheckBoxOutlinedIcon color="primary" />
              </IconButton>

              <IconButton
                className={classes.actionButton}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => toEdit({ item: item, et: event.currentTarget })}
              >
                <EditOutlinedIcon color="primary" />
              </IconButton>

              <IconButton className={classes.actionButton} onClick={() => toDelete([id])}>
                <DeleteOutlinedIcon color="primary" />
              </IconButton>
            </span>
          </span>
        )}
      </div>
      <Typography style={{ fontSize: 12, color: 'grey' }}>{format(new Date(createdAt), 'dd.MM.Y HH:mm')}</Typography>
      <Typography style={{ marginTop: 6 }}>{text}</Typography>
    </Paper>
  );
};
