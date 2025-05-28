export declare const CALL_EVENTS: {
    readonly CALL_INITIATED: "initiated";
    readonly CALL_RINGING: "ringing";
    readonly CALL_ANSWERED: "answered";
    readonly CALL_ENDED: "ended";
    readonly CALL_FAILED: "failed";
};
export declare const CONNECTION_EVENTS: {
    readonly CONNECTED: "connected";
    readonly DISCONNECTED: "disconnected";
    readonly RECONNECTING: "reconnecting";
    readonly ERROR: "error";
};
export declare const SOCKET_STATUS: {
    readonly ERROR: "error";
    readonly OFFLINE: "offline";
    readonly REGISTERED: "registered";
    readonly TUNNELLED: "tunnelled";
};
export declare const PLATFORM: {
    readonly ANDROID: "android";
    readonly IOS: "ios";
    readonly MOBILE: "mobile";
    readonly WEB: "web";
};
export type CallEvent = typeof CALL_EVENTS[keyof typeof CALL_EVENTS];
export type ConnectionEvent = typeof CONNECTION_EVENTS[keyof typeof CONNECTION_EVENTS];
export type Platform = typeof PLATFORM[keyof typeof PLATFORM];
export type SocketStatus = typeof SOCKET_STATUS[keyof typeof SOCKET_STATUS];
export interface CallSession {
    readonly id: string;
    readonly phoneNumber: string;
    readonly initiatedAt: number;
    readonly answeredAt?: number;
    readonly endedAt?: number;
    readonly platform: Platform;
}
export interface CallState {
    readonly session: CallSession | null;
    readonly status: CallEvent;
    readonly error?: string;
}
export interface ConnectionState {
    readonly status: ConnectionEvent;
    readonly userId: string | null;
    readonly platform: Platform | null;
    readonly error?: string;
    readonly isTunneled?: boolean;
}
export interface CallRequest {
    readonly phoneNumber: string;
    readonly platform: Platform;
}
export interface CallResponse {
    readonly success: boolean;
    readonly session?: CallSession;
    readonly error?: string;
}
export interface EndCallRequest {
    readonly sessionId: string;
    readonly reason?: 'user' | 'timeout' | 'error';
}
export interface SocketMessage<T = unknown> {
    readonly type: string;
    readonly payload: T;
    readonly timestamp: number;
}
export interface CallService {
    readonly connectionState: ConnectionState;
    readonly callState: CallState;
    connect(userId: string, platform: Platform): Promise<void>;
    disconnect(): Promise<void>;
    initiateCall(request: CallRequest): Promise<CallResponse>;
    endCall(request: EndCallRequest): Promise<void>;
    onConnectionChange(callback: (state: ConnectionState) => void): () => void;
    onCallChange(callback: (state: CallState) => void): () => void;
}
export interface NativeCallService {
    startCall(phoneNumber: string): Promise<string>;
    endCall(sessionId: string): Promise<void>;
    onCallStateChange(callback: (event: CallEvent, sessionId: string) => void): () => void;
}
export interface SocketTransport {
    connect(url: string): Promise<void>;
    disconnect(): Promise<void>;
    send<T = unknown>(message: SocketMessage<T>): Promise<void>;
    onMessage<T = unknown>(callback: (message: SocketMessage<T>) => void): () => void;
    readonly isConnected: boolean;
}
export interface ServerToClientEvents {
    message: (message: SocketMessage) => void;
}
export interface ClientToServerEvents {
    message: (message: SocketMessage, callback: (response: {
        success: boolean;
        error?: string;
    }) => void) => void;
}
export interface InterServerEvents {
    ping: () => void;
}
export interface SocketData {
    userId?: string;
    platform?: Platform;
}
