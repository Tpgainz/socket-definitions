import { useEffect, useState, useCallback, useRef } from "react";
import { ServerToClientEvents, ClientToServerEvents, SessionState } from "./types";
import { io, Socket } from "socket.io-client";
import { getDeviceType } from "./getDeviceType";

export const useSocket = (socketUrl: string, userId: string) => {
  const [state, setState] = useState<SessionState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const deviceType = getDeviceType(navigator.userAgent)

  useEffect(() => {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(socketUrl, {
      transports: ["websocket"],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      query: {
        userId: userId,
        deviceType: deviceType
      }
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("stateUpdate", (newState: SessionState) => {
      setState(newState);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("stateUpdate");
      socket.disconnect();
    };
  }, [socketUrl, userId]);

  const updateState = useCallback((update: Partial<SessionState>) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("updateState", update);
    }
  }, []);

  return {
    state,
    isConnected,
    updateState,
  };
};