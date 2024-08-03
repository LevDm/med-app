import { useCallback, useEffect, useRef, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { cloneDeep, debounce, isArray, uniqBy } from 'lodash';

import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { CircularProgress, InputBase, Paper, Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { User, UserWithDoctor, useSearchUsersRequest } from '../../api';
import { Island, PageHeader } from '../../ui-components';

import { CreateInviteDialog } from './create-invite-dialog';
import { UserItem } from './user-item';
import { UserSearchFilters } from './user-search-filters';

const useStyles = makeStyles()((theme) => ({
  main: {
    height: '100%',
    padding: theme.spacing(6, 0),
    margin: '0 auto',
    width: '65%',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius * 4,
  },
  searchInput: {
    width: 200,
    transition: 'width 0.2s',
    '&.Mui-focused': {
      width: 300,
    },
  },
  searchIcon: {
    margin: theme.spacing(0, 0.5),
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
  },
  userItem: {
    '&&&': {
      paddingBottom: theme.spacing(2),
    },
  },
  notFoundContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  addIcon: {
    borderRadius: '50%',
  },
}));

const offset = 20;
const filters = ['admin', 'user', 'doctor'] satisfies UserWithDoctor['role'][];

export const AdminPage = () => {
  const { classes } = useStyles();

  const [users, setUsers] = useState<UserWithDoctor[]>([]);

  const [activeFilters, setActiveFilters] = useState<typeof filters>([]);

  const pageRef = useRef(1);
  const countRef = useRef(0);

  const { isLoading, searchUsers } = useSearchUsersRequest({
    onSuccess: (data) => {
      if (isArray(data)) {
        setUsers((users) => {
          const newUsers = [...users, ...data];
          countRef.current = newUsers.length;
          return newUsers;
        });

        return;
      }

      const { count, items } = data;

      countRef.current = count;
      setUsers((prevUsers) => uniqBy([...prevUsers, ...items], 'id'));
    },
  });

  const handleUserChange = (user: Partial<UserWithDoctor>) => {
    setUsers((prevUsers) => {
      const newUsers = cloneDeep(prevUsers);

      const foundTopLevelIndex = newUsers.findIndex(({ id }) => user.id === id);
      const foundNestedIndex = newUsers.findIndex(({ users }) => users.some((nestedUser) => nestedUser.id === user.id));

      const foundTopLevel = newUsers[foundTopLevelIndex];
      const foundNested = newUsers[foundNestedIndex];

      if (foundTopLevel) {
        newUsers[foundTopLevelIndex] = cloneDeep({ ...foundTopLevel, ...user });
      }

      if (foundNested) {
        const nestedIndex = foundNested.users.findIndex((nestedUser) => nestedUser.id === user.id);
        const foundNestedUser = foundNested.users[nestedIndex];

        foundNested.users[nestedIndex] = cloneDeep({ ...foundNestedUser, ...user });
      }

      return newUsers;
    });
  };

  const handleUserReassign = ({ user, fromDoctorId, toDoctor }: { user: User; fromDoctorId: string | null; toDoctor: User }) => {
    setUsers((prevUsers) => {
      const newUsers = cloneDeep(prevUsers);

      const fromDoctorIndex = newUsers.findIndex(({ id }) => id === fromDoctorId);
      const fromDoctor = newUsers[fromDoctorIndex];

      const toDoctorIndex = newUsers.findIndex(({ id }) => id === toDoctor.id);
      const toDoctorListRecord = newUsers[toDoctorIndex];

      const userIndex = newUsers.findIndex(({ id }) => id === user.id);
      const userListRecord = newUsers[userIndex];

      if (toDoctorListRecord) {
        newUsers[toDoctorIndex].users.push(cloneDeep(user));
      }

      if (userListRecord) {
        newUsers[userIndex].doctor = cloneDeep(toDoctor);
      }

      if (!fromDoctor) {
        return newUsers;
      } else {
        const users = newUsers[fromDoctorIndex].users;
        newUsers[fromDoctorIndex].users = users.filter((_user) => _user.id !== user.id);
      }

      return newUsers;
    });
  };

  const [search, setSearch] = useState('');

  const debouncedSetSearch = useCallback(debounce(setSearch, 400), []);
  const debouncedSetActiveFilters = useCallback(debounce(setActiveFilters, 500), []);

  const handleSearchChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearch(target.value);
  };

  const refetchUsers = () => searchUsers({ offset, page: pageRef.current, search, role: activeFilters });

  const loadMoreUsers = () => {
    if (pageRef.current * offset < countRef.current) {
      pageRef.current += 1;
      refetchUsers();
    }
  };

  useEffect(() => {
    pageRef.current = 1;
    setUsers([]);
    searchUsers({ offset, page: pageRef.current, search, role: activeFilters });
  }, [search, activeFilters]);

  return (
    <div>
      <PageHeader />

      <main className={classes.main}>
        <div className={classes.header}>
          <Typography variant="h6">Пользователи</Typography>

          <div className={classes.searchContainer}>
            <Paper className={classes.searchWrap}>
              <SearchIcon className={classes.searchIcon} color="action" />

              <InputBase className={classes.searchInput} onChange={handleSearchChange} placeholder="Поиск пользователя" />
            </Paper>

            <UserSearchFilters onChange={debouncedSetActiveFilters} />

            <CreateInviteDialog />
          </div>
        </div>

        {isLoading && !users.length && <CircularProgress className={classes.loader} size={40} />}

        {!isLoading && !users.length && (search || !!activeFilters.length) && (
          <Island className={classes.notFoundContainer}>
            <SearchOffIcon sx={{ fontSize: 64 }} color="action" />

            <Typography variant="h6" fontWeight="bold">
              Пользователи не найдены
            </Typography>

            <Typography variant="body2">Попробуйте изменить фильтр или изменить запрос</Typography>
          </Island>
        )}

        {users && (
          <Virtuoso
            style={{ height: 'calc(100dvh - 220px)' }}
            data={users}
            overscan={150}
            itemContent={(_, user) => (
              <div className={classes.userItem}>
                <UserItem key={user.id} user={user} onUserReassign={handleUserReassign} onUserChange={handleUserChange} />
              </div>
            )}
            endReached={loadMoreUsers}
          />
        )}
      </main>
    </div>
  );
};
