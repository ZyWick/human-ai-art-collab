import React, { createContext, useContext, useEffect, useState } from "react";
import { REACT_APP_BACKEND_URL } from "../config";
import { io } from "socket.io-client";

// Create context
const SocketContext = createContext(null);

// Provider component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(REACT_APP_BACKEND_URL);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect(); // Cleanup on unmount
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

// Hook to use socket
export const useSocket = () => {
  return useContext(SocketContext);
};
