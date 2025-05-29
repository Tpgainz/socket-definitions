import { useEffect, useState, useCallback, useRef } from "react";
import { ServerToClientEvents, ClientToServerEvents } from "./types/socket";
import { io, Socket } from "socket.io-client";
import { getDeviceType } from "./getDeviceType";
import { SessionState } from "./types/call";

type SocketType = Socket<ServerToClientEvents<SessionState>, ClientToServerEvents<SessionState>>;

export const useSocket = (socketUrl: string, userId: string) => {
  const [state, setState] = useState<SessionState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<SocketType | null>(null);
  const deviceType = getDeviceType(navigator.userAgent)

  useEffect(() => {
    const socket: SocketType = io(socketUrl, {
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