export type DeviceType = "web" | "mobile";
export interface SessionState {
    id: string;
    state: State;
}
type State = {
    call: CallState;
    isTunneled: boolean;
    error?: string;
};
export declare const CALL_EVENTS: {
    readonly CALL_INITIATED: "initiated";
    readonly CALL_RINGING: "ringing";
    readonly CALL_ANSWERED: "answered";
    readonly CALL_ENDED: "ended";
    readonly CALL_FAILED: "failed";
    readonly CALL_ENDED_BY_USER: "ended_by_user";
    readonly CALL_ENDED_BY_TIMEOUT: "ended_by_timeout";
    readonly CALL_ENDED_BY_ERROR: "ended_by_error";
};
export type CallEvent = typeof CALL_EVENTS[keyof typeof CALL_EVENTS];
export interface CallSession {
    readonly id: string;
    readonly phoneNumber: string;
    readonly initiatedAt: number;
    readonly answeredAt?: number;
    readonly endedAt?: number;
    readonly error?: string;
}
export interface CallState {
    readonly session: CallSession | null;
    readonly status: CallEvent;
    readonly error?: string;
}
export {};
