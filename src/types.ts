export interface SessionState {
  id: string;
  state: Record<string, any>;
  // Plus besoin de currentRoom car c'est automatique
}

export interface ServerToClientEvents {
  stateUpdate: (state: SessionState) => void;
}

export interface ClientToServerEvents {
  updateState: (update: Partial<SessionState>) => void;
}