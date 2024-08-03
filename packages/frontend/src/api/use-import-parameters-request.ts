import { useCallback } from 'react';

import { useUser } from '../auth-context';

import { User } from './types';
import { UseFetch, useFetch } from './use-fetch';

type Parameters = { file: File };

export const useImportParametersRequest = (props?: UseFetch<User>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });
  const user = useUser();

  const importParameters = useCallback(({ file }: Parameters) => {
    if (!user) return;

    const formData = new FormData();
    formData.append('file', file);

    return fetchData(`/api/${user.id}/medical-parameters/import`, { method: 'POST', body: formData });
  }, []);

  return {
    importParameters,
    ...rest,
  };
};
