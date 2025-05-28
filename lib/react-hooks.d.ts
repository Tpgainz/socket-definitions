import { CallState, Platform } from './types';
export declare function useCallService(socketUrl: string, platform: Platform, nativeService?: any): {
    connectionState: any;
    callState: any;
    connect: any;
    disconnect: any;
    initiateCall: any;
    endCall: any;
    isConnected: boolean;
    isInCall: boolean;
    isRinging: boolean;
};
export declare function useCallAudio(callState: CallState): void;
