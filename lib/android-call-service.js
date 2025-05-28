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
exports.createAndroidCallService = exports.AndroidCallService = void 0;
const types_1 = require("./types");
class AndroidCallService {
    constructor(connectionService) {
        this.listeners = new Set();
        this.connectionService = connectionService;
        this.setupNativeListeners();
    }
    startCall(phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const callId = yield this.connectionService.startOutgoingCall(phoneNumber);
                return callId;
            }
            catch (error) {
                this.notifyListeners(types_1.CALL_EVENTS.CALL_FAILED, '');
                throw error;
            }
        });
    }
    endCall(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectionService.endCall(sessionId);
        });
    }
    onCallStateChange(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }
    setupNativeListeners() {
        this.connectionService.onCallStateChanged((callId, state) => {
            let event;
            switch (state) {
                case 'DIALING':
                    event = types_1.CALL_EVENTS.CALL_INITIATED;
                    break;
                case 'RINGING':
                    event = types_1.CALL_EVENTS.CALL_RINGING;
                    break;
                case 'ACTIVE':
                    event = types_1.CALL_EVENTS.CALL_ANSWERED;
                    break;
                case 'DISCONNECTED':
                    event = types_1.CALL_EVENTS.CALL_ENDED;
                    break;
                default:
                    event = types_1.CALL_EVENTS.CALL_FAILED;
            }
            this.notifyListeners(event, callId);
        });
    }
    notifyListeners(event, sessionId) {
        this.listeners.forEach(listener => listener(event, sessionId));
    }
}
exports.AndroidCallService = AndroidCallService;
function createAndroidCallService(connectionService) {
    return new AndroidCallService(connectionService);
}
exports.createAndroidCallService = createAndroidCallService;
