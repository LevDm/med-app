import { useCallback } from 'react';

import { UseFetch, useFetch } from './use-fetch';

type Parameters = { expiredAt: Date };

export const useCreateInviteRequest = (props?: UseFetch<{ id: string }>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const createInvite = useCallback(({ expiredAt }: Parameters) => {
    return fetchData(`/api/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expiredAt }),
    });
  }, []);

  return {
    createInvite,
    ...rest,
  };
};
