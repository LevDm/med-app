import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { isArray, orderBy, uniqBy } from 'lodash';

import MessageIcon from '@mui/icons-material/Message';
import { Badge } from '@mui/material';

import { endOfDay, subMonths } from 'date-fns';
import { makeStyles } from 'tss-react/mui';

import { MedicalParameter, MedicalParameterType, useGetParametersRequest, useGetUserRequest } from '../../api';
import { useAuthContext } from '../../auth-context';
import { PageHeader } from '../../ui-components';
import { Chat, ParametersHistory, ParametersPlots } from '../shared';

import { ParametersInputSection } from './parameters-input-section';
import { SettingsDialog } from './settings-dialog';

const useStyles = makeStyles()((theme) => ({
  main: {
    padding: theme.spacing(6, 0),
    margin: '0 auto',
    width: '60%',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
    [theme.breakpoints.down(900)]: {
      width: '100%',
      padding: theme.spacing(6, 2.5),
    },
  },
  badge: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.main,
  },
  button: {
    all: 'unset',
    cursor: 'pointer',
  },
  patientName: {
    display: 'inline-flex',
    gap: theme.spacing(1),
  },
}));

type Filters = { type: MedicalParameterType | null; startDate: Date | null; endDate: Date | null };

const offset = 10;

const isMatchFilters = (parameter: MedicalParameter, { type, startDate, endDate }: Filters) => {
  if (type && type !== parameter.type) return false;

  if (startDate && parameter.createdAt && parameter.createdAt < startDate) return false;

  if (endDate && parameter.createdAt && parameter.createdAt > endDate) return false;

  return true;
};

export const ClientPage = () => {
  const { classes } = useStyles();

  const [filters, setFilters] = useState<Filters>({ type: null, startDate: null, endDate: null });
  const pageRef = useRef<number>(1);

  const [parameters, setParameters] = useState<MedicalParameter[]>([]);
  const [count, setCount] = useState(0);

  const { getParameters } = useGetParametersRequest({
    onSuccess: (data) => {
      if (isArray(data)) {
        setParameters((parameters) => {
          const newParameters = [...parameters, ...data];
          setCount(newParameters.length);

          return newParameters;
        });

        return;
      }

      const { count, parameters } = data;

      setCount(count);
      setParameters((prevParameters) => uniqBy([...prevParameters, ...parameters], ({ id }) => id));
    },
  });

  const [plotParameters, setPlotParameters] = useState<MedicalParameter[]>([]);

  const { getParameters: getPlotParameters } = useGetParametersRequest({
    onSuccess: (parameters) => setPlotParameters(isArray(parameters) ? parameters : parameters.parameters),
  });

  const refetchPlotParams = () => {
    const endDate = endOfDay(new Date());

    const startDate = subMonths(endDate, 1);
    getPlotParameters({ startDate, endDate });
  };

  const withPlotUpdate = useCallback(<A extends unknown[], R>(fn: (...args: A) => R) => {
    return (...args: A) => {
      fn(...args);
      refetchPlotParams();
    };
  }, []);

  useEffect(() => {
    refetchPlotParams();
  }, []);

  const refetchHistoryParameters = () => getParameters({ ...filters, page: pageRef.current, offset });

  const loadMoreParameters = () => {
    if (pageRef.current * offset < count) {
      pageRef.current += 1;
      refetchHistoryParameters();
    }
  };

  const handleAddParameter = withPlotUpdate((parameter: MedicalParameter) => {
    if (!isMatchFilters(parameter, filters)) return;

    setParameters((parameters) => [parameter, ...parameters]);
    setCount((count) => {
      const nextCount = count + 1;

      return nextCount;
    });
  });

  const handleEditParameter = withPlotUpdate((parameter: MedicalParameter) => {
    setParameters((parameters) => {
      const newParameters = [...parameters];
      const editedParameterIndex = newParameters.findIndex(({ id }) => parameter.id === id);

      newParameters[editedParameterIndex] = { ...parameter };

      return orderBy(newParameters, 'createdAt', 'desc');
    });
  });

  const handledDeleteParameter = withPlotUpdate((parameterId: string) => {
    setParameters((parameters) => parameters.filter((parameter) => parameter.id !== parameterId));
    setCount((count) => {
      const nextCount = count - 1;

      return nextCount;
    });
  });

  const resetHistoryParameters = () => {
    pageRef.current = 1;
    setParameters([]);
    refetchHistoryParameters();
  };

  useEffect(() => {
    resetHistoryParameters();
  }, [filters]);

  const refetchAllParameters = () => {
    resetHistoryParameters();
    refetchPlotParams();
  };

  const { removeTokens } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    removeTokens();
    navigate('/signin');
  };

  const [isSettingsOpen, setSettingsOpen] = useState(false);

  const handleSettingsOpen = () => setSettingsOpen(true);
  const handleSettingsClose = () => setSettingsOpen(false);

  const { data: userData, getUser } = useGetUserRequest();

  const userDoctor = userData ? userData.doctor : null;

  useEffect(() => {
    getUser();
  }, []);

  return (
    <div>
      <PageHeader
        options={[
          { title: 'Выйти', action: handleLogout },
          { title: 'Настройки', action: handleSettingsOpen },
        ]}
        right={
          <Chat
            key={userDoctor?.id}
            userToChat={userDoctor}
            renderTrigger={({ toggle, unreadMessageCount }) =>
              !!userDoctor && (
                <button className={classes.button} onClick={toggle} disabled={!userDoctor}>
                  <Badge invisible={!unreadMessageCount} classes={{ badge: classes.badge }} badgeContent={unreadMessageCount}>
                    <MessageIcon color="action" />
                  </Badge>
                </button>
              )
            }
          />
        }
      />

      <SettingsDialog open={isSettingsOpen} onClose={handleSettingsClose} />

      <main className={classes.main}>
        <ParametersInputSection onAddParameter={handleAddParameter} refetchParameters={refetchAllParameters} />

        <ParametersHistory
          parameters={parameters}
          count={count}
          filters={filters}
          onChangeFilters={setFilters}
          onDeleteParameter={handledDeleteParameter}
          onEditParameter={handleEditParameter}
          loadMoreParameters={loadMoreParameters}
          refetchParameters={refetchAllParameters}
          syncParams
          canEdit
        />

        <ParametersPlots parameters={plotParameters} />
      </main>
    </div>
  );
};
