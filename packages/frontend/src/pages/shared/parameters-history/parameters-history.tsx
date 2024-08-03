import { Fragment, forwardRef, useEffect, useState } from 'react';
import { TableVirtuoso, TableVirtuosoProps } from 'react-virtuoso';

import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SyncIcon from '@mui/icons-material/Sync';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Badge,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow, { TableRowProps } from '@mui/material/TableRow';

import { format } from 'date-fns';
import { makeStyles } from 'tss-react/mui';

import { MedicalParameter, useSyncParametersRequest } from '../../../api';
import { ensureDate } from '../../../utils';
import { inputTypeToTitleMap, parameterTypeToIcon, parameterTypeToTitle } from '../../consts';

import { DeleteParameterModal } from './delete-parameter-modal';
import { EditParameterModal } from './edit-parameter-modal';
import { FilterHistoryPopup, Filters } from './filter-history-popup';

const useStyles = makeStyles<void, 'actionsButtons'>()((theme, _, classes) => ({
  paper: {
    '&&&': {
      borderRadius: theme.shape.borderRadius * 2,
    },
  },
  accordion: {
    '&.Mui-focusVisible': {
      backgroundColor: 'transparent',
    },
  },
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  iconButton: {
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: theme.palette.primary.light,
  },
  parameterName: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  recordCount: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.light,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  count: {
    fontSize: '0.6rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    paddingRight: theme.spacing(2),
  },
  actions: {
    cursor: 'pointer',
    [`&:hover`]: {
      visibility: 'hidden',
    },
    [`&:hover .${classes.actionsButtons}`]: {
      visibility: 'visible',
    },
  },
  actionsButtons: {
    visibility: 'hidden',
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(calc(-1 * 50% - 8px), -50%)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  actionButton: {
    width: 24,
    height: 24,
    padding: theme.spacing(0.25),
    '& svg': {
      width: 20,
      height: 20,
    },
  },
  filterButton: {
    marginLeft: 'auto',
  },
  tableHeader: {
    backgroundColor: theme.palette.common.white,
    paddingBottom: theme.spacing(1),
  },
  syncData: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    marginRight: theme.spacing(1),
  },
}));

const getParameterValue = (parameter: MedicalParameter) => {
  if ('value' in parameter.data) return parameter.data.value;

  if (parameter.type === 'sleep') {
    const dateFormat = 'HH:mm';
    const startDate = format(ensureDate(parameter.data.startDate), dateFormat);
    const endDate = format(ensureDate(parameter.data.endDate), dateFormat);
    return `${startDate} - ${endDate}`;
  }

  if (parameter.type === 'workout') {
    const dateFormat = 'HH:mm';
    const startDate = format(ensureDate(parameter.data.startDate), dateFormat);
    const endDate = format(ensureDate(parameter.data.endDate), dateFormat);
    const intensity = { 0: 'Лёгкая', 0.25: 'Простая', 0.5: 'Нормальная', 0.75: 'Средняя', 1: 'Тяжелая' }[
      parameter.data.intensity
    ];
    return `${intensity}: ${startDate} - ${endDate}`;
  }

  if (parameter.type === 'pressure') {
    return `${parameter.data.sys}/${parameter.data.dia}`;
  }

  if (parameter.type === 'form') {
    return 'Анкета';
  }

  return '';
};

const TableComponents: TableVirtuosoProps<MedicalParameter, unknown>['components'] = {
  Scroller: forwardRef((props, ref) => <TableContainer {...props} ref={ref} />),
  Table: (props) => (
    <Table
      {...props}
      sx={{
        [`& .${tableCellClasses.root}`]: {
          borderBottom: 'none',
          paddingLeft: 0,
        },
      }}
      style={{ borderCollapse: 'separate' }}
    />
  ),
  TableHead: TableHead,
  TableRow: forwardRef<HTMLTableRowElement, TableRowProps>((props, ref) => (
    <TableRow {...props} sx={{ '&:last-child td, &:last-child th': { border: 0 } }} ref={ref} />
  )),
  TableBody: forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
};

type ParametersHistoryProps = {
  parameters: MedicalParameter[];
  count: number;
  filters: Filters;
  onChangeFilters(filters: Filters): void;
  loadMoreParameters(): void;
  onDeleteParameter?(parameterId: string): void;
  onEditParameter?(parameter: MedicalParameter): void;
  refetchParameters(): void;
  canEdit?: boolean;
  syncParams?: boolean;
};

export const ParametersHistory = ({
  parameters,
  count,
  filters,
  onChangeFilters,
  loadMoreParameters,
  onDeleteParameter,
  onEditParameter,
  refetchParameters,
  canEdit,
  syncParams,
}: ParametersHistoryProps) => {
  const { classes, cx } = useStyles();

  const [parameterToDelete, setParameterToDelete] = useState<Pick<MedicalParameter, 'id' | 'type'> | null>(null);
  const [parameterToEdit, setParameterToEdit] = useState<MedicalParameter | null>(null);

  const handleDeleteModalClose = () => setParameterToDelete(null);

  const handleEditModalClose = () => setParameterToEdit(null);

  const handleDeleteParameter = (parameterId: string) => {
    onDeleteParameter?.(parameterId);
    handleDeleteModalClose();
  };

  const handleEditParameter = (parameter: MedicalParameter) => {
    onEditParameter?.(parameter);
    handleEditModalClose();
  };

  const {
    isLoading: isSyncing,
    data: syncData,
    syncParameters,
  } = useSyncParametersRequest({
    onSuccess: (data) => {
      if (!data) return;
      if ('status' in data && data.status === 'synced') refetchParameters();
    },
  });

  useEffect(() => {
    if (syncParams) {
      syncParameters();
    }
  }, [syncParams]);

  return (
    <>
      <Accordion classes={{ root: classes.paper }} disableGutters>
        <AccordionSummary classes={{ root: classes.accordion }} expandIcon={<ExpandMoreIcon />}>
          <header className={classes.header}>
            <Typography variant="h6">История показателей</Typography>

            <div className={classes.recordCount}>
              <Typography className={classes.count}>{count}</Typography>
            </div>

            <div onClick={(event) => event.stopPropagation()}>
              <FilterHistoryPopup
                filters={filters}
                onChange={onChangeFilters}
                renderButton={({ hasFilters, onClick }) => (
                  <Badge variant="dot" color="primary" invisible={!hasFilters}>
                    <IconButton className={cx(classes.actionButton, classes.filterButton)} onClick={onClick}>
                      <FilterListIcon color="primary" />
                    </IconButton>
                  </Badge>
                )}
              />
            </div>
          </header>

          <div className={classes.syncData}>
            <>
              {isSyncing && <CircularProgress size={16} />}
              {syncData && 'status' in syncData && ['synced', 'notModified'].includes(syncData.status) && (
                <Tooltip title={`Синхронизировано ${format(new Date(syncData.syncDate), 'dd.MM.Y HH:mm')}`}>
                  <SyncIcon fontSize="small" color="action" />
                </Tooltip>
              )}
            </>
          </div>
        </AccordionSummary>

        <AccordionDetails>
          <TableVirtuoso
            style={{ height: 400 }}
            data={parameters}
            endReached={loadMoreParameters}
            firstItemIndex={0}
            components={TableComponents}
            fixedHeaderContent={() => (
              <TableRow>
                {['Показатель', 'Значение', 'Тип ввода', 'Дата', ...(canEdit ? ['Действия'] : [])].map((title, index) => (
                  <TableCell key={title} align={index ? 'center' : 'left'} className={classes.tableHeader}>
                    {title}
                  </TableCell>
                ))}
              </TableRow>
            )}
            itemContent={(_, parameter) => (
              <Fragment key={parameter.id}>
                <TableCell component="th" scope="row">
                  <span className={classes.parameterName}>
                    <IconButton color="primary" size="small" className={classes.iconButton}>
                      {[parameterTypeToIcon[parameter.type]]}
                    </IconButton>
                    {parameterTypeToTitle[parameter.type]}
                  </span>
                </TableCell>
                <TableCell align="center">{getParameterValue(parameter)}</TableCell>
                <TableCell align="center">{inputTypeToTitleMap[parameter.inputType]}</TableCell>
                <TableCell align="center">
                  {parameter.createdAt ? format(new Date(parameter.createdAt), 'dd.MM.Y HH:mm') : '-'}
                </TableCell>

                {canEdit && (
                  <TableCell align="center" style={{ position: 'relative' }}>
                    <span className={classes.actions}>
                      <MoreHorizIcon />

                      <span className={classes.actionsButtons}>
                        <IconButton className={classes.actionButton} onClick={() => setParameterToEdit(parameter)} size="small">
                          <EditOutlinedIcon color="primary" />
                        </IconButton>

                        <IconButton className={classes.actionButton} onClick={() => setParameterToDelete(parameter)} size="small">
                          <DeleteOutlinedIcon color="primary" />
                        </IconButton>
                      </span>
                    </span>
                  </TableCell>
                )}
              </Fragment>
            )}
          />
        </AccordionDetails>
      </Accordion>

      <DeleteParameterModal
        open={!!parameterToDelete}
        parameter={parameterToDelete}
        onClose={handleDeleteModalClose}
        onDelete={handleDeleteParameter}
      />

      <EditParameterModal
        edit
        open={!!parameterToEdit}
        parameter={parameterToEdit}
        onClose={handleEditModalClose}
        onEdit={handleEditParameter}
      />
    </>
  );
};
