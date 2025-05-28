import { AllEvents, EmitResponse, SocketEvent, ConnectionType, SocketState } from "./types";
export interface SocketActions {
    emit: <T extends keyof AllEvents>(event: T, data: Parameters<AllEvents[T]>[0], callback?: (response: EmitResponse) => void) => Promise<SocketState>;
    connect: (userId: string, connectionType: ConnectionType) => Promise<void>;
    disconnect: () => void;
    on: (event: SocketEvent, callback: (data: Parameters<AllEvents[keyof AllEvents]>[0]) => void) => () => void;
    resetError: () => void;
    updateState: (updates: Partial<SocketState>) => Promise<void>;
    initiateCall: (phoneNumber: string, callId?: string) => Promise<void>;
    endCall: (callId?: string, reason?: string) => Promise<void>;
}
type Store = SocketState & SocketActions & {
    _isUpdatingFromServer: boolean;
};
export declare const useSocket: (url: string) => Store;
export {};
