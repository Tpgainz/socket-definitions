import { CallState, ConnectionState, Platform } from './types';
export declare function useCallService(socketUrl: string, platform: Platform, nativeService?: any): {
    connectionState: ConnectionState;
    callState: CallState;
    connect: (userId: string) => Promise<void>;
    disconnect: () => Promise<void>;
    initiateCall: (phoneNumber: string) => Promise<import("./types").CallResponse>;
    endCall: (reason?: 'user' | 'timeout' | 'error') => Promise<void>;
    isConnected: boolean;
    isInCall: boolean;
    isRinging: boolean;
};
export declare function useCallAudio(callState: CallState): void;
