"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLATFORM = exports.SOCKET_STATUS = exports.CONNECTION_EVENTS = exports.CALL_EVENTS = void 0;
exports.CALL_EVENTS = {
    CALL_INITIATED: 'initiated',
    CALL_RINGING: 'ringing',
    CALL_ANSWERED: 'answered',
    CALL_ENDED: 'ended',
    CALL_FAILED: 'failed',
};
exports.CONNECTION_EVENTS = {
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    RECONNECTING: 'reconnecting',
    ERROR: 'error',
};
exports.SOCKET_STATUS = {
    ERROR: "error",
    OFFLINE: "offline",
    REGISTERED: "registered",
    TUNNELLED: "tunnelled",
};
exports.PLATFORM = {
    ANDROID: "android",
    IOS: "ios",
    MOBILE: "mobile",
    WEB: "web",
};
