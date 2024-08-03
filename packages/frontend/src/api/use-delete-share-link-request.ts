import { useCallback } from 'react';

import { useAuthContext } from '../auth-context';

import { UseFetch, useFetch } from './use-fetch';

export const useDeleteShareLinkRequest = (props?: UseFetch<unknown>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const { getUser } = useAuthContext();

  const deleteShareLink = useCallback(() => {
    const user = getUser();

    if (!user) return;

    return fetchData(`/api/${user.id}/integration`, {
      method: 'DELETE',
    });
  }, []);

  return {
    deleteShareLink,
    ...rest,
  };
};
