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
exports.CallServiceImpl = void 0;
const types_1 = require("./types");
class CallServiceImpl {
    constructor(transport, socketUrl, nativeService) {
        this.transport = transport;
        this.socketUrl = socketUrl;
        this.nativeService = nativeService;
        this._connectionState = {
            status: types_1.CONNECTION_EVENTS.DISCONNECTED,
            userId: null,
            platform: null,
        };
        this._callState = {
            session: null,
            status: types_1.CALL_EVENTS.CALL_ENDED,
        };
        this.connectionListeners = new Set();
        this.callListeners = new Set();
        this.setupTransportListeners();
        this.setupNativeListeners();
    }
    get connectionState() {
        return this._connectionState;
    }
    get callState() {
        return this._callState;
    }
    connect(userId, platform) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.updateConnectionState({
                    status: types_1.CONNECTION_EVENTS.RECONNECTING,
                    userId,
                    platform,
                });
                yield this.transport.connect(this.socketUrl);
                yield this.transport.send({
                    type: types_1.CONNECTION_EVENTS.CONNECTED,
                    payload: { userId, platform },
                    timestamp: Date.now(),
                });
                this.updateConnectionState({
                    status: types_1.CONNECTION_EVENTS.CONNECTED,
                    userId,
                    platform,
                });
            }
            catch (error) {
                this.updateConnectionState({
                    status: types_1.CONNECTION_EVENTS.ERROR,
                    error: error instanceof Error ? error.message : 'Connection failed',
                });
                throw error;
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.transport.disconnect();
            this.updateConnectionState({
                status: types_1.CONNECTION_EVENTS.DISCONNECTED,
                userId: null,
                platform: null,
            });
        });
    }
    initiateCall(request) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._connectionState.status !== types_1.CONNECTION_EVENTS.CONNECTED) {
                throw new Error('Not connected');
            }
            try {
                const session = {
                    id: `call_${Date.now()}`,
                    phoneNumber: request.phoneNumber,
                    initiatedAt: Date.now(),
                    platform: request.platform,
                };
                this.updateCallState({
                    session,
                    status: types_1.CALL_EVENTS.CALL_INITIATED,
                });
                if (request.platform !== 'web' && this.nativeService) {
                    yield this.nativeService.startCall(request.phoneNumber);
                }
                yield this.transport.send({
                    type: types_1.CALL_EVENTS.CALL_INITIATED,
                    payload: session,
                    timestamp: Date.now(),
                });
                this.updateCallState({
                    session,
                    status: types_1.CALL_EVENTS.CALL_RINGING,
                });
                return { success: true, session };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Call failed';
                this.updateCallState({
                    session: null,
                    status: types_1.CALL_EVENTS.CALL_FAILED,
                    error: errorMessage,
                });
                return { success: false, error: errorMessage };
            }
        });
    }
    endCall(request) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.nativeService) {
                yield this.nativeService.endCall(request.sessionId);
            }
            yield this.transport.send({
                type: types_1.CALL_EVENTS.CALL_ENDED,
                payload: { sessionId: request.sessionId, reason: request.reason },
                timestamp: Date.now(),
            });
            this.updateCallState({
                session: null,
                status: types_1.CALL_EVENTS.CALL_ENDED,
            });
        });
    }
    onConnectionChange(callback) {
        this.connectionListeners.add(callback);
        return () => this.connectionListeners.delete(callback);
    }
    onCallChange(callback) {
        this.callListeners.add(callback);
        return () => this.callListeners.delete(callback);
    }
    setupTransportListeners() {
        this.transport.onMessage((message) => {
            switch (message.type) {
                case types_1.CALL_EVENTS.CALL_INITIATED:
                    this.handleIncomingCall(message.payload);
                    break;
                case types_1.CALL_EVENTS.CALL_ENDED:
                    this.handleCallEnded();
                    break;
                case types_1.CONNECTION_EVENTS.DISCONNECTED:
                case 'connection:disconnected':
                    this.updateConnectionState({
                        status: types_1.CONNECTION_EVENTS.DISCONNECTED,
                        userId: null,
                        platform: null,
                    });
                    break;
                case 'tunnel:state_changed':
                    this.handleTunnelStateChange(message.payload);
                    break;
            }
        });
    }
    setupNativeListeners() {
        if (!this.nativeService)
            return;
        this.nativeService.onCallStateChange((event, sessionId) => {
            const currentSession = this._callState.session;
            if (!currentSession || currentSession.id !== sessionId)
                return;
            switch (event) {
                case types_1.CALL_EVENTS.CALL_ANSWERED:
                    this.updateCallState({
                        session: Object.assign(Object.assign({}, currentSession), { answeredAt: Date.now() }),
                        status: types_1.CALL_EVENTS.CALL_ANSWERED,
                    });
                    break;
                case types_1.CALL_EVENTS.CALL_ENDED:
                    this.updateCallState({
                        session: null,
                        status: types_1.CALL_EVENTS.CALL_ENDED,
                    });
                    break;
                case types_1.CALL_EVENTS.CALL_FAILED:
                    this.updateCallState({
                        session: null,
                        status: types_1.CALL_EVENTS.CALL_FAILED,
                        error: 'Native call failed',
                    });
                    break;
            }
        });
    }
    handleIncomingCall(session) {
        this.updateCallState({
            session,
            status: types_1.CALL_EVENTS.CALL_RINGING,
        });
    }
    handleCallEnded() {
        this.updateCallState({
            session: null,
            status: types_1.CALL_EVENTS.CALL_ENDED,
        });
    }
    updateConnectionState(updates) {
        this._connectionState = Object.assign(Object.assign({}, this._connectionState), updates);
        this.connectionListeners.forEach(listener => listener(this._connectionState));
    }
    handleTunnelStateChange(payload) {
        this.updateConnectionState({
            isTunneled: payload.isTunneled,
        });
    }
    updateCallState(updates) {
        this._callState = Object.assign(Object.assign({}, this._callState), updates);
        this.callListeners.forEach(listener => listener(this._callState));
    }
}
exports.CallServiceImpl = CallServiceImpl;
