import { useCallback } from 'react';

import { UseFetch, useFetch } from './use-fetch';

type Parameters = { noteId: string };

export const useDeleteNoteRequest = (props?: UseFetch<{ id: string }>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const deleteNote = useCallback(
    ({ noteId }: Parameters) => {
      if (!noteId) return;

      return fetchData(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });
    },
    [fetchData],
  );

  return {
    deleteNote,
    ...rest,
  };
};
