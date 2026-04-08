// src/context/SocketContext.js
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

const SocketContext = createContext(null);
// const apiUrl = import.meta.env.VITE_API_URL;


export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {

  const { user } = useContext(AuthContext);
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const socketServerUrl = import.meta.env.VITE_SOCKET_SERVER_URL;
  // console.log(socketServerUrl)


  useEffect(() => {
    if (!user?.id) return
    // console.log("🔌 Establishing socket connection for user ID:", user.id);
    // Create socket connection ONLY once
    socketRef.current = io(socketServerUrl, {
      withCredentials: true,
      autoConnect: true,
      transports: ["websocket"], // faster than polling
      auth: {
        userId: user.id
      }
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
      setConnected(true);
    });

    socket.on('notification', () => {
      user.notifCount += 1;
      
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
      setConnected(false);
    });

    // Cleanup when app unmounts
    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
