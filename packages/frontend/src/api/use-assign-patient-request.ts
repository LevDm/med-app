import { useCallback } from 'react';

import { UseFetch, useFetch } from './use-fetch';

type Parameters = { userId: string; doctorId: string };

export const useAssignPatientRequest = (props?: UseFetch<Parameters>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const assignPatient = useCallback((parameters: Parameters) => {
    return fetchData(`/api/mapping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parameters),
    });
  }, []);

  return {
    assignPatient,
    ...rest,
  };
};
