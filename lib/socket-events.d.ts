import { MergeTypes, OneOf } from "./helpers";
export declare const SOCKET_EVENTS: {
    readonly connect: "connect";
    readonly connection: "connection";
    readonly register: "register";
    readonly disconnect: "disconnect";
    readonly initiateCall: "initiateCall";
    readonly endCall: "endCall";
    readonly setState: "setState";
    readonly connect_error: "connect_error";
};
export declare const CALL_STATES: {
    readonly CONNECTED: "connected";
    readonly CALLING: "calling";
    readonly DIALING: "dialing";
    readonly FAILED: "failed";
    readonly IDLE: "idle";
    readonly OFFLINE: "offline";
};
export declare const SOCKET_STATUS: {
    readonly ERROR: "error";
    readonly OFFLINE: "offline";
    readonly REGISTERED: "registered";
    readonly TUNNELLED: "tunnelled";
};
export declare const ERROR_CODES: {
    readonly BAD_REQUEST: 400;
    readonly FORBIDDEN: 403;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly NOT_FOUND: 404;
    readonly OK: 200;
    readonly UNAUTHORIZED: 401;
};
export declare const CONNECTION_TYPE: {
    readonly ANDROID: "android";
    readonly IOS: "ios";
    readonly MOBILE: "mobile";
    readonly WEB: "web";
};
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
export type SocketEvent = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];
export type CallStatus = typeof CALL_STATES[keyof typeof CALL_STATES];
export type SocketStatus = typeof SOCKET_STATUS[keyof typeof SOCKET_STATUS];
export type ConnectionType = typeof CONNECTION_TYPE[keyof typeof CONNECTION_TYPE];
export interface BaseSocketResponse {
    success: boolean;
    code?: ErrorCode;
}
export interface SocketState {
    socketStatus?: SocketStatus;
    callStatus?: CallStatus;
    isLoading?: boolean;
    error?: string | null;
}
export interface RegisterResponse extends SocketState, BaseSocketResponse {
}
export interface CallResponse extends SocketState, BaseSocketResponse {
}
export interface StateResponse extends SocketState, BaseSocketResponse {
}
export type EmitResponse = OneOf<[RegisterResponse, CallResponse, StateResponse]>;
export interface RegisterParams {
    userId: string;
    type: ConnectionType;
    socketId: string;
}
export interface CallParams {
    targetPhoneNumber: string;
}
export interface Emit {
    [SOCKET_EVENTS.register]: (data: RegisterParams, callback: (data: RegisterResponse) => void) => void;
    [SOCKET_EVENTS.initiateCall]: (data: CallParams, callback: (data: CallResponse) => void) => void;
    [SOCKET_EVENTS.endCall]: (data: CallParams, callback: (data: CallResponse) => void) => void;
    [SOCKET_EVENTS.setState]: (data: SocketState, callback: (data: StateResponse) => void) => void;
}
export interface SocketListeners {
    [SOCKET_EVENTS.connect]: () => void;
    [SOCKET_EVENTS.disconnect]: () => void;
    [SOCKET_EVENTS.register]: (data: RegisterResponse) => void;
    [SOCKET_EVENTS.initiateCall]: (data: CallResponse) => void;
    [SOCKET_EVENTS.endCall]: (data: CallResponse) => void;
    [SOCKET_EVENTS.setState]: (data: StateResponse) => void;
    [SOCKET_EVENTS.connect_error]: (data: {
        error: string;
    }) => void;
}
export type AllEvents = MergeTypes<[SocketListeners, Emit]>;
