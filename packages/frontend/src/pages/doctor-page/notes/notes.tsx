import { useCallback, useEffect, useState } from 'react';

import { isUndefined, uniqBy } from 'lodash';

import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, IconButton, Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { NoteType, useAddNoteRequest, useDeleteNoteRequest, useEditNoteRequest, useGetNotesRequest } from '../../../api';
import { useWithNotification } from '../../../ui-components';

import { InputNotes } from './notes-input';
import { ListNotes } from './notes-list';

const useStyles = makeStyles<void, 'actionsButtons'>()((theme, _, classes) => ({
  paper: {
    '&&&': {
      borderRadius: theme.shape.borderRadius * 2,
    },
    '&:before': {
      display: 'none',
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
    color: 'black',
    fontSize: '0.6rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    paddingRight: theme.spacing(2),
  },
  actions: {
    marginRight: theme.spacing(2),
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
    left: '50%',
    top: '50%',
    transform: 'translate(calc(-1 * 50% - 8px), -50%)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  actionButton: {
    width: 28,
    height: 28,
    padding: theme.spacing(0.25),
    '& svg': {
      width: 24,
      height: 24,
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

  notesTool: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    //flex: 1,
    width: 80,
    justifyContent: 'space-between',
  },
}));

type ParametersHistoryProps = {
  patientId: string;
};

export const Notes = ({ patientId }: ParametersHistoryProps) => {
  const { classes } = useStyles();

  const [notes, setNotes] = useState<NoteType[]>([]);

  const { withNotification } = useWithNotification();

  const notesSorted = (a: NoteType, b: NoteType) => {
    const a_measure = new Date(a.createdAt).getTime();
    const b_measure = new Date(b.createdAt).getTime();
    if (a_measure < b_measure) {
      return 1;
    }
    if (a_measure > b_measure) {
      return -1;
    }
    return 0;
  };

  //

  const { getNotes } = useGetNotesRequest({
    onSuccess: (data) => {
      setNotes((prevNotes) => uniqBy([...prevNotes, ...data], ({ id }) => id).sort(notesSorted));
    },
  });

  const refreshNotes = () => {
    if (!isUndefined(patientId)) {
      getNotes({ userId: patientId });
    }
  };

  useEffect(() => {
    refreshNotes();
  }, [patientId]);

  //

  const additionNote = (data: NoteType) => {
    setNotes((prevNotes) => [...prevNotes, data].sort(notesSorted));
  };
  const { addNote } = useAddNoteRequest({ onSuccess: additionNote });
  const addNoteWithNotification = useCallback(
    withNotification(addNote, {
      successMsg: () => `Заметка успешно добавлена`,
      errorMsg: () => `Ошибка при добавлении заметки`,
    }),
    [],
  );

  //

  const [toEditingNote, setToEditingNote] = useState<{ item: NoteType; et: HTMLButtonElement } | undefined>(undefined);

  const editingNote = (data: NoteType) => {
    setNotes((prevNotes) => {
      const newNotes = [...prevNotes];
      const currentIndex = prevNotes.findIndex((item) => item.id === data.id);
      newNotes[currentIndex] = data;
      return newNotes;
    });
  };
  const { editNote } = useEditNoteRequest({ onSuccess: editingNote });
  const editNoteWithNotification = useCallback(
    withNotification(editNote, {
      successMsg: () => `Заметка успешно обновлена`,
      errorMsg: () => `Ошибка при обновлении заметки`,
    }),
    [],
  );

  const addAndEdit = (newNote: NoteType) => {
    if (isUndefined(newNote?.id)) {
      addNoteWithNotification({
        userId: patientId,
        params: newNote,
      });
    } else {
      editNoteWithNotification({
        noteId: newNote.id,
        ...newNote,
      });
    }
  };

  //

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const deletion = ({ id }: { id: string }) => {
    setNotes((prevNotes) => prevNotes.filter((item) => item.id !== id));
    setSelectedIds([]);
  };
  const { deleteNote } = useDeleteNoteRequest({ onSuccess: deletion });
  const deleteNoteWithNotification = useCallback(
    withNotification(deleteNote, {
      successMsg: () => `Заметка успешно удалена`,
      errorMsg: () => `Ошибка при удалении заметки`,
    }),
    [],
  );

  const deleteNotes = (deletedIds: string[]) => {
    for (const delId of deletedIds) {
      deleteNoteWithNotification({ noteId: delId });
    }
  };

  //

  return (
    <>
      <Accordion classes={{ root: classes.paper }} disableGutters>
        <AccordionSummary classes={{ root: classes.accordion }} expandIcon={<ExpandMoreIcon />}>
          <header className={classes.header}>
            <Typography variant="h6">Заметки</Typography>

            <div className={classes.recordCount}>
              <Typography className={classes.count}>{notes.length}</Typography>
            </div>
          </header>
        </AccordionSummary>

        <AccordionDetails>
          <div
            style={{
              height: 50,
              flex: 1,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <InputNotes toAdd={addAndEdit} callValue={toEditingNote} setCallValue={setToEditingNote} />
            {selectedIds.length > 0 && (
              <div className={classes.notesTool}>
                <IconButton className={classes.actionButton} onClick={() => setSelectedIds([])}>
                  <CloseOutlinedIcon color="primary" />
                </IconButton>

                <IconButton className={classes.actionButton} onClick={() => deleteNotes(selectedIds)}>
                  <div className={classes.recordCount} style={{ position: 'absolute', marginLeft: 26, marginBottom: 26 }}>
                    <Typography className={classes.count}>{selectedIds.length}</Typography>
                  </div>
                  <DeleteOutlinedIcon color="primary" />
                </IconButton>
              </div>
            )}
          </div>
          <ListNotes
            notes={notes}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            toDelete={deleteNotes}
            toEdit={setToEditingNote}
          />
        </AccordionDetails>
      </Accordion>
    </>
  );
};
