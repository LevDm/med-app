import { useCallback } from 'react';

import { isNumber } from 'lodash';

import { useAuthContext } from '../auth-context';

import { MedicalParameter, MedicalParameterType } from './types';
import { UseFetch, useFetch } from './use-fetch';

type Parameters = {
  type?: MedicalParameterType | null;
  startDate?: Date | null;
  endDate?: Date | null;
  page?: number;
  offset?: number;
  userId?: string | null;
};

export type GetParametersReturn =
  | MedicalParameter[]
  | { parameters: MedicalParameter[]; count: number; page: number; offset: number };

export const useGetParametersRequest = (props?: UseFetch<GetParametersReturn>) => {
  const { fetchData, ...rest } = useFetch({ ...props, withAuth: true });

  const { getUser } = useAuthContext();

  const getParameters = useCallback(({ type, startDate, endDate, offset, page, userId }: Parameters = {}) => {
    const user = getUser();

    if (!user && !userId) return;

    const searchParams = new URLSearchParams();

    if (type) searchParams.set('type', type);
    if (startDate) searchParams.set('start_date', startDate.toISOString());
    if (endDate) searchParams.set('end_date', endDate.toISOString());
    if (offset) searchParams.set('offset', offset.toString());
    if (isNumber(page)) searchParams.set('page', page.toString());

    return fetchData(`/api/${userId ?? user?.id}/medical-parameters?${searchParams.toString()}`);
  }, []);

  return {
    getParameters,
    ...rest,
  };
};
