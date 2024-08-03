import { useCallback } from 'react';

import { User } from './types';
import { UseFetch, useFetch } from './use-fetch';

type Parameters = { userId: string };

export const useDeactivateUserRequest = (props?: UseFetch<User>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const deactivateUser = useCallback(({ userId }: Parameters) => {
    return fetchData(`/api/user/${userId}/deactivate`, { method: 'PUT' });
  }, []);

  return {
    deactivateUser,
    ...rest,
  };
};
