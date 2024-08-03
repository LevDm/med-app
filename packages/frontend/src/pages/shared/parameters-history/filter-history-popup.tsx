import { useRef, useState } from 'react';

import { isNull } from 'lodash';

import { Autocomplete, Button, TextField } from '@mui/material';
import Popover from '@mui/material/Popover';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { isValid } from 'date-fns';
import ruLocale from 'date-fns/locale/ru';
import { makeStyles } from 'tss-react/mui';

import { MedicalParameterType } from '../../../api';
import { parameterTypeToTitle } from '../../consts';

const useStyles = makeStyles()((theme) => ({
  root: {
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(2),
    minWidth: 300,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
}));

const options = Object.keys(parameterTypeToTitle) as MedicalParameterType[];

export type Filters = { type: MedicalParameterType | null; startDate: Date | null; endDate: Date | null };

type FilterHistoryPopupProps = {
  filters: Filters;
  onChange({ type, startDate, endDate }: Filters): void;
  renderButton({
    onClick,
    hasFilters,
  }: {
    onClick: (event: React.MouseEvent<HTMLElement>) => void;
    hasFilters: boolean;
  }): React.ReactNode;
};

export const FilterHistoryPopup = ({ filters, onChange, renderButton }: FilterHistoryPopupProps) => {
  const { classes } = useStyles();

  const innerFilters = useRef<Filters>(filters);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleTypeChange = (_: unknown, value: string | null) => {
    innerFilters.current.type = value as MedicalParameterType;
  };

  const handleStartDateChange = (date: Date | null) => {
    if (isValid(date) || isNull(date)) {
      innerFilters.current.startDate = date;
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (isValid(date) || isNull(date)) {
      innerFilters.current.endDate = date;
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAcceptFilters = () => {
    onChange({ ...innerFilters.current });
  };

  const open = Boolean(anchorEl);

  const hasFilters = Object.values(filters).some((filter) => !!filter);

  return (
    <div>
      {renderButton({ onClick: handleClick, hasFilters })}

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        classes={{
          paper: classes.root,
        }}
      >
        <div className={classes.content}>
          <Autocomplete
            disablePortal
            defaultValue={filters.type}
            getOptionLabel={(value) => parameterTypeToTitle[value] ?? ''}
            onChange={handleTypeChange}
            options={options}
            size="small"
            renderInput={(params) => (
              <TextField {...params} defaultValue={filters.type ? parameterTypeToTitle[filters.type] : ''} label="Параметр" />
            )}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ruLocale}>
            <DatePicker
              defaultValue={filters.startDate}
              slotProps={{ textField: { size: 'small' } }}
              onChange={handleStartDateChange}
              onAccept={handleStartDateChange}
              label="От"
            />

            <DatePicker
              defaultValue={filters.endDate}
              slotProps={{ textField: { size: 'small' } }}
              onChange={handleEndDateChange}
              onAccept={handleEndDateChange}
              label="До"
            />
          </LocalizationProvider>
          <Button type="button" onClick={handleAcceptFilters}>
            Применить
          </Button>
        </div>
      </Popover>
    </div>
  );
};
