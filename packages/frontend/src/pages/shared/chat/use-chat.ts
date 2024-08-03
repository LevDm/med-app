import { useCallback, useEffect, useState } from 'react';

import { Socket, io } from 'socket.io-client';

import { useUser } from '../../../auth-context';

type Message = {
  id: string;
  from: string;
  to: string;
  text: string;
  createdAt: string;
  read: boolean;
};

const getChatId = ({ from, to }: Pick<Message, 'from' | 'to'>) => {
  return [from, to].sort().join(':');
};

let socket: Socket;

export const useChat = ({ userToChatId }: { userToChatId: string | null }) => {
  if (!socket) {
    socket = io('/chat');
  }

  const user = useUser();

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!user || !userToChatId) return;

    const chatId = getChatId({ from: user.id, to: userToChatId });

    socket.on(`${chatId}:message:get`, (messages: Message[]) => {
      setMessages(messages);
    });

    socket.emit('message:get', { from: user.id, to: userToChatId });
  }, [user, userToChatId]);

  const send = useCallback(
    (text: string) => {
      if (!user || !userToChatId) return;

      socket.emit('message:post', { text, from: user.id, to: userToChatId });
    },
    [user, userToChatId],
  );

  const markAsRead = useCallback(
    (id: string) => {
      if (!user || !userToChatId) return;

      socket.emit('message:update', { id, read: true, from: user.id, to: userToChatId });
    },
    [user, userToChatId],
  );

  return { messages, send, markAsRead };
};
