import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { isArray, uniqBy } from 'lodash';

import MessageIcon from '@mui/icons-material/Message';
import { Badge, Typography } from '@mui/material';

import { endOfDay, subMonths } from 'date-fns';
import { makeStyles } from 'tss-react/mui';

import { MedicalParameter, MedicalParameterType, User, useGetParametersRequest } from '../../api';
import { useAuthContext } from '../../auth-context';
import { PageHeader } from '../../ui-components';
import { Chat, ComparisonPlots, ParametersHistory, ParametersPlots } from '../shared';

import { Notes } from './notes';
import { PatientList } from './patient-list';

const useStyles = makeStyles()((theme) => ({
  main: {
    display: 'flex',
  },
  patientList: {
    height: 'calc(100dvh - 67px - 48px)',
    overflow: 'auto',
    flexBasis: '30%',
    flexShrink: 0,
    padding: theme.spacing(3, 0),
  },
  content: {
    padding: theme.spacing(3, 3, 1, 3),
    height: 'calc(100dvh - 67px - 48px)',
    overflowY: 'auto',
    flexBasis: '70%',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
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
  selectPatientContainer: {
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectPatientMessage: {
    padding: theme.spacing(1, 2),
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius * 4,
  },
}));

type Filters = { type: MedicalParameterType | null; startDate: Date | null; endDate: Date | null };

const offset = 10;

export const DoctorPage = () => {
  const { classes } = useStyles();

  const [filters, setFilters] = useState<Filters>({ type: null, startDate: null, endDate: null });
  const pageRef = useRef<number>(1);

  const [parameters, setParameters] = useState<MedicalParameter[]>([]);
  const [count, setCount] = useState(0);

  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);

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
    getPlotParameters({ startDate, endDate, userId: selectedPatient?.id });
  };

  const refetchHistoryParameters = () =>
    getParameters({ ...filters, page: pageRef.current, offset, userId: selectedPatient?.id });

  const loadMoreParameters = () => {
    if (pageRef.current * offset < count) {
      pageRef.current += 1;
      refetchHistoryParameters();
    }
  };

  const resetHistoryParameters = () => {
    pageRef.current = 1;
    setParameters([]);
    refetchHistoryParameters();
  };

  useEffect(() => {
    if (selectedPatient) {
      resetHistoryParameters();
    }
  }, [filters, selectedPatient]);

  useEffect(() => {
    if (selectedPatient) {
      refetchPlotParams();
    }
  }, [selectedPatient]);

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

  return (
    <div>
      <PageHeader
        options={[{ title: 'Выйти', action: handleLogout }]}
        right={
          <Chat
            key={selectedPatient?.id}
            userToChat={selectedPatient}
            renderTrigger={({ toggle, unreadMessageCount }) =>
              !!selectedPatient && (
                <button className={classes.button} onClick={toggle} disabled={!selectedPatient}>
                  <Badge invisible={!unreadMessageCount} classes={{ badge: classes.badge }} badgeContent={unreadMessageCount}>
                    <MessageIcon color="action" />
                  </Badge>
                </button>
              )
            }
          />
        }
      />

      <main className={classes.main}>
        <aside className={classes.patientList}>
          <PatientList selectedUserId={selectedPatient?.id ?? null} onSelect={setSelectedPatient} />
        </aside>

        <div className={classes.content}>
          {!selectedPatient && (
            <div className={classes.selectPatientContainer}>
              <Typography className={classes.selectPatientMessage}>Выберите пациента для проверки</Typography>
            </div>
          )}
          {selectedPatient && (
            <>
              <ParametersHistory
                parameters={parameters}
                count={count}
                filters={filters}
                onChangeFilters={setFilters}
                loadMoreParameters={loadMoreParameters}
                refetchParameters={refetchAllParameters}
              />

              <Notes patientId={selectedPatient.id} />

              <ComparisonPlots parameters={plotParameters} />

              <ParametersPlots parameters={plotParameters} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};
