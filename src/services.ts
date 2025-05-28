import { useEffect, useState, useCallback, useRef } from "react";
import { ServerToClientEvents, ClientToServerEvents, UserState } from "./types";
import { io, Socket } from "socket.io-client";

//Deisgned to be used in the web app and the mobile app and simple to use
//const {emit,state} = useSocket()

export const useSocket = (socketUrl: string) => {
  const [state, setState] = useState<UserState | null>(null);
  //Handle the connection to the server socket
  useEffect(() => {
    const socket = io(socketUrl, {
      transports: ["websocket"],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });
    socket.on("stateUpdate", (state: UserState) => {
      setState(state);
    });
    return () => {
      socket.off("stateUpdate");
    };
  }, []);

  return {
    state,
    updateUserState,
  };
};



const updateUserState = (socket: Socket) => (state: UserState) => {
  socket.emit("updateUserState", { state });
};
