import { useCallback } from 'react';

import { useAuthContext } from '../auth-context';

import { MedicalParameter } from './types';
import { UseFetch, useFetch } from './use-fetch';

type Parameters = Pick<MedicalParameter, 'data' | 'createdAt'> & { parameterId: string };

export const useEditParameterRequest = (props?: UseFetch<MedicalParameter>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const { getUser } = useAuthContext();

  const editParameter = useCallback(({ parameterId, data, createdAt }: Parameters) => {
    const user = getUser();

    if (!user) return;

    return fetchData(`/api/${user.id}/medical-parameters/${parameterId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data, createdAt }),
    });
  }, []);

  return {
    editParameter,
    ...rest,
  };
};
