"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSocket = void 0;
const types_1 = require("./types");
const socket_io_client_1 = require("socket.io-client");
const zustand_1 = require("zustand");
// Store instances cache to prevent creating multiple stores for the same URL
const storeCache = new Map();
const createSocketStore = (url) => {
    return (0, zustand_1.create)((set, get) => ({
        socket: null,
        error: null,
        isConnected: false,
        isConnecting: false,
        lastEvent: null,
        socketStatus: types_1.SOCKET_STATUS.OFFLINE,
        userId: null,
        connectionType: null,
        _isUpdatingFromServer: false,
        callState: {
            callId: undefined,
            phoneNumber: undefined,
            status: types_1.CALL_STATES.IDLE,
            startTime: undefined,
            endTime: undefined,
            error: undefined
        },
        emit: (event, data, callback) => __awaiter(void 0, void 0, void 0, function* () {
            const { socket } = get();
            if (!socket) {
                const errorMsg = "Socket not connected";
                set({ error: errorMsg });
                return Promise.reject(new Error(errorMsg));
            }
            set({ lastEvent: { type: event, data } });
            return new Promise((resolve, reject) => {
                socket.emit(event, data, (response, code) => {
                    if (response.error) {
                        set({ error: response.error });
                        if (callback)
                            callback(response);
                        reject(new Error(response.error));
                        return;
                    }
                    if (response.callState) {
                        set(state => {
                            var _a;
                            return ({
                                callState: Object.assign(Object.assign({}, state.callState), { status: (_a = response.callState.status) !== null && _a !== void 0 ? _a : "failed" })
                            });
                        });
                    }
                    if (response.socketStatus) {
                        set({ socketStatus: response.socketStatus });
                    }
                    set({ error: null });
                    if (callback)
                        callback(response);
                    resolve(response);
                });
            });
        }),
        connect: (userId, connectionType) => __awaiter(void 0, void 0, void 0, function* () {
            const { socket, isConnecting } = get();
            if (socket === null || socket === void 0 ? void 0 : socket.connected) {
                return Promise.resolve();
            }
            if (isConnecting) {
                return Promise.resolve();
            }
            return new Promise((resolve, reject) => {
                set({ isConnecting: true, userId, connectionType });
                const newSocket = (0, socket_io_client_1.io)(url, {
                    transports: ["websocket"],
                    timeout: 10000,
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                });
                const connectionTimeout = setTimeout(() => {
                    if (!get().isConnected) {
                        set({
                            error: "Connection timeout",
                            isConnecting: false,
                            socketStatus: types_1.SOCKET_STATUS.OFFLINE
                        });
                        newSocket.disconnect();
                        reject(new Error("Connection timeout"));
                    }
                }, 15000);
                newSocket
                    .on(types_1.SOCKET_EVENTS.connect, () => {
                    clearTimeout(connectionTimeout);
                    set({
                        socket: newSocket,
                        error: null,
                        isConnected: true,
                        isConnecting: false,
                        socketStatus: types_1.SOCKET_STATUS.REGISTERED
                    });
                    // Auto-register on connect
                    const { emit } = get();
                    emit(types_1.SOCKET_EVENTS.register, {
                        userId,
                        type: connectionType,
                        socketId: newSocket.id || ''
                    }).catch(err => {
                        set({ error: `Registration failed: ${err.message}` });
                    });
                    resolve();
                })
                    .on(types_1.SOCKET_EVENTS.setState, (data) => {
                    console.log("Received setState from server:", data);
                    const currentState = get();
                    if (currentState._isUpdatingFromServer) {
                        return;
                    }
                    set({ _isUpdatingFromServer: true });
                    const updates = {};
                    if (data.socketStatus) {
                        updates.socketStatus = data.socketStatus;
                    }
                    if (data.callState) {
                        updates.callState = Object.assign(Object.assign({}, currentState.callState), { status: data.callState.status });
                    }
                    if (data.error) {
                        updates.error = data.error;
                    }
                    set(Object.assign(Object.assign({}, updates), { _isUpdatingFromServer: false }));
                })
                    .on(types_1.SOCKET_EVENTS.callStateChanged, (data) => {
                    console.log("Received callStateChanged from server:", data);
                    const currentState = get();
                    if (currentState._isUpdatingFromServer) {
                        return;
                    }
                    set({ _isUpdatingFromServer: true });
                    const updates = {};
                    if (data.socketStatus) {
                        updates.socketStatus = data.socketStatus;
                    }
                    if (data.callState) {
                        updates.callState = data.callState;
                    }
                    if (data.error) {
                        updates.error = data.error;
                    }
                    set(Object.assign(Object.assign({}, updates), { _isUpdatingFromServer: false }));
                })
                    .on(types_1.SOCKET_EVENTS.disconnect, () => {
                    set({
                        socket: null,
                        isConnected: false,
                        error: "Socket disconnected",
                        socketStatus: types_1.SOCKET_STATUS.OFFLINE,
                        callState: {
                            callId: undefined,
                            phoneNumber: undefined,
                            status: types_1.CALL_STATES.IDLE,
                            startTime: undefined,
                            endTime: undefined,
                            error: undefined
                        }
                    });
                })
                    .on(types_1.SOCKET_EVENTS.connect_error, (err) => {
                    clearTimeout(connectionTimeout);
                    set({
                        error: `Connection error: ${err.message}`,
                        isConnecting: false,
                        socketStatus: types_1.SOCKET_STATUS.ERROR
                    });
                    newSocket.disconnect();
                    reject(err);
                });
                // Don't set the socket in the store until it's actually connected
            });
        }),
        disconnect: () => {
            const { socket } = get();
            if (socket) {
                socket.disconnect();
                set({
                    socket: null,
                    error: null,
                    isConnected: false,
                    socketStatus: types_1.SOCKET_STATUS.OFFLINE,
                    callState: {
                        callId: undefined,
                        phoneNumber: undefined,
                        status: types_1.CALL_STATES.IDLE,
                        startTime: undefined,
                        endTime: undefined,
                        error: undefined
                    }
                });
            }
        },
        on: (event, callback) => {
            const { socket } = get();
            if (!socket) {
                console.warn(`Attempted to register listener for '${String(event)}' but socket is not connected`);
                return () => { };
            }
            socket.on(event, callback);
            return () => {
                if (socket) {
                    socket.off(event, callback);
                }
            };
        },
        resetError: () => {
            set({ error: null });
        },
        updateState: (updates) => {
            return new Promise((resolve, reject) => {
                try {
                    const currentState = get();
                    if (currentState._isUpdatingFromServer) {
                        set(updates);
                        resolve();
                        return;
                    }
                    set(updates);
                    resolve();
                }
                catch (error) {
                    set({ error: error instanceof Error ? error.message : 'Failed to update state' });
                    reject(error);
                }
            });
        },
        initiateCall: (phoneNumber, callId) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const generatedCallId = callId || Date.now().toString();
                // Update local state immediately for better UX
                set({
                    callState: {
                        status: types_1.CALL_STATES.CALLING,
                        callId: generatedCallId,
                        phoneNumber,
                        startTime: new Date().getTime(),
                        endTime: undefined,
                        error: undefined,
                    },
                    socketStatus: types_1.SOCKET_STATUS.TUNNELLED,
                });
                // Emit to server
                yield get().emit(types_1.SOCKET_EVENTS.initiateCall, {
                    phoneNumber,
                    callId: generatedCallId,
                });
            }
            catch (error) {
                // Revert on error
                set({
                    callState: {
                        status: types_1.CALL_STATES.IDLE,
                        callId: undefined,
                        phoneNumber: undefined,
                        startTime: undefined,
                        endTime: undefined,
                        error: error instanceof Error ? error.message : "Call failed",
                    },
                });
                throw error;
            }
        }),
        endCall: (callId, reason) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                // Update local state immediately - keep socket tunnelled
                set({
                    callState: {
                        status: types_1.CALL_STATES.IDLE,
                        callId: undefined,
                        phoneNumber: undefined,
                        startTime: undefined,
                        endTime: new Date().getTime(),
                        error: undefined,
                    },
                });
                // Emit to server
                yield get().emit(types_1.SOCKET_EVENTS.endCall, {
                    callId,
                    reason,
                });
            }
            catch (error) {
                console.error("Failed to end call:", error);
                throw error;
            }
        })
    }));
};
const useSocket = (url) => {
    // Get or create store for this URL
    if (!storeCache.has(url)) {
        storeCache.set(url, createSocketStore(url));
    }
    const store = storeCache.get(url);
    return store();
};
exports.useSocket = useSocket;
