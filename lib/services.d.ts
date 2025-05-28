import { UserState } from "./types";
import { Socket } from "socket.io-client";
export declare const useSocket: (socketUrl: string) => {
    state: UserState | null;
    updateUserState: (socket: Socket) => (state: UserState) => void;
};
