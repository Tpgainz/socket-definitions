"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONNECTION_TYPE = exports.ERROR_CODES = exports.SOCKET_STATUS = exports.CALL_STATES = exports.SOCKET_EVENTS = void 0;
exports.SOCKET_EVENTS = {
    // Connection
    connect: "connect",
    connection: "connection",
    register: "register",
    disconnect: "disconnect",
    initiateCall: "initiateCall",
    endCall: "endCall",
    setState: "setState",
    connect_error: "connect_error",
};
exports.CALL_STATES = {
    CONNECTED: "connected",
    CALLING: "calling",
    DIALING: "dialing",
    FAILED: "failed",
    IDLE: "idle",
    OFFLINE: "offline",
};
exports.SOCKET_STATUS = {
    ERROR: "error",
    OFFLINE: "offline",
    REGISTERED: "registered",
    TUNNELLED: "tunnelled",
};
exports.ERROR_CODES = {
    BAD_REQUEST: 400,
    FORBIDDEN: 403,
    INTERNAL_SERVER_ERROR: 500,
    NOT_FOUND: 404,
    OK: 200,
    UNAUTHORIZED: 401,
};
exports.CONNECTION_TYPE = {
    ANDROID: "android",
    IOS: "ios",
    MOBILE: "mobile",
    WEB: "web",
};
