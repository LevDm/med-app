import { useCallback } from 'react';

import { useAuthContext } from '../auth-context';

import { UseFetch, useFetch } from './use-fetch';

type Parameters = { parameterId: string };

export const useDeleteParameterRequest = (props?: UseFetch<null>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const { getUser } = useAuthContext();

  const deleteParameter = useCallback(
    ({ parameterId }: Parameters) => {
      const user = getUser();

      if (!user) return;

      return fetchData(`/api/${user.id}/medical-parameters/${parameterId}`, {
        method: 'DELETE',
      });
    },
    [fetchData],
  );

  return {
    deleteParameter,
    ...rest,
  };
};
