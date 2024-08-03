import { useCallback } from 'react';

import { isArray, isNumber, isString } from 'lodash';

import { User, UserWithDoctor } from './types';
import { UseFetch, useFetch } from './use-fetch';

type Parameters = { search?: string; page?: number; offset?: number; role?: User['role'] | User['role'][]; doctorId?: string };

export const useSearchUsersRequest = (props?: UseFetch<UserWithDoctor[] | { items: UserWithDoctor[]; count: number }>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const searchUsers = useCallback(({ offset, page, search, role, doctorId }: Parameters) => {
    const searchParams = new URLSearchParams({ ...(search && { search }) });

    if (isNumber(offset)) searchParams.set('offset', offset.toString());
    if (isNumber(page)) searchParams.set('page', page.toString());
    if (isString(doctorId)) searchParams.set('doctorId', doctorId);

    if (isArray(role) && role.length) {
      role.forEach((item) => searchParams.append('role', item));
    }

    if (role && !isArray(role)) {
      searchParams.set('role', role);
    }

    return fetchData(`/api/user/search?${searchParams}`);
  }, []);

  return {
    searchUsers,
    ...rest,
  };
};
