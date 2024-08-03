import { useCallback } from 'react';

import { useAuthContext } from '../auth-context';

import { NoteType } from './types';
import { UseFetch, useFetch } from './use-fetch';

type Parameters = {
  userId?: string | null;
  doctorId?: string | null;
};

export type GetNotesReturn = NoteType[];

export const useGetNotesRequest = (props?: UseFetch<GetNotesReturn>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const { getUser } = useAuthContext();

  const getNotes = useCallback(({ doctorId, userId }: Parameters = {}) => {
    const userDoctor = getUser();

    if (!userDoctor && !doctorId) return;

    return fetchData(`/api/${doctorId ?? userDoctor?.id}/notes/${userId ?? ''}`);
  }, []);

  return {
    getNotes: getNotes,
    ...rest,
  };
};
