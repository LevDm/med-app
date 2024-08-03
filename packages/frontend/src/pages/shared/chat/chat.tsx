import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { Avatar, Divider, IconButton, InputBase, Portal, Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { User } from '../../../api';
import { useUser } from '../../../auth-context';
import { Island } from '../../../ui-components';
import { getFullName } from '../../../utils';

import DoctorIcon from './doctor-icon.svg?react';
import { Message } from './message';
import SendIcon from './send-icon.svg?react';
import { useChat } from './use-chat';

const useStyles = makeStyles<{ open: boolean }>()((theme, { open }) => ({
  root: {
    position: 'fixed',
    width: `calc(min(400px, 100svw - 32px))`,
    height: 'calc(min(700px, 100dvh - 98px))',
    zIndex: theme.zIndex.drawer,
    top: 82,
    right: theme.spacing(2),
    transition: '300ms',
    ...(!open && { transform: 'translateX(calc(100% + 32px))' }),
  },
  content: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(3),
  },
  closeButton: {
    marginLeft: 'auto',
    alignSelf: 'flex-start',
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  doctorName: {
    color: theme.palette.primary.main,
  },
  userPrefix: {
    fontSize: 13,
    color: theme.palette.grey[600],
  },
  messages: {
    maxHeight: 'calc(100% - 85px)',
    overflow: 'auto',
    padding: theme.spacing(0, 1),
  },
  footer: {
    marginTop: 'auto',
    backgroundColor: '#f4f4f4',
    borderRadius: theme.shape.borderRadius * 8,
    padding: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    display: 'flex',
    alignItems: 'flex-start',
  },
  sendButton: {
    backgroundColor: theme.palette.primary.main,
  },
}));

type ChatProps = {
  userToChat: User | null;
  renderTrigger(props: { unreadMessageCount: number; toggle(): void }): React.ReactNode;
};

export const Chat = ({ userToChat, renderTrigger }: ChatProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { classes } = useStyles({ open: isOpen });

  const handleClose = () => setIsOpen(false);

  const handleToggle = () => setIsOpen((prev) => !prev);

  const { messages, send, markAsRead } = useChat({ userToChatId: userToChat?.id ?? null });

  const [text, setText] = useState('');

  const scrollContainerRef = useRef<HTMLElement>(null);

  const user = useUser();

  const handleTextChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    setText(target.value);
  };

  const handleSend = () => {
    if (text) {
      send(text);
      setText('');
    }
  };

  const handleKeyDown = ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
    if (key === 'Enter') {
      handleSend();
    }
  };

  useLayoutEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages.filter((message) => message.from === user?.id).length]);

  const isDoctor = !!user && user.role === 'doctor';

  const unreadMessageCount = useMemo(
    () => messages.reduce((result, { read, from }) => (!read && from !== user?.id ? result + 1 : result), 0),
    [messages, user],
  );

  const messagesRef = useRef<Record<string, HTMLDivElement>>({});

  const attachMessageRef = (id: string) => (node: HTMLDivElement) => {
    messagesRef.current[id] = node;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const { id } = ('dataset' in entry.target ? entry.target.dataset : {}) as { id?: string };
          const message = messages.find((message) => message.id === id);

          if (entry.isIntersecting && id && message && message.from === userToChat?.id && !message.read) {
            markAsRead(id);
          }
        }
      },
      { threshold: 0.5 },
    );

    Object.values(messagesRef.current).forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [messages]);

  return (
    <>
      {renderTrigger({ unreadMessageCount, toggle: handleToggle })}

      <Portal>
        <Island className={classes.root} elevation={3}>
          <aside className={classes.content}>
            <header className={classes.header}>
              <Avatar>
                {isDoctor && `${userToChat?.lastName[0]}${userToChat?.firstName[0]}`}
                {!isDoctor && <DoctorIcon />}
              </Avatar>

              <div>
                <Typography className={classes.doctorName} fontWeight="bold" variant="h6" fontSize={18}>
                  {getFullName(userToChat ?? {})}
                </Typography>

                <Typography variant="body1" className={classes.userPrefix}>
                  {isDoctor ? 'Ваш пациент' : 'Ваш врач'}
                </Typography>
              </div>

              <IconButton className={classes.closeButton} onClick={handleClose} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </header>

            <Divider className={classes.divider} />

            <main className={classes.messages} ref={scrollContainerRef}>
              {messages.map(({ id, text, from, createdAt }) => (
                <Message
                  messageRef={attachMessageRef(id)}
                  key={id}
                  id={id}
                  variant={from === user?.id ? 'right' : 'left'}
                  time={createdAt}
                >
                  {text}
                </Message>
              ))}
            </main>

            <footer className={classes.footer}>
              <InputBase
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                fullWidth
                multiline
                maxRows={6}
                style={{ marginRight: 2 }}
              />

              <IconButton disableRipple onClick={handleSend} className={classes.sendButton} size="small">
                <SendIcon />
              </IconButton>
            </footer>
          </aside>
        </Island>
      </Portal>
    </>
  );
};
