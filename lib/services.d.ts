import { SessionState } from "./types";
export declare const useSocket: (socketUrl: string, userId: string) => {
    state: SessionState | null;
    isConnected: boolean;
    updateState: (update: Partial<SessionState>) => void;
};
