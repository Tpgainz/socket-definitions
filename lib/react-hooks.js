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
exports.useCallAudio = exports.useCallService = void 0;
const react_1 = require("react");
const types_1 = require("./types");
const call_service_1 = require("./call-service");
const socket_transport_1 = require("./socket-transport");
const serviceCache = new Map();
function useCallService(socketUrl, platform, nativeService) {
    const [connectionState, setConnectionState] = (0, react_1.useState)({
        status: types_1.CONNECTION_EVENTS.DISCONNECTED,
        userId: null,
        platform: null,
    });
    const [callState, setCallState] = (0, react_1.useState)({
        session: null,
        status: types_1.CALL_EVENTS.CALL_ENDED,
    });
    const serviceRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (!serviceCache.has(socketUrl)) {
            const transport = new socket_transport_1.SocketTransportImpl();
            const service = new call_service_1.CallServiceImpl(transport, nativeService);
            serviceCache.set(socketUrl, service);
        }
        serviceRef.current = serviceCache.get(socketUrl);
        const service = serviceRef.current;
        setConnectionState(service.connectionState);
        setCallState(service.callState);
        const unsubscribeConnection = service.onConnectionChange(setConnectionState);
        const unsubscribeCall = service.onCallChange(setCallState);
        return () => {
            unsubscribeConnection();
            unsubscribeCall();
        };
    }, [socketUrl, nativeService]);
    const connect = (0, react_1.useCallback)((userId) => __awaiter(this, void 0, void 0, function* () {
        if (!serviceRef.current)
            return;
        yield serviceRef.current.connect(userId, platform);
    }), [platform]);
    const disconnect = (0, react_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
        if (!serviceRef.current)
            return;
        yield serviceRef.current.disconnect();
    }), []);
    const initiateCall = (0, react_1.useCallback)((phoneNumber) => __awaiter(this, void 0, void 0, function* () {
        if (!serviceRef.current)
            return { success: false, error: 'Service not available' };
        const request = { phoneNumber, platform };
        return yield serviceRef.current.initiateCall(request);
    }), [platform]);
    const endCall = (0, react_1.useCallback)((reason) => __awaiter(this, void 0, void 0, function* () {
        if (!serviceRef.current || !callState.session)
            return;
        const request = {
            sessionId: callState.session.id,
            reason
        };
        yield serviceRef.current.endCall(request);
    }), [callState.session]);
    return {
        connectionState,
        callState,
        connect,
        disconnect,
        initiateCall,
        endCall,
        isConnected: connectionState.status === types_1.CONNECTION_EVENTS.CONNECTED,
        isInCall: callState.status === types_1.CALL_EVENTS.CALL_ANSWERED,
        isRinging: callState.status === types_1.CALL_EVENTS.CALL_RINGING,
    };
}
exports.useCallService = useCallService;
function useCallAudio(callState) {
    const audioRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (typeof window === 'undefined')
            return;
        audioRef.current = new Audio('/ring.mp3');
        audioRef.current.loop = true;
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);
    (0, react_1.useEffect)(() => {
        const audio = audioRef.current;
        if (!audio)
            return;
        if (callState.status === types_1.CALL_EVENTS.CALL_RINGING) {
            audio.play().catch(console.error);
        }
        else {
            audio.pause();
            audio.currentTime = 0;
        }
    }, [callState.status]);
}
exports.useCallAudio = useCallAudio;
