import { useCallback } from 'react';

import { useAuthContext } from '../auth-context';

import { UseFetch, useFetch } from './use-fetch';

export const useGetShareLinkRequest = (props?: UseFetch<{ shareLink: string | null }>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const { getUser } = useAuthContext();

  const getShareLink = useCallback(() => {
    const user = getUser();

    if (!user) return;

    return fetchData(`/api/${user.id}/integration`);
  }, []);

  return {
    getShareLink,
    ...rest,
  };
};
