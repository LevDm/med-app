import { useCallback } from 'react';

import { NoteType } from './types';
import { UseFetch, useFetch } from './use-fetch';

type Parameters = Pick<NoteType, 'title' | 'text' | 'createdAt'> & { noteId: string };

export const useEditNoteRequest = (props?: UseFetch<NoteType>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const editNote = useCallback(({ noteId, title, text, createdAt }: Parameters) => {
    if (!noteId) return;

    return fetchData(`/api/notes/${noteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, text, createdAt }),
    });
  }, []);

  return {
    editNote,
    ...rest,
  };
};
