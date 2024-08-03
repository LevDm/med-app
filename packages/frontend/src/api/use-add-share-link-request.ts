import { useCallback } from 'react';

import { useAuthContext } from '../auth-context';

import { UseFetch, useFetch } from './use-fetch';

type Parameters = { shareLink: string };

export const useAddShareLinkRequest = (props?: UseFetch<unknown>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const { getUser } = useAuthContext();

  const addShareLink = useCallback((parameters: Parameters) => {
    const user = getUser();

    if (!user) return;

    return fetchData(`/api/${user.id}/integration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parameters),
    });
  }, []);

  return {
    addShareLink,
    ...rest,
  };
};
