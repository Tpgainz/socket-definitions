import { SessionState } from "./types/call";
export declare const useSocket: (socketUrl: string, userId: string) => {
    state: SessionState | null;
    isConnected: boolean;
    updateState: (update: Partial<SessionState>) => void;
};
