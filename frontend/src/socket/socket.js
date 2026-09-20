import { io } from "socket.io-client";

let socket = null;

export const getSocket = (token) => {
  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  if (!socket) {
    socket = io(backendUrl, {
      auth: { token },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      withCredentials: true,
    });
  } else if (token && socket.auth?.token !== token) {
    socket.auth = { token };
    if (socket.connected) {
      socket.disconnect().connect();
    }
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
