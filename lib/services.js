"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSocket = void 0;
const react_1 = require("react");
const socket_io_client_1 = require("socket.io-client");
const getDeviceType_1 = require("./getDeviceType");
const useSocket = (socketUrl, userId) => {
    const [state, setState] = (0, react_1.useState)(null);
    const [isConnected, setIsConnected] = (0, react_1.useState)(false);
    const [connectionError, setConnectionError] = (0, react_1.useState)(null);
    const socketRef = (0, react_1.useRef)(null);
    const deviceType = (0, getDeviceType_1.getDeviceType)(navigator.userAgent);
    (0, react_1.useEffect)(() => {
        const socket = (0, socket_io_client_1.io)(socketUrl, {
            transports: ["websocket"],
            timeout: 10000,
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 1000,
            query: {
                userId: userId,
                deviceType: deviceType
            }
        });
        socketRef.current = socket;
        socket.on("connect", () => {
            setIsConnected(true);
            setConnectionError(null);
        });
        socket.on("disconnect", () => {
            setIsConnected(false);
        });
        socket.on("stateUpdate", (newState) => {
            setState(newState);
        });
        socket.on("forceDisconnect", (data) => {
            console.warn("Force disconnected:", data.reason);
            setConnectionError(data.reason);
            setIsConnected(false);
        });
        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("stateUpdate");
            socket.off("forceDisconnect");
            socket.disconnect();
        };
    }, [socketUrl, userId]);
    const updateState = (0, react_1.useCallback)((update) => {
        var _a;
        if ((_a = socketRef.current) === null || _a === void 0 ? void 0 : _a.connected) {
            socketRef.current.emit("updateState", update);
        }
    }, []);
    return {
        state,
        isConnected,
        updateState,
        deviceType,
        connectionError
    };
};
exports.useSocket = useSocket;
