export interface SessionState {
  id: string;
  state: Record<string, any>;
  // Plus besoin de currentRoom car c'est automatique
}

export interface SessionConflictData {
  deviceType: "web" | "mobile";
  message: string;
}

export interface ServerToClientEvents {
  stateUpdate: (state: SessionState) => void;
  sessionConflict: (data: SessionConflictData) => void;
  sessionTerminated: (data: { reason: string }) => void;
}

export interface ClientToServerEvents {
  updateState: (update: Partial<SessionState>) => void;
  forceConnect: () => void;
}