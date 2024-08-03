import { useCallback } from 'react';

import { User } from './types';
import { UseFetch, useFetch } from './use-fetch';

type Parameters = { userId: string };

export const useActivateUserRequest = (props?: UseFetch<User>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const activateUser = useCallback(({ userId }: Parameters) => {
    return fetchData(`/api/user/${userId}/activate`, { method: 'PUT' });
  }, []);

  return {
    activateUser,
    ...rest,
  };
};
