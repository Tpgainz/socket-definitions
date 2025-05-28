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
exports.SocketTransportImpl = void 0;
const socket_io_client_1 = require("socket.io-client");
const types_1 = require("./types");
class SocketTransportImpl {
    constructor() {
        this.socket = null;
        this.messageListeners = new Set();
    }
    get isConnected() {
        var _a, _b;
        return (_b = (_a = this.socket) === null || _a === void 0 ? void 0 : _a.connected) !== null && _b !== void 0 ? _b : false;
    }
    connect(url) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if ((_a = this.socket) === null || _a === void 0 ? void 0 : _a.connected) {
                return;
            }
            return new Promise((resolve, reject) => {
                this.socket = (0, socket_io_client_1.io)(url, {
                    transports: ['websocket'],
                    timeout: 10000,
                    reconnection: true,
                    reconnectionAttempts: 3,
                    reconnectionDelay: 1000,
                });
                const timeout = setTimeout(() => {
                    reject(new Error('Connection timeout'));
                }, 15000);
                this.socket.on('connect', () => {
                    clearTimeout(timeout);
                    this.setupMessageHandling();
                    // Wait longer and verify multiple times to ensure socket is truly ready
                    const verifyConnection = (attempts = 0) => {
                        var _a;
                        if (attempts >= 10) {
                            reject(new Error('Socket connection verification failed after multiple attempts'));
                            return;
                        }
                        if ((_a = this.socket) === null || _a === void 0 ? void 0 : _a.connected) {
                            resolve();
                        }
                        else {
                            setTimeout(() => verifyConnection(attempts + 1), 20);
                        }
                    };
                    setTimeout(() => verifyConnection(), 50);
                });
                this.socket.on('connect_error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            });
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.socket) {
                this.socket.disconnect();
                this.socket = null;
            }
        });
    }
    send(message) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            // Wait longer for socket to be ready if it's not immediately connected
            let retries = 0;
            const maxRetries = 20;
            while (!((_a = this.socket) === null || _a === void 0 ? void 0 : _a.connected) && retries < maxRetries) {
                if (!this.socket) {
                    throw new Error('Socket not initialized');
                }
                yield new Promise(resolve => setTimeout(resolve, 50));
                retries++;
            }
            if (!((_b = this.socket) === null || _b === void 0 ? void 0 : _b.connected)) {
                throw new Error(`Socket not connected after ${maxRetries} retries`);
            }
            return new Promise((resolve, reject) => {
                const sendTimeout = setTimeout(() => {
                    reject(new Error('Send timeout'));
                }, 5000);
                this.socket.emit('message', message, (response) => {
                    clearTimeout(sendTimeout);
                    if (response.success) {
                        resolve();
                    }
                    else {
                        reject(new Error(response.error || 'Send failed'));
                    }
                });
            });
        });
    }
    onMessage(callback) {
        const typedCallback = callback;
        this.messageListeners.add(typedCallback);
        return () => this.messageListeners.delete(typedCallback);
    }
    setupMessageHandling() {
        if (!this.socket)
            return;
        this.socket.on('message', (message) => {
            this.messageListeners.forEach(listener => listener(message));
        });
        this.socket.on('disconnect', () => {
            this.messageListeners.forEach(listener => listener({
                type: types_1.CONNECTION_EVENTS.DISCONNECTED,
                payload: {},
                timestamp: Date.now(),
            }));
        });
    }
}
exports.SocketTransportImpl = SocketTransportImpl;
