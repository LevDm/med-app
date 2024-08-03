import { useState } from 'react';

import Check from '@mui/icons-material/Check';
import FilterListIcon from '@mui/icons-material/FilterList';
import { IconButton, ListItemIcon, MenuItem, Paper, Tooltip } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { User } from '../../api';
import { Menu } from '../../ui-components';
import { roleToTitleMap } from '../consts';

const useStyles = makeStyles()(() => ({
  filterIcon: {
    borderRadius: '50%',
  },
}));

const filters = ['admin', 'user', 'doctor'] satisfies User['role'][];

type UserSearchFiltersProps = {
  onChange(newFilters: typeof filters): void;
};

export const UserSearchFilters = ({ onChange }: UserSearchFiltersProps) => {
  const { classes } = useStyles();

  const [activeFilters, setActiveFilters] = useState<typeof filters>([]);

  const getAddFilterHandler = (filter: (typeof filters)[number]) => () => {
    setActiveFilters((prevFilters) => {
      let newFilters = prevFilters;

      if (prevFilters.includes(filter)) {
        newFilters = prevFilters.filter((item) => item !== filter);
      } else {
        newFilters = [...prevFilters, filter];
      }

      onChange(newFilters);

      return newFilters;
    });
  };

  return (
    <Paper className={classes.filterIcon}>
      <Menu
        options={filters}
        renderOption={(option) => (
          <MenuItem key={option} onClick={getAddFilterHandler(option)}>
            {activeFilters.includes(option) && (
              <ListItemIcon>
                <Check />
              </ListItemIcon>
            )}

            {roleToTitleMap[option]}
          </MenuItem>
        )}
        renderButton={({ onClick }) => (
          <Tooltip title="Фильтры">
            <IconButton onClick={onClick}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        )}
      />
    </Paper>
  );
};
