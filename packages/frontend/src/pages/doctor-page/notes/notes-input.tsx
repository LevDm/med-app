import React, { useEffect, useState } from 'react';

import { isNull, isUndefined } from 'lodash';

import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { IconButton, TextField } from '@mui/material';
import Popover from '@mui/material/Popover';

import { makeStyles } from 'tss-react/mui';

import { NoteType } from '../../../api';

const useStyles = makeStyles()((theme) => ({
  popoverContent: {
    padding: theme.spacing(0.8),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.2),
    alignItems: 'center',
  },
  sendButton: {
    height: 30,
    width: 'auto',
    borderRadius: theme.shape.borderRadius,
    fontSize: 16,
  },
}));

type InputNoteProps = {
  toAdd?: (value: NoteType) => void;
  callValue?: { item: NoteType; et: HTMLButtonElement };
  setCallValue: (value: undefined) => void;
};

export function InputNotes({ toAdd, callValue, setCallValue }: InputNoteProps) {
  const { classes } = useStyles();

  const [noteContent, setNoteContent] = useState<{ text: string; title: string }>({
    title: callValue?.item.title ?? '',
    text: callValue?.item.text ?? '',
  });

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    const newContent = { title: callValue?.item.title ?? '', text: callValue?.item.text ?? '' };
    if (JSON.stringify(newContent) != JSON.stringify(noteContent)) {
      setNoteContent(newContent);
    }
    if (isNull(anchorEl) && !isUndefined(callValue)) {
      setAnchorEl(callValue?.et ?? null);
    }
  }, [callValue]);

  const sendNote = () => {
    if (noteContent.title === '') {
      return;
    }

    const newNote = {
      id: callValue?.item.id,
      ...noteContent,
      createdAt: callValue?.item.createdAt ?? new Date().toISOString(),
    } as NoteType;

    contentReset();

    toAdd?.(newNote);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const contentReset = () => {
    setAnchorEl(null);
    setNoteContent({ title: '', text: '' });
    setCallValue(undefined);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div>
      <IconButton aria-describedby={id} onClick={handleClick}>
        <AddIcon color="primary" />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={contentReset}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: isUndefined(callValue) ? 'left' : 'center',
        }}
      >
        <div className={classes.popoverContent}>
          <TextField
            label="Заголовок заметки"
            fullWidth
            variant="standard"
            value={noteContent.title}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setNoteContent((prevContent) => ({ ...prevContent, title: event.target.value }));
            }}
          />
          <TextField
            label="Текст заметки"
            fullWidth
            multiline
            rows={3}
            value={noteContent.text}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setNoteContent((prevContent) => ({ ...prevContent, text: event.target.value }));
            }}
          />
          <IconButton className={classes.sendButton} onClick={sendNote} color="primary">
            {(isUndefined(callValue) && (
              <>
                <AddIcon /> {'Добавить'}
              </>
            )) || (
              <>
                <EditOutlinedIcon /> {'Редактировать'}
              </>
            )}
          </IconButton>
        </div>
      </Popover>
    </div>
  );
}
