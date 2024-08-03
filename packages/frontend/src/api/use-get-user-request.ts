import { useCallback } from 'react';

import { useUser } from '../auth-context';

import { User } from './types';
import { UseFetch, useFetch } from './use-fetch';

export const useGetUserRequest = (props?: UseFetch<User & { doctor: User }>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const user = useUser();

  const getUser = useCallback(() => {
    if (!user) return;
    return fetchData(`/api/user/${user.id}`);
  }, []);

  return {
    getUser,
    ...rest,
  };
};
