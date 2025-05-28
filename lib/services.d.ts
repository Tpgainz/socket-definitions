import { UserState } from "./types";
export declare const useSocket: (socketUrl: string, userId: string) => {
    state: UserState | null;
    isConnected: boolean;
    updateUserState: (update: Partial<UserState>) => void;
};
