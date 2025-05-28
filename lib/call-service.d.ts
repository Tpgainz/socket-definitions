import { CallService, CallState, ConnectionState, CallRequest, CallResponse, EndCallRequest, Platform, SocketTransport, NativeCallService } from './types';
export declare class CallServiceImpl implements CallService {
    private transport;
    private socketUrl;
    private nativeService?;
    private _connectionState;
    private _callState;
    private connectionListeners;
    private callListeners;
    constructor(transport: SocketTransport, socketUrl: string, nativeService?: NativeCallService | undefined);
    get connectionState(): ConnectionState;
    get callState(): CallState;
    connect(userId: string, platform: Platform): Promise<void>;
    disconnect(): Promise<void>;
    initiateCall(request: CallRequest): Promise<CallResponse>;
    endCall(request: EndCallRequest): Promise<void>;
    onConnectionChange(callback: (state: ConnectionState) => void): () => void;
    onCallChange(callback: (state: CallState) => void): () => void;
    private setupTransportListeners;
    private setupNativeListeners;
    private handleIncomingCall;
    private handleCallEnded;
    private updateConnectionState;
    private handleTunnelStateChange;
    private updateCallState;
}
