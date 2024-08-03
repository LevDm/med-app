import { useCallback } from 'react';

import { UseFetch, useFetch } from './use-fetch';

type Parameters = { userId: string; doctorId: string };

export const useReassignPatientRequest = (props?: UseFetch<Parameters>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const reassignPatient = useCallback((parameters: Parameters) => {
    return fetchData(`/api/mapping`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parameters),
    });
  }, []);

  return {
    reassignPatient,
    ...rest,
  };
};
