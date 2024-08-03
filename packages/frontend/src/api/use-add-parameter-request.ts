import { useCallback } from 'react';

import { useAuthContext } from '../auth-context';

import { MedicalParameter } from './types';
import { UseFetch, useFetch } from './use-fetch';

type Parameters = MedicalParameter;

export const useAddParameterRequest = (props?: UseFetch<MedicalParameter>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const { getUser } = useAuthContext();

  const addParameter = useCallback((parameters: Parameters) => {
    const user = getUser();

    if (!user) return;

    return fetchData(`/api/${user.id}/medical-parameters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parameters),
    });
  }, []);

  return {
    addParameter,
    ...rest,
  };
};
