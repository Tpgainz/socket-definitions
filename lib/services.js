"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSocket = void 0;
const react_1 = require("react");
const socket_io_client_1 = require("socket.io-client");
//Deisgned to be used in the web app and the mobile app and simple to use
//const {emit,state} = useSocket()
const useSocket = (socketUrl) => {
    const [state, setState] = (0, react_1.useState)(null);
    //Handle the connection to the server socket
    (0, react_1.useEffect)(() => {
        const socket = (0, socket_io_client_1.io)(socketUrl, {
            transports: ["websocket"],
            timeout: 10000,
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 1000,
        });
        socket.on("stateUpdate", (state) => {
            setState(state);
        });
        return () => {
            socket.off("stateUpdate");
        };
    }, []);
    return {
        state,
        updateUserState,
    };
};
exports.useSocket = useSocket;
const updateUserState = (socket) => (state) => {
    socket.emit("updateUserState", { state });
};
