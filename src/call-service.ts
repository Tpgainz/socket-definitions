import {
  CallService,
  CallState,
  ConnectionState,
  CallRequest,
  CallResponse,
  EndCallRequest,
  Platform,
  CALL_EVENTS,
  CONNECTION_EVENTS,
  CallSession,
  SocketTransport,
  NativeCallService,
} from './types';

export class CallServiceImpl implements CallService {
  private _connectionState: ConnectionState = {
    status: CONNECTION_EVENTS.DISCONNECTED,
    userId: null,
    platform: null,
  };

  private _callState: CallState = {
    session: null,
    status: CALL_EVENTS.CALL_ENDED,
  };

  private connectionListeners = new Set<(state: ConnectionState) => void>();
  private callListeners = new Set<(state: CallState) => void>();

  constructor(
    private transport: SocketTransport,
    private socketUrl: string,
    private nativeService?: NativeCallService
  ) {
    this.setupTransportListeners();
    this.setupNativeListeners();
  }

  get connectionState(): ConnectionState {
    return this._connectionState;
  }

  get callState(): CallState {
    return this._callState;
  }

  async connect(userId: string, platform: Platform): Promise<void> {
    try {
      this.updateConnectionState({
        status: CONNECTION_EVENTS.RECONNECTING,
        userId,
        platform,
      });

      await this.transport.connect(this.socketUrl);

      await this.transport.send({
        type: CONNECTION_EVENTS.CONNECTED,
        payload: { userId, platform },
        timestamp: Date.now(),
      });

      this.updateConnectionState({
        status: CONNECTION_EVENTS.CONNECTED,
        userId,
        platform,
      });
    } catch (error) {
      this.updateConnectionState({
        status: CONNECTION_EVENTS.ERROR,
        error: error instanceof Error ? error.message : 'Connection failed',
      });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.transport.disconnect();
    this.updateConnectionState({
      status: CONNECTION_EVENTS.DISCONNECTED,
      userId: null,
      platform: null,
    });
  }

  async initiateCall(request: CallRequest): Promise<CallResponse> {
    if (this._connectionState.status !== CONNECTION_EVENTS.CONNECTED) {
      throw new Error('Not connected');
    }

    try {
      const session: CallSession = {
        id: `call_${Date.now()}`,
        phoneNumber: request.phoneNumber,
        initiatedAt: Date.now(),
        platform: request.platform,
      };

      this.updateCallState({
        session,
        status: CALL_EVENTS.CALL_INITIATED,
      });

      if (request.platform !== 'web' && this.nativeService) {
        await this.nativeService.startCall(request.phoneNumber);
      }

      await this.transport.send({
        type: CALL_EVENTS.CALL_INITIATED,
        payload: session,
        timestamp: Date.now(),
      });

      this.updateCallState({
        session,
        status: CALL_EVENTS.CALL_RINGING,
      });

      return { success: true, session };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Call failed';
      this.updateCallState({
        session: null,
        status: CALL_EVENTS.CALL_FAILED,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }

  async endCall(request: EndCallRequest): Promise<void> {
    if (this.nativeService) {
      await this.nativeService.endCall(request.sessionId);
    }

    await this.transport.send({
      type: CALL_EVENTS.CALL_ENDED,
      payload: { sessionId: request.sessionId, reason: request.reason },
      timestamp: Date.now(),
    });

    this.updateCallState({
      session: null,
      status: CALL_EVENTS.CALL_ENDED,
    });
  }

  onConnectionChange(callback: (state: ConnectionState) => void): () => void {
    this.connectionListeners.add(callback);
    return () => this.connectionListeners.delete(callback);
  }

  onCallChange(callback: (state: CallState) => void): () => void {
    this.callListeners.add(callback);
    return () => this.callListeners.delete(callback);
  }

  private setupTransportListeners(): void {
    this.transport.onMessage((message) => {
      switch (message.type) {
        case CALL_EVENTS.CALL_INITIATED:
          this.handleIncomingCall(message.payload as CallSession);
          break;
        case CALL_EVENTS.CALL_ENDED:
          this.handleCallEnded();
          break;
        case CONNECTION_EVENTS.DISCONNECTED:
          this.updateConnectionState({
            status: CONNECTION_EVENTS.DISCONNECTED,
            userId: null,
            platform: null,
          });
          break;
      }
    });
  }

  private setupNativeListeners(): void {
    if (!this.nativeService) return;

    this.nativeService.onCallStateChange((event, sessionId) => {
      const currentSession = this._callState.session;
      if (!currentSession || currentSession.id !== sessionId) return;

      switch (event) {
        case CALL_EVENTS.CALL_ANSWERED:
          this.updateCallState({
            session: { ...currentSession, answeredAt: Date.now() },
            status: CALL_EVENTS.CALL_ANSWERED,
          });
          break;
        case CALL_EVENTS.CALL_ENDED:
          this.updateCallState({
            session: null,
            status: CALL_EVENTS.CALL_ENDED,
          });
          break;
        case CALL_EVENTS.CALL_FAILED:
          this.updateCallState({
            session: null,
            status: CALL_EVENTS.CALL_FAILED,
            error: 'Native call failed',
          });
          break;
      }
    });
  }

  private handleIncomingCall(session: CallSession): void {
    this.updateCallState({
      session,
      status: CALL_EVENTS.CALL_RINGING,
    });
  }

  private handleCallEnded(): void {
    this.updateCallState({
      session: null,
      status: CALL_EVENTS.CALL_ENDED,
    });
  }

  private updateConnectionState(updates: Partial<ConnectionState>): void {
    this._connectionState = { ...this._connectionState, ...updates };
    this.connectionListeners.forEach(listener => listener(this._connectionState));
  }

  private updateCallState(updates: Partial<CallState>): void {
    this._callState = { ...this._callState, ...updates };
    this.callListeners.forEach(listener => listener(this._callState));
  }
} 