import { io } from 'socket.io-client';
import { tokenStore } from '@/services/api';

const URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

export const socket = io(URL, {
  autoConnect: false,
  withCredentials: true,
  auth: (cb) => {
    const token = tokenStore.get();
    cb({ token });
  }
});

export const notificationSocket = io(`${URL}/notifications`, {
  autoConnect: false,
  withCredentials: true,
  auth: (cb) => {
    const token = tokenStore.get();
    cb({ token });
  }
});
