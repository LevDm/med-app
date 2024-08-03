import { useCallback } from 'react';

import { useAuthContext } from '../auth-context';

import { NoteType } from './types';
import { UseFetch, useFetch } from './use-fetch';

type Parameters = {
  params: Omit<NoteType, 'id'>;
  userId: string;
};

export const useAddNoteRequest = (props?: UseFetch<NoteType>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const { getUser } = useAuthContext();

  const addNote = useCallback(({ params, userId }: Parameters) => {
    const doctorUser = getUser();

    if (!doctorUser && !userId) return;

    return fetchData(`/api/${doctorUser?.id}/notes/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
  }, []);

  return {
    addNote,
    ...rest,
  };
};
