export type DeviceType = "web" | "mobile";

export interface SessionState {
  userId: string;
  call: CallState;
  isTunneled: boolean;
  error?: string;
}


export const CALL_EVENTS = {
    CALL_INITIATED: 'initiated',
    CALL_RINGING: 'ringing',
    CALL_ANSWERED: 'answered',
    CALL_ENDED: 'ended',
    CALL_FAILED: 'failed',
    CALL_ENDED_BY_USER: 'ended_by_user',
    CALL_ENDED_BY_TIMEOUT: 'ended_by_timeout',
    CALL_ENDED_BY_ERROR: 'ended_by_error',
  } as const;
  
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
  
  