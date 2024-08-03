import { useCallback, useEffect, useRef, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';

import { cloneDeep, debounce, isArray, uniqBy } from 'lodash';

import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { CircularProgress, InputBase, Paper, Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { User, UserWithDoctor, useSearchUsersRequest } from '../../../api';
import { useUser } from '../../../auth-context';
import { Island } from '../../../ui-components';
import { useChat } from '../../shared/chat';

import { PatientItem } from './patient-item';

const useStyles = makeStyles()((theme) => ({
  main: {
    width: '100%',
    height: '100%',
    margin: '0 auto',
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
    padding: theme.spacing(0, 1, 0, 3),
  },
  searchContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  searchWrap: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius * 4,
  },
  searchInput: {
    width: '100%',
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
      padding: theme.spacing(0, 1, 2, 3),
    },
  },
  notFoundContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1),
    margin: theme.spacing(0, 1, 0, 3),
  },
  addIcon: {
    borderRadius: '50%',
  },
}));

const offset = 20;

export const PatientList = ({ selectedUserId, onSelect }: { selectedUserId: string | null; onSelect(user: User): void }) => {
  const { classes } = useStyles();

  const doctor = useUser();

  const [users, setUsers] = useState<UserWithDoctor[]>([]);

  const user = useUser();

  const pageRef = useRef(1);
  const countRef = useRef(0);

  const { messages } = useChat({ userToChatId: selectedUserId });

  useEffect(() => {
    setUsers((prevUsers) => {
      const newUsers = cloneDeep(prevUsers);

      const selectedUser = newUsers.find((user) => user.id === selectedUserId);

      const unreadUserMessageCount = messages.reduce(
        (result, { from, read }) => (from === selectedUserId && !read ? result + 1 : result),
        0,
      );

      const lastMessageDate = messages.reduce<string | null>((result, { from, createdAt }) => {
        if (!result) return createdAt;

        const currentDate = new Date(createdAt);
        const maxDate = new Date(result);

        if (from === user?.id && currentDate.getTime() > maxDate.getTime()) {
          return createdAt;
        }

        return result;
      }, null);

      if (selectedUser) {
        selectedUser.unreadMessageCount = unreadUserMessageCount;
        selectedUser.lastCheckDate = lastMessageDate;
      }

      return newUsers;
    });
  }, [messages]);

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

  const [search, setSearch] = useState('');

  const debouncedSetSearch = useCallback(debounce(setSearch, 400), []);

  const handleSearchChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearch(target.value);
  };

  const refetchUsers = () => searchUsers({ offset, page: pageRef.current, search });

  const loadMoreUsers = () => {
    if (pageRef.current * offset < countRef.current) {
      pageRef.current += 1;
      refetchUsers();
    }
  };

  useEffect(() => {
    pageRef.current = 1;
    setUsers([]);
    searchUsers({ offset, page: pageRef.current, search, doctorId: doctor?.id });
  }, [search]);

  return (
    <main className={classes.main}>
      <div className={classes.header}>
        <div className={classes.searchContainer}>
          <Paper className={classes.searchWrap}>
            <SearchIcon className={classes.searchIcon} color="action" />

            <InputBase className={classes.searchInput} onChange={handleSearchChange} placeholder="Поиск пользователя" fullWidth />
          </Paper>

          {/* <UserSearchFilters onChange={debouncedSetActiveFilters} /> */}
        </div>
      </div>

      {isLoading && !users.length && <CircularProgress className={classes.loader} size={40} />}

      {!isLoading && !users.length && search && (
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
          style={{ height: 'calc(100% - 56px)' }}
          data={users}
          overscan={150}
          itemContent={(_, user) => (
            <div className={classes.userItem}>
              <PatientItem selected={user.id === selectedUserId} user={user} onClick={onSelect} />
            </div>
          )}
          endReached={loadMoreUsers}
        />
      )}
    </main>
  );
};
