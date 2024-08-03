import { useCallback } from 'react';

import { useFetch } from './use-fetch';

export const useLogoutRequest = () => {
  const { fetchData } = useFetch({ withAuth: true });

  const logout = useCallback(
    () =>
      fetchData('/api/auth/logout', {
        method: 'POST',
      }),
    [],
  );

  return {
    logout,
  };
};
