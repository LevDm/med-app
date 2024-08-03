import { useCallback } from 'react';

import { useAuthContext } from '../auth-context';

import { UseFetch, useFetch } from './use-fetch';

export const useSyncParametersRequest = (
  props?: UseFetch<{ status: 'notModified' | 'synced'; syncDate: string } | { error: string }>,
) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const { getUser } = useAuthContext();

  const syncParameters = useCallback(() => {
    const user = getUser();

    if (!user) return;

    return fetchData(`/api/${user.id}/medical-parameters/sync`, {
      method: 'POST',
    });
  }, []);

  return {
    syncParameters,
    ...rest,
  };
};
