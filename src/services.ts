import { useEffect, useState, useCallback, useRef } from "react";
import { ServerToClientEvents, ClientToServerEvents, UserState } from "./types";
import { io, Socket } from "socket.io-client";

export const useSocket = (socketUrl: string, userId: string) => {
  const [state, setState] = useState<UserState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  useEffect(() => {
    // Créer la connexion avec l'userId
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(socketUrl, {
      transports: ["websocket"],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      query: {
        userId: userId
      }
    });

    socketRef.current = socket;

    // Événements de connexion
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Écouter les mises à jour d'état
    socket.on("stateUpdate", (newState: UserState) => {
      setState(newState);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("stateUpdate");
      socket.disconnect();
    };
  }, [socketUrl, userId]);

  const updateUserState = useCallback((update: Partial<UserState>) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("updateState", update);
    }
  }, []);

  return {
    state,
    isConnected,
    updateUserState,
  };
};