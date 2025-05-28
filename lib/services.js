"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSocket = void 0;
const react_1 = require("react");
const socket_io_client_1 = require("socket.io-client");
const useSocket = (socketUrl, userId) => {
    const [state, setState] = (0, react_1.useState)(null);
    const [isConnected, setIsConnected] = (0, react_1.useState)(false);
    const socketRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        // Créer la connexion avec l'userId
        const socket = (0, socket_io_client_1.io)(socketUrl, {
            transports: ["websocket"],
            timeout: 10000,
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 1000,
            query: {
                userId: userId
            }
        });
        socketRef.current = socket;
        // Événements de connexion
        socket.on("connect", () => {
            setIsConnected(true);
        });
        socket.on("disconnect", () => {
            setIsConnected(false);
        });
        // Écouter les mises à jour d'état
        socket.on("stateUpdate", (newState) => {
            setState(newState);
        });
        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("stateUpdate");
            socket.disconnect();
        };
    }, [socketUrl, userId]);
    const updateUserState = (0, react_1.useCallback)((update) => {
        var _a;
        if ((_a = socketRef.current) === null || _a === void 0 ? void 0 : _a.connected) {
            socketRef.current.emit("updateState", update);
        }
    }, []);
    return {
        state,
        isConnected,
        updateUserState,
    };
};
exports.useSocket = useSocket;
