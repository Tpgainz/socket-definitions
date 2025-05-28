import { NativeCallService, CallEvent } from './types';
export interface AndroidConnectionService {
    startOutgoingCall(phoneNumber: string): Promise<string>;
    endCall(callId: string): Promise<void>;
    onCallStateChanged(callback: (callId: string, state: string) => void): () => void;
}
export declare class AndroidCallService implements NativeCallService {
    private listeners;
    private connectionService;
    constructor(connectionService: AndroidConnectionService);
    startCall(phoneNumber: string): Promise<string>;
    endCall(sessionId: string): Promise<void>;
    onCallStateChange(callback: (event: CallEvent, sessionId: string) => void): () => void;
    private setupNativeListeners;
    private notifyListeners;
}
export declare function createAndroidCallService(connectionService: AndroidConnectionService): AndroidCallService;
