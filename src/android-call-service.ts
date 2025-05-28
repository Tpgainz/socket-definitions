import { NativeCallService, CallEvent, CALL_EVENTS } from './types';

export interface AndroidConnectionService {
  startOutgoingCall(phoneNumber: string): Promise<string>;
  endCall(callId: string): Promise<void>;
  onCallStateChanged(callback: (callId: string, state: string) => void): () => void;
}

export class AndroidCallService implements NativeCallService {
  private listeners = new Set<(event: CallEvent, sessionId: string) => void>();
  private connectionService: AndroidConnectionService;

  constructor(connectionService: AndroidConnectionService) {
    this.connectionService = connectionService;
    this.setupNativeListeners();
  }

  async startCall(phoneNumber: string): Promise<string> {
    try {
      const callId = await this.connectionService.startOutgoingCall(phoneNumber);
      return callId;
    } catch (error) {
      this.notifyListeners(CALL_EVENTS.CALL_FAILED, '');
      throw error;
    }
  }

  async endCall(sessionId: string): Promise<void> {
    await this.connectionService.endCall(sessionId);
  }

  onCallStateChange(callback: (event: CallEvent, sessionId: string) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private setupNativeListeners(): void {
    this.connectionService.onCallStateChanged((callId, state) => {
      let event: CallEvent;
      
      switch (state) {
        case 'DIALING':
          event = CALL_EVENTS.CALL_INITIATED;
          break;
        case 'RINGING':
          event = CALL_EVENTS.CALL_RINGING;
          break;
        case 'ACTIVE':
          event = CALL_EVENTS.CALL_ANSWERED;
          break;
        case 'DISCONNECTED':
          event = CALL_EVENTS.CALL_ENDED;
          break;
        default:
          event = CALL_EVENTS.CALL_FAILED;
      }

      this.notifyListeners(event, callId);
    });
  }

  private notifyListeners(event: CallEvent, sessionId: string): void {
    this.listeners.forEach(listener => listener(event, sessionId));
  }
}

export function createAndroidCallService(connectionService: AndroidConnectionService): AndroidCallService {
  return new AndroidCallService(connectionService);
} 