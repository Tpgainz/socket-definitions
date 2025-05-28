export interface SessionState {
  id: string;
  state: Record<string, any>;
}

export interface ServerToClientEvents {
  stateUpdate: (state: SessionState) => void;
}

export interface ClientToServerEvents {
  updateState: (update: Partial<SessionState>) => void;
}